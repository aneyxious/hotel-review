'use client';

import { useState } from 'react';
import { Star, Calendar, Home, User } from 'lucide-react';
import { Comment } from '@/types/comment';

interface CommentCardProps {
  comment: Comment;
  onImageClick: (images: string[], index: number) => void;
}

export default function CommentCard({ comment, onImageClick }: CommentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayComment = isExpanded
    ? comment.comment
    : comment.comment.slice(0, 200) + (comment.comment.length > 200 ? '...' : '');

  const hasImages = comment.images && comment.images.length > 0;
  const visibleImages = comment.images?.slice(0, 4) || [];
  const remainingCount = (comment.images?.length || 0) - 4;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-amber-700">{comment.score}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span>{comment.publish_date}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <Home className="w-3.5 h-3.5" />
          <span>{comment.room_type}</span>
        </div>
      </div>

      {/* Travel Type */}
      <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
        <User className="w-3.5 h-3.5" />
        <span>{comment.travel_type}</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>评论数: {comment.review_count}</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>质量分: {comment.quality_score}</span>
      </div>

      {/* Comment Text */}
      <p className="text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">
        {displayComment}
        {comment.comment.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        )}
      </p>

      {/* Images */}
      {hasImages && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {visibleImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onImageClick(comment.images, idx)}
              className="relative group"
            >
              <img
                src={img}
                alt={`评论图片 ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
                loading="lazy"
              />
              {idx === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">+{remainingCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {comment.categories?.map((cat, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
