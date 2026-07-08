import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} BharatEvents. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>in India for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
