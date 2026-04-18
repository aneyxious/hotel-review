'use client';

import { Tag } from 'lucide-react';
import { FilterOptions } from '@/types/comment';

interface CategoryFilterProps {
  selectedCategory: string;
  filterOptions: FilterOptions | null;
  onCategoryChange: (value: string) => void;
}

export default function CategoryFilter({ selectedCategory, filterOptions, onCategoryChange }: CategoryFilterProps) {
  if (!filterOptions) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-slate-500" />
        <h3 className="font-semibold text-slate-800">分类标签</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(filterOptions.categories).map(([group, items]) => (
          <div key={group}>
            <h4 className="text-sm font-medium text-slate-500 mb-2">{group}</h4>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => onCategoryChange(selectedCategory === item ? '' : item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === item
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
