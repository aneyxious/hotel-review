'use client';

import { Suspense } from 'react';
import { Hotel } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import CategoryFilter from '@/components/CategoryFilter';
import CommentList from '@/components/CommentList';
import StatsPanel from '@/components/StatsPanel';
import ImageViewer from '@/components/ImageViewer';

function CommentPageContent() {
  const {
    comments,
    pagination,
    stats,
    filterOptions,
    loading,
    filters,
    updateFilter,
    clearFilters,
    imageViewerOpen,
    currentImages,
    currentImageIndex,
    openImageViewer,
    closeImageViewer,
    goToNextImage,
    goToPrevImage,
  } = useComments();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Hotel className="w-7 h-7 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">花园酒店评论浏览</h1>
            <p className="text-xs text-slate-500">住客评论数据洞察</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-4">
            <SearchBar
              value={filters.search}
              onSearch={(value) => updateFilter('search', value)}
            />
            <StatsPanel stats={stats} />
            <FilterPanel
              filters={{
                scoreMin: filters.scoreMin,
                scoreMax: filters.scoreMax,
                star: filters.star,
                roomType: filters.roomType,
                travelType: filters.travelType,
              }}
              filterOptions={filterOptions}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
            <CategoryFilter
              selectedCategory={filters.category}
              filterOptions={filterOptions}
              onCategoryChange={(value) => updateFilter('category', value)}
            />
          </div>

          {/* Main Content - Comment List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              </div>
            ) : (
              <CommentList
                comments={comments}
                pagination={pagination}
                onPageChange={(page) => updateFilter('page', String(page))}
                onImageClick={openImageViewer}
              />
            )}
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={currentImages}
        currentIndex={currentImageIndex}
        isOpen={imageViewerOpen}
        onClose={closeImageViewer}
        onNext={goToNextImage}
        onPrev={goToPrevImage}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <CommentPageContent />
    </Suspense>
  );
}
