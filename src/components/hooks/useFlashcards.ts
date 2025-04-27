import * as React from 'react';
import type { Flashcard, Pagination, PaginatedResponse } from '@/types';

export type Filters = {
  source: 'manual' | 'ai' | 'semi_ai';
  sort: 'created_at' | 'updated_at';
  order: 'asc' | 'desc';
};

export function useFlashcards(
  filters: Filters,
  page: number,
  limit: number = 20
) {
  const [data, setData] = React.useState<Flashcard[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    total: 0,
    page,
    limit,
    pages: 0
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: filters.sort,
        order: filters.order,
        source: filters.source
      });
      const res = await fetch(`/api/flashcards?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as PaginatedResponse<Flashcard>;
      setData(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, pagination, loading, error, refresh: fetchData };
} 