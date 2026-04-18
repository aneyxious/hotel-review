'use client';

import { MessageSquare, Star, BarChart3 } from 'lucide-react';
import { StatsResponse } from '@/types/comment';

interface StatsPanelProps {
  stats: StatsResponse | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const { totalCount, averageScore, averageStar, starDistribution } = stats;
  const maxStarCount = Math.max(...Object.values(starDistribution));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-slate-500" />
        <h3 className="font-semibold text-slate-800">评论统计</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <span className="text-2xl font-bold text-slate-800">{totalCount}</span>
          </div>
          <span className="text-xs text-slate-500">评论总数</span>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold text-amber-700">{(averageScore || 0).toFixed(2)}</span>
          </div>
          <span className="text-xs text-slate-500">平均评分</span>
        </div>
      </div>

      {/* Star Distribution */}
      <div>
        <h4 className="text-sm font-medium text-slate-600 mb-3">评分分布</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starDistribution[String(star)] || 0;
            const percentage = maxStarCount > 0 ? (count / maxStarCount) * 100 : 0;
            const totalPercentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 w-6">{star}星</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      star >= 4 ? 'bg-amber-400' : star >= 3 ? 'bg-amber-300' : 'bg-amber-200'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-12 text-right">{count}条</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
