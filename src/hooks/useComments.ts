'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Comment, CommentsResponse, StatsResponse, FilterOptions } from '@/types/comment';

export function useComments() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;
  const search = searchParams.get('search') || '';
  const scoreMin = searchParams.get('scoreMin') || '';
  const scoreMax = searchParams.get('scoreMax') || '';
  const star = searchParams.get('star') || '';
  const roomType = searchParams.get('roomType') || '';
  const travelType = searchParams.get('travelType') || '';
  const category = searchParams.get('category') || '';

  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (search) params.set('search', search);
    if (scoreMin) params.set('scoreMin', scoreMin);
    if (scoreMax) params.set('scoreMax', scoreMax);
    if (star) params.set('star', star);
    if (roomType) params.set('roomType', roomType);
    if (travelType) params.set('travelType', travelType);
    if (category) params.set('category', category);
    return params.toString();
  }, [page, search, scoreMin, scoreMax, star, roomType, travelType, category]);

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const openImageViewer = useCallback((images: string[], index: number = 0) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewerOpen(false);
  }, []);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  }, [currentImages.length]);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  }, [currentImages.length]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const query = buildQueryString();
        const [commentsRes, statsRes, filtersRes] = await Promise.all([
          fetch(`/api/comments?${query}`),
          fetch(`/api/comments/stats?${query}`),
          fetch('/api/filters'),
        ]);

        if (commentsRes.ok) {
          const commentsData: CommentsResponse = await commentsRes.json();
          setComments(commentsData.data);
          setPagination(commentsData.pagination);
        }

        if (statsRes.ok) {
          const statsData: StatsResponse = await statsRes.json();
          setStats(statsData);
        }

        if (filtersRes.ok) {
          const filtersData: FilterOptions = await filtersRes.json();
          setFilterOptions(filtersData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [buildQueryString]);

  return {
    comments,
    pagination,
    stats,
    filterOptions,
    loading,
    filters: {
      search,
      scoreMin,
      scoreMax,
      star,
      roomType,
      travelType,
      category,
    },
    updateFilter,
    clearFilters,
    imageViewerOpen,
    currentImages,
    currentImageIndex,
    openImageViewer,
    closeImageViewer,
    goToNextImage,
    goToPrevImage,
  };
}
