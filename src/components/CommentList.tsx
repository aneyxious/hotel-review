'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Comment, PaginationInfo } from '@/types/comment';
import CommentCard from './CommentCard';

interface CommentListProps {
  comments: Comment[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onImageClick: (images: string[], index: number) => void;
}

export default function CommentList({ comments, pagination, onPageChange, onImageClick }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-lg">没有找到符合条件的评论</p>
        <p className="text-slate-400 text-sm mt-2">请尝试调整筛选条件</p>
      </div>
    );
  }

  const { page, totalPages } = pagination;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
        <span>共 {pagination.total} 条评论</span>
        <span>第 {page} / {totalPages} 页</span>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
