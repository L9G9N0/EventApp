'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Download,
  Search,
  Lock,
  Unlock,
  LogOut,
  TrendingUp,
  RefreshCw,
  MapPin,
  Building,
  GraduationCap,
  Activity,
  Coins,
  Cpu,
  MousePointerClick,
  CheckCircle,
  Eye,
  Info
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { trackEvent } from '../../../analytics/tracker';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('bharatevents_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      trackEvent('dashboard_opened', { source: 'admin' });
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery) {
        trackEvent('event_search_performed', { query: searchQuery, source: 'dashboard' });
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

  const {
    data: registrations,
    isLoading: isRegsLoading,
    refetch: refetchRegs,
  } = useQuery({
    queryKey: ['dashboard-registrations', debouncedSearch],
    queryFn: () => eventService.searchRegistrations(debouncedSearch),
    enabled: isAuthenticated,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('bharatevents_admin_auth', 'true');
      toast.success('Access granted. Systems unlocked.');
      trackEvent('dashboard_opened', { source: 'login_success' });
    } else {
      toast.error('Invalid credentials.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bharatevents_admin_auth');
    toast.success('Admin session terminated.');
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error('No ledger data to export.');
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
      'Ticket Type',
      'Coupon Applied',
      'Payment Status',
      'Referral Code',
      'Registration Date',
    ];

    const rows = registrations.map((reg) => [
      reg.name,
      reg.email,
      reg.phone,
      reg.college || 'N/A',
      reg.company || 'N/A',
      reg.source,
      reg.ticketType || 'General Admission',
      reg.couponCode || 'None',
      reg.paymentStatus || 'Free',
      reg.referralCode || 'None',
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
    link.setAttribute('download', `bharatevents_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV spreadsheet exported successfully.');
  };

  // Lock screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/20 mb-4 animate-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              BharatEvents Gatekeeper
            </h1>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Provide credentials to access analytical pipelines, system metrics, and ticket databases.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="gatekeeper-pass" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Passphrase
              </label>
              <input
                id="gatekeeper-pass"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 py-3 px-4 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-850 dark:bg-zinc-950/50"
                required
              />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                Hint: Passphrase is <code className="bg-zinc-100 dark:bg-zinc-850 px-1 py-0.5 rounded font-mono text-zinc-600 dark:text-zinc-400">admin123</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 text-sm font-bold text-white shadow hover:bg-orange-500 transition-all"
            >
              <Unlock className="h-4 w-4" />
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50/20 dark:bg-zinc-950 min-h-screen">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <LayoutDashboard className="h-6 w-6 text-orange-600" />
            Operations Control Center
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overview of conversion metrics, registry listings, and cluster diagnostic variables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              refetchStats();
              refetchRegs();
              toast.success('Dashboard metrics refreshed.');
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350"
          >
            <RefreshCw className="h-4.5 w-4.5" />
            Reload Data
          </button>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-red-50 text-red-600 px-4 py-2.5 text-xs font-bold hover:bg-red-100/50 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400"
          >
            <LogOut className="h-4.5 w-4.5" />
            Disconnect
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isStatsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : isStatsError || !stats ? (
        <div className="rounded-3xl bg-red-50/20 border border-red-100 p-6 text-center dark:border-red-950/40">
          <p className="text-red-650 dark:text-red-400 font-bold">Failed to load statistics.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: Total Events */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Events</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalEvents}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
              <Calendar className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Registrations */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Bookings</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalRegistrations}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Filled Seats */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Filled Slots</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalFilledSeats}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Available Seats */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Available Slots</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stats.totals.totalAvailableSeats}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 5: Revenue */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Ledger Revenue</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{stats.totals.totalRevenue}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              <Coins className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Panels (Donut, Area & Funnels) */}
      {!isStatsLoading && stats && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Registration Trends Line Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-orange-600" />
              Daily Registration Scale
            </h2>
            
            {/* Custom SVG Line Area Chart */}
            <div className="relative h-60 w-full bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-850 flex flex-col justify-between">
              {stats.registrationTrends?.length > 0 ? (
                <div className="relative w-full h-44">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#e4e4e720" strokeWidth="0.1" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#e4e4e720" strokeWidth="0.1" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="#e4e4e720" strokeWidth="0.1" />
                    
                    {/* Polyline Path */}
                    <path
                      d={`M 0,40 ${stats.registrationTrends.map((t, idx) => {
                        const x = (idx / (stats.registrationTrends.length - 1)) * 100;
                        const maxVal = Math.max(...stats.registrationTrends.map(d => d.count), 5);
                        const y = 40 - (t.count / maxVal) * 35;
                        return `L ${x},${y}`;
                      }).join(' ')} L 100,40 Z`}
                      fill="url(#areaGrad)"
                      opacity="0.15"
                    />
                    
                    <path
                      d={stats.registrationTrends.map((t, idx) => {
                        const x = (idx / (stats.registrationTrends.length - 1)) * 100;
                        const maxVal = Math.max(...stats.registrationTrends.map(d => d.count), 5);
                        const y = 40 - (t.count / maxVal) * 35;
                        return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Definitions */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ea580c" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Bottom Date labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-zinc-400 font-mono pt-1">
                    <span>{stats.registrationTrends[0]?.date}</span>
                    <span>{stats.registrationTrends[Math.floor(stats.registrationTrends.length / 2)]?.date}</span>
                    <span>{stats.registrationTrends[stats.registrationTrends.length - 1]?.date}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  Insufficient data points to map trends.
                </div>
              )}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              Conversion Funnel
            </h2>
            
            <div className="space-y-3.5 text-xs font-semibold">
              {/* Funnel Step 1: Views */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Event Views
                  </span>
                  <span>{stats.funnel.views}</span>
                </div>
                <div className="h-6 w-full bg-zinc-950/65 rounded-xl overflow-hidden relative border border-zinc-850 flex items-center px-3 text-[10px] font-mono text-zinc-350">
                  <div className="absolute inset-y-0 left-0 bg-orange-600/20" style={{ width: '100%' }} />
                  <span className="relative z-10">100% baseline views</span>
                </div>
              </div>

              {/* Funnel Step 2: Clicks */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5" /> Details Clicks
                  </span>
                  <span>{stats.funnel.clicks}</span>
                </div>
                <div className="h-6 w-full bg-zinc-950/65 rounded-xl overflow-hidden relative border border-zinc-850 flex items-center px-3 text-[10px] font-mono text-zinc-350">
                  <div className="absolute inset-y-0 left-0 bg-orange-600/20" style={{ width: `${(stats.funnel.clicks / stats.funnel.views) * 100}%` }} />
                  <span className="relative z-10">
                    {Math.round((stats.funnel.clicks / stats.funnel.views) * 100)}% click conversion
                  </span>
                </div>
              </div>

              {/* Funnel Step 3: Successes */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Final Registrations
                  </span>
                  <span>{stats.funnel.successes}</span>
                </div>
                <div className="h-6 w-full bg-zinc-950/65 rounded-xl overflow-hidden relative border border-zinc-850 flex items-center px-3 text-[10px] font-mono text-zinc-350">
                  <div className="absolute inset-y-0 left-0 bg-orange-600/20" style={{ width: `${(stats.funnel.successes / stats.funnel.views) * 100}%` }} />
                  <span className="relative z-10 text-emerald-400">
                    {((stats.funnel.successes / stats.funnel.views) * 100).toFixed(1)}% total ticket conversion
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Grid: Diagnostics, Referral, & City breakdowns */}
      {!isStatsLoading && stats && (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Referral Analytics */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-purple-500" />
              Referrals by Channel
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {stats.referralStats.map((ref) => (
                <div key={ref.source} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>{ref.source}</span>
                    <span>{ref.count} bookings</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${(ref.count / (stats.totals.totalRegistrations || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Cities */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-blue-500" />
              City Registrations
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {stats.cityStats.slice(0, 4).map((city) => (
                <div key={city.city} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>{city.city}</span>
                    <span>{city.count} bookings</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(city.count / (stats.totals.totalRegistrations || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Diagnostics */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-emerald-500" />
              Diagnostics Diagnostics
            </h3>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">MongoDB Core</span>
                <span className="text-emerald-500 font-bold">{stats.systemHealth.mongodb}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Node Engine</span>
                <span className="text-zinc-750 dark:text-zinc-350">{stats.systemHealth.nodeVersion}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Memory Allocation</span>
                <span className="text-zinc-750 dark:text-zinc-350">{stats.systemHealth.memory}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Uptime</span>
                <span className="text-zinc-750 dark:text-zinc-350">{stats.systemHealth.uptime}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Main Ledger Database Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50 space-y-6">
        
        {/* Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Registrations Database Ledger</h2>
            <p className="text-xs text-zinc-400">Verifiable index logs of all registrations.</p>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-500 transition-colors"
          >
            <Download className="h-4.5 w-4.5" />
            Export CSV Table
          </button>
        </div>

        {/* Live Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search name, email, college, company, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-orange-500"
          />
        </div>

        {/* Ledger table grid */}
        {isRegsLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
        ) : !registrations || registrations.length === 0 ? (
          <div className="text-center py-12 text-zinc-455">
            <Info className="h-8 w-8 mx-auto opacity-50 mb-3 text-zinc-400" />
            <p className="text-xs font-semibold">No records match criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-150 dark:border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">College / Company</th>
                  <th className="py-4 px-6">Ticket Type</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Registered Event</th>
                  <th className="py-4 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">{reg.name}</td>
                    
                    <td className="py-4 px-6 space-y-0.5 text-zinc-500">
                      <span className="block font-bold text-zinc-700 dark:text-zinc-350">{reg.email}</span>
                      <span>+91 {reg.phone}</span>
                    </td>

                    <td className="py-4 px-6 space-y-1">
                      {reg.college && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-650 dark:text-zinc-400 font-semibold">
                          <GraduationCap className="h-3.5 w-3.5 text-zinc-450 shrink-0" />
                          <span className="line-clamp-1">{reg.college}</span>
                        </div>
                      )}
                      {reg.company && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-650 dark:text-zinc-400 font-semibold">
                          <Building className="h-3.5 w-3.5 text-zinc-455 shrink-0" />
                          <span className="line-clamp-1">{reg.company}</span>
                        </div>
                      )}
                      {!reg.college && !reg.company && <span className="text-zinc-400 italic">N/A</span>}
                    </td>

                    <td className="py-4 px-6">
                      <span className="rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 dark:bg-orange-950/20 dark:text-orange-400">
                        {reg.ticketType}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold">
                      <span className={`rounded-lg px-2 py-1 text-[9px] font-black text-white ${
                        reg.paymentStatus === 'Paid'
                          ? 'bg-emerald-600'
                          : reg.paymentStatus === 'Free'
                          ? 'bg-zinc-800'
                          : 'bg-amber-600 animate-pulse'
                      }`}>
                        {reg.paymentStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-350">
                        {reg.source}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {typeof reg.eventId === 'object' && reg.eventId ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-850 dark:text-zinc-200 line-clamp-1">
                            {(reg.eventId as any).title}
                          </span>
                          <span className="text-[9px] font-black text-orange-600 uppercase block tracking-wider">
                            {(reg.eventId as any).category}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Deleted Event</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-zinc-400 font-medium">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <span className="block text-[9px] mt-0.5">
                        {new Date(reg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
