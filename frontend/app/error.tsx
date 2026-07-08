'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console (or a logging service in production)
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-zinc-50 px-4 py-24 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600 dark:bg-red-950/20 mb-6">
        <AlertCircle className="h-8 w-8 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Something Went Wrong!
      </h1>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
        A critical error occurred while rendering this page. The development logs have been updated.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/10 hover:bg-orange-500 hover:scale-[1.02] transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Try Recovering
        </button>
      </div>
    </div>
  );
}
