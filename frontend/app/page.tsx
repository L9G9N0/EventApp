'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Calendar, Clock, User, Sparkles, Filter, RefreshCw } from 'lucide-react';
import eventService from '../services/eventService';
import { useDebounce } from '../hooks/useDebounce';
import { Event } from '../types';
import { EventListSkeleton } from '../components/EventCardSkeleton';
import EmptyState from '../components/EmptyState';
import { trackEvent } from '../analytics/tracker';

const INDIAN_CITIES = ['Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Pune', 'Hyderabad', 'Mumbai', 'Chandigarh'];
const CATEGORIES = ['Workshop', 'Hackathon', 'Seminar', 'Webinar', 'Bootcamp', 'AI Meetup'];
const MODES = ['Offline', 'Online', 'Hybrid'];

export default function EventListingPage() {
  // Toggle between Client Filtering ('client') and API Filtering ('api')
  const [filterMode, setFilterMode] = useState<'client' | 'api'>('api');
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Debounced search for API calls
  const debouncedSearch = useDebounce(search, 300);

  // Transition state for UI changes
  const [, startTransition] = useTransition();

  // Track page view on load
  useEffect(() => {
    trackEvent('event_list_viewed', { filterMode });
  }, [filterMode]);

  // Track search query when debounced value changes (if not empty)
  useEffect(() => {
    if (debouncedSearch) {
      trackEvent('event_search_performed', { query: debouncedSearch, filterMode });
    }
  }, [debouncedSearch, filterMode]);

  // Handle filter changes and log analytics
  const handleFilterChange = (type: 'category' | 'mode' | 'location', value: string) => {
    if (type === 'category') setCategory(value);
    if (type === 'mode') setMode(value);
    if (type === 'location') setLocation(value);
    setPage(1); // Reset page to 1 on filter change
    
    if (value) {
      trackEvent('event_filter_applied', { filter: type, value, filterMode });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setMode('');
    setLocation('');
    setPage(1);
    trackEvent('event_filter_applied', { filter: 'reset', value: 'all', filterMode });
  };

  // Switch filtering mode
  const handleToggleMode = (mode: 'client' | 'api') => {
    startTransition(() => {
      setFilterMode(mode);
      resetFilters();
    });
  };

  // ==========================================
  // QUERY 1: Server-side (API) Filtering
  // ==========================================
  const {
    data: apiData,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch: refetchApi,
  } = useQuery({
    queryKey: ['events', 'api', debouncedSearch, category, mode, location, page],
    queryFn: () =>
      eventService.getEvents({
        search: debouncedSearch,
        category,
        mode,
        location,
        page,
        limit,
      }),
    enabled: filterMode === 'api',
  });

  // ==========================================
  // QUERY 2: Client-side Filtering (Fetch all)
  // ==========================================
  const {
    data: clientAllData,
    isLoading: isClientLoading,
    isError: isClientError,
    refetch: refetchClient,
  } = useQuery({
    queryKey: ['events', 'client-all'],
    queryFn: () => eventService.getEvents({ page: 1, limit: 100 }), // Fetch large batch
    enabled: filterMode === 'client',
  });

  // Client-side filtering logic
  let displayedEvents: Event[] = [];
  let totalClientPages = 1;
  let totalClientCount = 0;

  if (filterMode === 'client' && clientAllData?.events) {
    let filtered = [...clientAllData.events];

    // Filter by search term
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((evt) => evt.title.toLowerCase().includes(lowerSearch));
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((evt) => evt.category === category);
    }

    // Filter by mode
    if (mode) {
      filtered = filtered.filter((evt) => evt.mode === mode);
    }

    // Filter by location
    if (location) {
      const lowerLoc = location.toLowerCase();
      filtered = filtered.filter((evt) => evt.location.toLowerCase().includes(lowerLoc));
    }

    totalClientCount = filtered.length;
    totalClientPages = Math.ceil(totalClientCount / limit);
    
    // Slice for client-side pagination
    const startIdx = (page - 1) * limit;
    displayedEvents = filtered.slice(startIdx, startIdx + limit);
  } else if (filterMode === 'api' && apiData) {
    displayedEvents = apiData.events;
  }

  const isLoading = filterMode === 'api' ? isApiLoading : isClientLoading;
  const isError = filterMode === 'api' ? isApiError : isClientError;
  const totalPages = filterMode === 'api' ? (apiData?.pagination?.totalPages || 1) : totalClientPages;
  const totalCount = filterMode === 'api' ? (apiData?.pagination?.totalCount || 0) : totalClientCount;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950 py-16 text-white text-center md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-orange-500/5 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Discover Tech Communities Across India
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Connect. Code. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Grow.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300">
            Find the finest tech workshops, hackathons, and AI meetups in your city. Register instantly and secure your seat today!
          </p>
        </div>
      </section>

      {/* Main Content & Filter Area */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filter Mode Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-600" />
              Filter Method Demonstration
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Switching toggles between single-fetch state filter or parameterized queries.
            </p>
          </div>
          
          <div className="inline-flex rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => handleToggleMode('client')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filterMode === 'client'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              Client Filter
            </button>
            <button
              onClick={() => handleToggleMode('api')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filterMode === 'api'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              API (Server) Filter
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-2 space-y-1.5">
              <label htmlFor="search-input" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Search Event
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-orange-500 dark:focus:bg-zinc-950"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label htmlFor="category-select" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
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

            {/* Location (City) Filter */}
            <div className="space-y-1.5">
              <label htmlFor="city-select" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Location (City)
              </label>
              <select
                id="city-select"
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

            {/* Mode Filter & Reset */}
            <div className="space-y-1.5">
              <label htmlFor="mode-select" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Mode
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

          {/* Reset Filters Trigger */}
          <div className="mt-4 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">
              Showing {displayedEvents.length} of {totalCount} events ({filterMode === 'client' ? 'Client State' : 'API Fetched'})
            </span>
            {(search || category || mode || location) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-orange-600 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Display Events Grid */}
        {isLoading ? (
          <EventListSkeleton count={limit} />
        ) : isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/20 text-center dark:border-red-950/50">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Error fetching events. Please check your internet connection or backend server.
            </p>
            <button
              onClick={() => (filterMode === 'api' ? refetchApi() : refetchClient())}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition"
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
                className="flex flex-col overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/50 group"
              >
                {/* Banner Area */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <span className="absolute left-4 top-4 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                    {event.category}
                  </span>
                  {/* Mode Pill */}
                  <span className={`absolute right-4 top-4 rounded-xl px-2.5 py-1 text-xs font-bold shadow-md ${
                    event.mode === 'Online'
                      ? 'bg-emerald-600 text-white'
                      : event.mode === 'Hybrid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900/90 text-white'
                  }`}>
                    {event.mode}
                  </span>
                </div>

                {/* Content Details Area */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Highlights Row */}
                  <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800/80 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        {event.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        {event.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-zinc-400" />
                        {event.speaker.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Seat availability status */}
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-500">Available Seats:</span>
                    <span className={event.availableSeats > 0 ? 'text-zinc-700 dark:text-zinc-300' : 'text-red-500 font-bold'}>
                      {event.availableSeats > 0 ? `${event.availableSeats} Left` : 'House Full'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/events/${event.slug}`}
                    onClick={() =>
                      trackEvent('event_card_clicked', {
                        eventId: event._id,
                        eventName: event.title,
                        category: event.category,
                      })
                    }
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 hover:scale-[1.01] active:scale-95 transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Components */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    page === pageNumber
                      ? 'bg-orange-600 text-white'
                      : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
