'use client';

import { Star, Home, Users, SlidersHorizontal, X } from 'lucide-react';
import { FilterOptions } from '@/types/comment';

interface FilterPanelProps {
  filters: {
    scoreMin: string;
    scoreMax: string;
    star: string;
    roomType: string;
    travelType: string;
  };
  filterOptions: FilterOptions | null;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function FilterPanel({ filters, filterOptions, onFilterChange, onClearFilters }: FilterPanelProps) {
  const hasActiveFilters = filters.scoreMin || filters.scoreMax || filters.star || filters.roomType || filters.travelType;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">筛选条件</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}
      </div>

      {/* Score Range */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          评分范围
        </label>
        <div className="flex items-center gap-2">
          <select
            value={filters.scoreMin}
            onChange={(e) => onFilterChange('scoreMin', e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">最低</option>
            <option value="1">1.0</option>
            <option value="2">2.0</option>
            <option value="3">3.0</option>
            <option value="4">4.0</option>
          </select>
          <span className="text-slate-400">-</span>
          <select
            value={filters.scoreMax}
            onChange={(e) => onFilterChange('scoreMax', e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">最高</option>
            <option value="2">2.0</option>
            <option value="3">3.0</option>
            <option value="4">4.0</option>
            <option value="5">5.0</option>
          </select>
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          星级评分
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange('star', filters.star === String(s) ? '' : String(s))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.star === String(s)
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}星
            </button>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-500" />
          房型
        </label>
        <select
          value={filters.roomType}
          onChange={(e) => onFilterChange('roomType', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部房型</option>
          {filterOptions?.roomTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Travel Type */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          出行类型
        </label>
        <select
          value={filters.travelType}
          onChange={(e) => onFilterChange('travelType', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部类型</option>
          {filterOptions?.travelTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
