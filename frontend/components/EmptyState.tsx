import React from 'react';
import { CalendarX, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  isSearch?: boolean;
  onReset?: () => void;
}

export default function EmptyState({
  title = 'No Events Found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  isSearch = false,
  onReset,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/25">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        {isSearch ? <Search className="h-8 w-8" /> : <CalendarX className="h-8 w-8" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-6 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
