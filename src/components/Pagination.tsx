import * as React from "react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (n: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Poprzednia
      </Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Button key={n} size="sm" variant={n === page ? "secondary" : "outline"} onClick={() => onPageChange(n)}>
          {n}
        </Button>
      ))}
      <Button variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Następna
      </Button>
    </div>
  );
}
