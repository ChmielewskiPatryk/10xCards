import * as React from 'react';

// Filter and sort controls for flashing reviewing
export type FilterSortProps = {
  source: 'all' | 'manual' | 'ai' | 'semi_ai';
  sort: 'created_at' | 'updated_at';
  order: 'asc' | 'desc';
  onSourceChange: (value: 'all' | 'manual' | 'ai' | 'semi_ai') => void;
  onSortChange: (value: 'created_at' | 'updated_at') => void;
  onOrderChange: (value: 'asc' | 'desc') => void;
  hideAllOption?: boolean;
};

export function FilterSortControls({
  source,
  sort,
  order,
  onSourceChange,
  onSortChange,
  onOrderChange,
  hideAllOption = false
}: FilterSortProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Źródło</label>
        <select
          id="source"
          value={source}
          onChange={(e) => onSourceChange(e.target.value as FilterSortProps['source'])}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          {!hideAllOption && <option value="all">Wszystkie</option>}
          <option value="manual">Ręczne</option>
          <option value="ai">AI</option>
          <option value="semi_ai">Półautomatyczne</option>
        </select>
      </div>
      <div>
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Sortuj według</label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as FilterSortProps['sort'])}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="created_at">Data utworzenia</option>
          <option value="updated_at">Data aktualizacji</option>
        </select>
      </div>
      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Kolejność</label>
        <select
          id="order"
          value={order}
          onChange={(e) => onOrderChange(e.target.value as FilterSortProps['order'])}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="asc">Rosnąco</option>
          <option value="desc">Malejąco</option>
        </select>
      </div>
    </div>
  );
} 