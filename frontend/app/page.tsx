'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  User,
  Sparkles,
  Filter,
  RefreshCw,
  Award,
  ArrowRight,
  ChevronRight,
  Star,
  Quote,
  Zap,
  Check,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Coins
} from 'lucide-react';
import eventService from '../services/eventService';
import { useDebounce } from '../hooks/useDebounce';
import { Event } from '../types';
import { EventListSkeleton } from '../components/EventCardSkeleton';
import EmptyState from '../components/EmptyState';
import { trackEvent } from '../analytics/tracker';

const INDIAN_CITIES = ['Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Pune', 'Hyderabad', 'Mumbai', 'Chandigarh', 'Chennai', 'Jaipur', 'Kochi', 'Kolkata', 'Ahmedabad'];
const CATEGORIES = ['Workshop', 'Hackathon', 'Seminar', 'Webinar', 'Bootcamp', 'AI Meetup'];
const MODES = ['Offline', 'Online', 'Hybrid'];

const TESTIMONIALS = [
  { quote: 'BharatEvents has completely changed how I network. The AI Meetups in Bengaluru are top-notch and highly technical.', author: 'Saurabh Mukhopadhyay', role: 'MTS-2, Razorpay', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' },
  { quote: 'Attending the Next.js production workshop in Noida helped me crack my frontend developer interview at Zepto. Highly recommended!', author: 'Preeti Deshmukh', role: 'Frontend Engineer, Swiggy', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
  { quote: 'The hackathons hosted here are incredibly competitive. Met my co-founder at the Delhi Web3 hackday last month!', author: 'Karan Singh', role: 'Founder, DeFi-Pay', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60' }
];

const FAQS = [
  { q: 'How do I receive my event ticket?', a: 'Once you successfully submit the registration form, a confirmation status will be updated on the screen and your PDF ticket will be emailed to your inbox within 5 minutes.' },
  { q: 'Is there a discount code available for paid events?', a: 'Yes! Early bird registrations can use code EARLYBIRD20 at checkout for an instant 20% discount on all paid workshops and bootcamps.' },
  { q: 'Can I cancel my registration?', a: 'Yes, registrations can be cancelled up to 24 hours prior to the event start time by clicking the cancellation link in your email ticket.' }
];

export default function EventListingPage() {
  const [filterMode, setFilterMode] = useState<'client' | 'api'>('api');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const debouncedSearch = useDebounce(search, 300);
  const [, startTransition] = useTransition();

  // Track page view
  useEffect(() => {
    trackEvent('event_list_viewed', { filterMode });
  }, [filterMode]);

  // Track search query
  useEffect(() => {
    if (debouncedSearch) {
      trackEvent('event_search_performed', { query: debouncedSearch, filterMode });
    }
  }, [debouncedSearch, filterMode]);

  const handleFilterChange = (type: 'category' | 'mode' | 'location', value: string) => {
    if (type === 'category') setCategory(value);
    if (type === 'mode') setMode(value);
    if (type === 'location') setLocation(value);
    setPage(1);
    
    if (value) {
      trackEvent('event_filter_applied', { filter: type, value, filterMode });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setMode('');
    setLocation('');
    setPage(1);
    trackEvent('event_filter_applied', { filter: 'reset', value: 'all', filterMode });
  };

  const handleToggleMode = (mode: 'client' | 'api') => {
    startTransition(() => {
      setFilterMode(mode);
      resetFilters();
    });
  };

  // Queries
  const { data: apiData, isLoading: isApiLoading, isError: isApiError, refetch: refetchApi } = useQuery({
    queryKey: ['events', 'api', debouncedSearch, category, mode, location, page],
    queryFn: () => eventService.getEvents({ search: debouncedSearch, category, mode, location, page, limit }),
    enabled: filterMode === 'api',
  });

  const { data: clientAllData, isLoading: isClientLoading, isError: isClientError, refetch: refetchClient } = useQuery({
    queryKey: ['events', 'client-all'],
    queryFn: () => eventService.getEvents({ page: 1, limit: 120 }),
    enabled: filterMode === 'client',
  });

  // Client filtering
  let displayedEvents: Event[] = [];
  let totalClientPages = 1;
  let totalClientCount = 0;

  if (filterMode === 'client' && clientAllData?.events) {
    let filtered = [...clientAllData.events];
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((evt) => evt.title.toLowerCase().includes(lowerSearch));
    }
    if (category) {
      filtered = filtered.filter((evt) => evt.category === category);
    }
    if (mode) {
      filtered = filtered.filter((evt) => evt.mode === mode);
    }
    if (location) {
      const lowerLoc = location.toLowerCase();
      filtered = filtered.filter((evt) => evt.location.toLowerCase().includes(lowerLoc));
    }

    totalClientCount = filtered.length;
    totalClientPages = Math.ceil(totalClientCount / limit);
    const startIdx = (page - 1) * limit;
    displayedEvents = filtered.slice(startIdx, startIdx + limit);
  } else if (filterMode === 'api' && apiData) {
    displayedEvents = apiData.events;
  }

  const isLoading = filterMode === 'api' ? isApiLoading : isClientLoading;
  const isError = filterMode === 'api' ? isApiError : isClientError;
  const totalPages = filterMode === 'api' ? (apiData?.pagination?.totalPages || 1) : totalClientPages;
  const totalCount = filterMode === 'api' ? (apiData?.pagination?.totalCount || 0) : totalClientCount;

  // Derive Featured Events (top rated / high registrations)
  const allFetchedEvents = filterMode === 'api' ? apiData?.events : clientAllData?.events;
  const featuredEvents = allFetchedEvents
    ? [...allFetchedEvents].sort((a, b) => b.rating - a.rating).slice(0, 3)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-zinc-950 font-sans">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 py-2.5 text-center text-xs font-bold text-white shadow-inner flex items-center justify-center gap-2">
        <Zap className="h-4 w-4 animate-bounce" />
        <span>⚡ FLAT 20% DISCOUNT FOR FIRST 100 REGISTRATIONS. USE CODE: <code className="bg-white/20 px-1.5 py-0.5 rounded">EARLYBIRD20</code></span>
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/80 py-20 text-white md:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Text */}
          <div className="max-w-3xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              India\'s Premier Developer Hub
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white leading-none">
              Where India\'s Top Tech <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-size-200 animate-gradient-flow">
                Communities Meet.
              </span>
            </h1>
            
            <p className="text-lg text-zinc-300 max-w-xl">
              Discover and register for certified tech bootcamps, high-stakes hackathons, and local developer meetups hosted by Polygon, Razorpay, and AWS leaders.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#events-list"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 hover:scale-[1.02] transition-all"
              >
                Explore Events
                <ArrowRight className="h-4.5 w-4.5" />
              </a>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 backdrop-blur px-6 py-3.5 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
              >
                Admin Panel
              </Link>
            </div>

            {/* Trusted by Brands */}
            <div className="pt-8 space-y-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Trusted by developers at</span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 opacity-40 grayscale hover:grayscale-0 hover:opacity-75 transition-all">
                <span className="text-sm font-bold">Zomato</span>
                <span className="text-sm font-bold">Razorpay</span>
                <span className="text-sm font-bold">Polygon</span>
                <span className="text-sm font-bold">Zepto</span>
                <span className="text-sm font-bold">Swiggy</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative w-full max-w-md shrink-0 lg:block hidden">
            <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-400 opacity-20 blur-xl animate-pulse" />
            <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-auto text-xs text-zinc-500 font-mono font-bold">live_bookings.sh</span>
              </div>

              <div className="space-y-4 font-mono text-xs text-zinc-400">
                <p className="text-orange-400"># Fetching dynamic community stats...</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">REGISTRATIONS</span>
                    <span className="text-lg font-black text-white">50,000+</span>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">COMMUNITIES</span>
                    <span className="text-lg font-black text-white">200+</span>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">HOSTING CITIES</span>
                    <span className="text-lg font-black text-white">20+</span>
                  </div>
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block">SUCCESS RATE</span>
                    <span className="text-lg font-black text-white">99.8%</span>
                  </div>
                </div>
                <p className="text-emerald-500">✓ Connection secure. Ready to register.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Category Ecosystem</h2>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Explore Trending Categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const gradients = [
              'from-orange-500 to-amber-500',
              'from-blue-600 to-sky-500',
              'from-purple-600 to-indigo-500',
              'from-emerald-600 to-teal-500',
              'from-rose-600 to-pink-500',
              'from-violet-600 to-purple-500'
            ];
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange('category', cat)}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[idx % gradients.length]} text-white mb-3 shadow-md`} />
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 transition-colors">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Carousel Section */}
      {featuredEvents.length > 0 && (
        <section className="bg-zinc-900 py-16 text-white border-y border-zinc-800 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Handpicked Recommendations</span>
                <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Featured High-Rated Events</h2>
              </div>
              <span className="text-xs text-zinc-400 font-medium">Top bookings and rating values above 4.5★</span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featuredEvents.map((evt) => (
                <div
                  key={evt._id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl group hover:-translate-y-1 transition duration-300 relative"
                >
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className="rounded-lg bg-orange-600 px-2.5 py-1 text-[10px] font-black text-white shadow">
                      FEATURED
                    </span>
                    {evt.price === 0 && (
                      <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white shadow">
                        FREE
                      </span>
                    )}
                  </div>

                  <div className="relative h-44 w-full bg-zinc-850 overflow-hidden">
                    <img src={evt.banner} alt={evt.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
                        <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                        <span>{evt.rating} ({evt.reviewsCount} reviews)</span>
                      </div>
                      <h3 className="text-base font-bold leading-snug line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{evt.description}</p>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-xs text-zinc-400 font-medium">
                      <span>{evt.speaker.split(' ')[0]} • {evt.location.split(',')[0]}</span>
                      <Link
                        href={`/events/${evt.slug}`}
                        className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold transition"
                      >
                        Register
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Listing Section */}
      <main id="events-list" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toggle Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              Live Upcoming Events ({totalCount})
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Browse, filter, and reserve developer tickets in real-time.
            </p>
          </div>

          <div className="inline-flex rounded-2xl bg-zinc-200/50 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
            <button
              onClick={() => handleToggleMode('client')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filterMode === 'client'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              Client Filter
            </button>
            <button
              onClick={() => handleToggleMode('api')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filterMode === 'api'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              API Filter
            </button>
          </div>
        </div>

        {/* Filter Panel Grid */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
            {/* Search Input */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="search-main" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Search Title
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="search-main"
                  type="text"
                  placeholder="e.g. Next.js, Kubernetes, AI..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-orange-500"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label htmlFor="category-select" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location City Select */}
            <div className="space-y-1.5">
              <label htmlFor="location-select" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                City Location
              </label>
              <select
                id="location-select"
                value={location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Select */}
            <div className="space-y-1.5">
              <label htmlFor="mode-select" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Hosting Mode
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => handleFilterChange('mode', e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <option value="">All Modes</option>
                {MODES.map((md) => (
                  <option key={md} value={md}>
                    {md}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs border-t border-zinc-150 dark:border-zinc-800/80">
            <span className="text-zinc-500 font-medium">
              Showing {displayedEvents.length} of {totalCount} events ({filterMode === 'client' ? 'Client Filtering' : 'Server API'})
            </span>
            {(search || category || mode || location) && (
              <button
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-500 font-semibold flex items-center gap-1 hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <EventListSkeleton count={limit} />
        ) : isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/20 text-center dark:border-red-950/40">
            <p className="text-red-650 dark:text-red-400 font-bold">Failed to connect to backend server.</p>
            <button
              onClick={() => (filterMode === 'api' ? refetchApi() : refetchClient())}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        ) : displayedEvents.length === 0 ? (
          <EmptyState isSearch={!!search} onReset={resetFilters} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedEvents.map((event) => (
              <div
                key={event._id}
                className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/40 group relative"
              >
                {/* Mode & Category Pill */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  <span className="rounded-lg bg-zinc-950/85 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black text-white shadow-sm">
                    {event.category.toUpperCase()}
                  </span>
                  <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black text-white shadow-sm ${
                    event.mode === 'Online'
                      ? 'bg-emerald-600/90'
                      : event.mode === 'Hybrid'
                      ? 'bg-blue-600/90'
                      : 'bg-orange-600/90'
                  }`}>
                    {event.mode.toUpperCase()}
                  </span>
                </div>

                {/* Cover Banner */}
                <div className="relative h-44 w-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-103 transition duration-500"
                  />
                  {/* Free badge */}
                  {event.price === 0 && (
                    <span className="absolute bottom-3 right-3 rounded-lg bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white shadow">
                      FREE TICKET
                    </span>
                  )}
                  {/* Price tag */}
                  {event.price > 0 && (
                    <span className="absolute bottom-3 right-3 rounded-lg bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-black text-orange-400 shadow">
                      ₹{event.price}
                    </span>
                  )}
                </div>

                {/* Event Core Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      <span>{event.organizer}</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {event.rating}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800 grid grid-cols-2 gap-y-2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="line-clamp-1">{event.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{event.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="line-clamp-1">{event.speaker.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Booking Footer */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                      <span>Seats available:</span>
                      <span className={event.availableSeats > 0 ? 'text-zinc-800 dark:text-zinc-200' : 'text-red-500 font-extrabold animate-pulse'}>
                        {event.availableSeats > 0 ? `${event.availableSeats} Left` : 'FULLY BOOKED'}
                      </span>
                    </div>

                    <Link
                      href={`/events/${event.slug}`}
                      onClick={() =>
                        trackEvent('event_card_clicked', {
                          eventId: event._id,
                          eventName: event.title,
                          category: event.category,
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      Book Ticket
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="pt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition ${
                  page === i + 1
                    ? 'bg-orange-600 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Testimonials Section */}
      <section className="bg-white py-16 dark:bg-zinc-900 border-y border-zinc-250/60 dark:border-zinc-800 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">User Reviews</span>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">What Our Community Says</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((test, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-6 rounded-3xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 relative shadow-sm"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-zinc-200 dark:text-zinc-800/80 pointer-events-none" />
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 italic mb-6">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={test.image} alt={test.author} className="h-10 w-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-850" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{test.author}</h4>
                    <span className="text-[10px] text-zinc-400 block">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">Frequently Asked Questions</span>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Have Queries? We Got Answers</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                {faq.q}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
