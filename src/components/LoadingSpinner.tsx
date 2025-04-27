import * as React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-4">
      <div
        className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 