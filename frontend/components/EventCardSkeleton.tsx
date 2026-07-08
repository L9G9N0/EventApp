import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm animate-pulse dark:border-zinc-800 dark:bg-zinc-900">
      {/* Banner Area */}
      <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-800" />
      
      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & Mode Badge Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Title Skeleton */}
        <div className="h-6 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />

        {/* Description Skeleton */}
        <div className="space-y-2 mb-5">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Info Row Skeletons */}
        <div className="space-y-2 mt-auto border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Register Button Skeleton */}
        <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 mt-5" />
      </div>
    </div>
  );
}

export function EventListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
