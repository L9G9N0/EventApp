'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Download,
  Search,
  Lock,
  Unlock,
  LogOut,
  TrendingUp,
  RefreshCw,
  MapPin,
  TrendingDown,
  Building,
  GraduationCap
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { trackEvent } from '../../../analytics/tracker';
import { Registration } from '../../../types';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Lock Page scroll or set auth on load from localStorage
  useEffect(() => {
    const authStatus = localStorage.getItem('bharatevents_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      trackEvent('dashboard_opened', { source: 'admin' });
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery) {
        trackEvent('event_search_performed', { query: searchQuery, source: 'dashboard' });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch dashboard aggregate statistics
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: eventService.getDashboardStats,
    enabled: isAuthenticated,
  });

  // Fetch searchable registrations
  const {
    data: registrations,
    isLoading: isRegsLoading,
    refetch: refetchRegs,
  } = useQuery({
    queryKey: ['dashboard-registrations', debouncedSearch],
    queryFn: () => eventService.searchRegistrations(debouncedSearch),
    enabled: isAuthenticated,
  });

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('bharatevents_admin_auth', 'true');
      toast.success('Access Granted. Welcome, Admin.');
      trackEvent('dashboard_opened', { source: 'login_success' });
    } else {
      toast.error('Incorrect passphrase. Access Denied.');
      setPassword('');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bharatevents_admin_auth');
    toast.success('Logged out successfully.');
  };

  // Export Table Data to CSV
  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error('No registration records available to export.');
      return;
    }

    trackEvent('dashboard_export_csv', { count: registrations.length });

    const headers = [
      'Name',
      'Email',
      'Phone',
      'College',
      'Company',
      'Referral Source',
      'Registered Event',
      'Date Registered',
    ];

    const rows = registrations.map((reg) => [
      reg.name,
      reg.email,
      reg.phone,
      reg.college || 'N/A',
      reg.company || 'N/A',
      reg.source,
      typeof reg.eventId === 'object' && reg.eventId ? (reg.eventId as any).title : 'N/A',
      new Date(reg.createdAt).toLocaleString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bharatevents_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report generated and downloaded.');
  };

  // ==========================================
  // LOCK SCREEN VIEW (Unauthenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-24 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/20 mb-4">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Admin Portal Restricted
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Please enter the passphrase to view the analytics dashboard and export registrations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label htmlFor="passphrase" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Passphrase
              </label>
              <input
                id="passphrase"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 py-3 px-4 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                required
              />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                Hint: Use <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-zinc-600 dark:text-zinc-400">admin123</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/10 hover:bg-orange-500 transition-all"
            >
              <Unlock className="h-4 w-4" />
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW (Authenticated)
  // ==========================================
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <LayoutDashboard className="h-6 w-6 text-orange-600" />
            Admin Command Centre
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time insights and registration trackers for BharatEvents.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              refetchStats();
              refetchRegs();
              toast.success('Dashboard data updated.');
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-red-50 text-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-100/50 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isStatsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : isStatsError || !stats ? (
        <div className="rounded-3xl bg-red-50/20 border border-red-100 p-6 text-center dark:border-red-950/40">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load statistics.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Events */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Events</span>
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalEvents}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/20">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Total Registrations */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Bookings</span>
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalRegistrations}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/20">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Filled Seats */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Filled Seats</span>
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalFilledSeats}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Available Seats */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Available Seats</span>
              <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalAvailableSeats}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

        </div>
      )}

      {/* Subpanels: Top Events and Bookings Breakdown */}
      {!isStatsLoading && stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Top Performing Events */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Top Performing Events
            </h2>
            <div className="space-y-3">
              {stats.topEvents.map((evt: any) => (
                <div
                  key={evt._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80"
                >
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{evt.title}</h3>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      {evt.speaker.split(' ')[0]} • {evt.location.split(',')[0]}
                    </span>
                  </div>
                  <span className="rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:bg-orange-950/30">
                    {evt.registeredCount} Booked
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Registrations count per Event */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Registration Count per Event
            </h2>
            <div className="space-y-3">
              {stats.registrationsPerEvent.slice(0, 5).map((reg) => (
                <div key={reg.eventId} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span className="line-clamp-1">{reg.title}</span>
                    <span>{reg.count} Bookings</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (reg.count / (stats.totals.totalRegistrations || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Main Registry Ledger: Searchable list & CSV exporter */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
        
        {/* Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Registrations Database</h2>
            <p className="text-xs text-zinc-400">Ledger of all active bookings in the system.</p>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, college, company, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-orange-500"
          />
        </div>

        {/* Ledger Table */}
        {isRegsLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
        ) : !registrations || registrations.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <UserX className="h-10 w-10 mx-auto opacity-50 mb-3" />
            <p className="text-sm">No registration records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">College / Company</th>
                  <th className="py-4 px-6">Referral</th>
                  <th className="py-4 px-6">Registered Event</th>
                  <th className="py-4 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-sm">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    {/* Name */}
                    <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">{reg.name}</td>
                    
                    {/* Contact Info */}
                    <td className="py-4 px-6 space-y-0.5 text-xs text-zinc-500">
                      <span className="block font-medium text-zinc-700 dark:text-zinc-300">{reg.email}</span>
                      <span>+91 {reg.phone}</span>
                    </td>

                    {/* College / Company */}
                    <td className="py-4 px-6 space-y-1">
                      {reg.college && (
                        <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <GraduationCap className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="line-clamp-1">{reg.college}</span>
                        </div>
                      )}
                      {reg.company && (
                        <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <Building className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="line-clamp-1">{reg.company}</span>
                        </div>
                      )}
                      {!reg.college && !reg.company && <span className="text-zinc-400 italic text-xs">N/A</span>}
                    </td>

                    {/* Source */}
                    <td className="py-4 px-6">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {reg.source}
                      </span>
                    </td>

                    {/* Registered Event */}
                    <td className="py-4 px-6">
                      {typeof reg.eventId === 'object' && reg.eventId ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                            {(reg.eventId as any).title}
                          </span>
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                            {(reg.eventId as any).category}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-xs">Deleted Event</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-zinc-400">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <span className="block text-[10px] mt-0.5 font-medium">
                        {new Date(reg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
