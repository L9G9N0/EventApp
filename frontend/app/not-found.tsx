import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-zinc-50 px-4 py-24 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-600 dark:bg-orange-950/20 mb-6">
        <Rocket className="h-8 w-8 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
        Oops! The page you are looking for has taken off to another orbit. Let\'s get you back on track.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/10 hover:bg-orange-500 hover:scale-[1.02] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
