'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Award,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { trackEvent } from '../../../analytics/tracker';
import Modal from '../../../components/Modal';

// Regex matching Indian phone numbers
const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

// Zod Registration Schema
const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => indianPhoneRegex.test(val),
    { message: 'Enter a valid Indian mobile number (e.g. 9876543210)' }
  ),
  college: z.string().max(150, 'College must be under 150 characters').optional().or(z.literal('')),
  company: z.string().max(150, 'Company must be under 150 characters').optional().or(z.literal('')),
  source: z.enum(['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct']),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Resolve slug using React.use() for Next.js 15 compatibility
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Fetch specific event details
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventService.getEventByIdOrSlug(slug),
  });

  // Track event view once event data is loaded
  useEffect(() => {
    if (event) {
      trackEvent('event_card_clicked', {
        eventId: event._id,
        eventName: event.title,
        category: event.category,
      });
    }
  }, [event]);

  // Fetch similar events (events from the same category)
  const { data: similarData, isLoading: isSimilarLoading } = useQuery({
    queryKey: ['similar-events', event?.category],
    queryFn: () => eventService.getEvents({ category: event?.category, limit: 4 }),
    enabled: !!event?.category,
  });

  const similarEvents = similarData?.events
    ? similarData.events.filter((e) => e._id !== event?._id).slice(0, 3)
    : [];

  // React Hook Form Configuration
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      college: '',
      company: '',
      source: 'LinkedIn',
    },
  });

  // Mutation to handle registration submission
  const registerMutation = useMutation({
    mutationFn: (formData: RegistrationFormData) =>
      eventService.registerForEvent(event?._id || '', formData),
    onMutate: () => {
      trackEvent('registration_submitted', {
        eventId: event?._id,
        eventName: event?.title,
      });
    },
    onSuccess: (data) => {
      // 1. Success Notification
      toast.success('Registration successful! See you at the event.', {
        id: 'registration-success',
      });
      // 2. Track success analytics
      trackEvent('registration_success', {
        eventId: event?._id,
        eventName: event?.title,
        email: data.registration.email,
      });
      // 3. Clear form inputs and close modal
      reset();
      setIsRegisterModalOpen(false);
      // 4. Refetch/Invalidate queries to update seat numbers
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      const apiErrorMessage = error.response?.data?.message || 'Failed to complete registration';
      toast.error(apiErrorMessage, { id: 'registration-error' });
      
      trackEvent('registration_failed', {
        eventId: event?._id,
        eventName: event?.title,
        errorMessage: apiErrorMessage,
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  // Rendering Loading Skeleton
  if (isEventLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-6 w-20 rounded bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="h-96 w-full rounded-3xl bg-zinc-200 dark:bg-zinc-800 mb-8" />
        <div className="h-10 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 mb-4" />
        <div className="flex gap-4 mb-8">
          <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="space-y-3 mb-12">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  // Rendering Error State
  if (isEventError || !event) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-24 text-center">
        <div className="rounded-3xl border border-red-100 bg-red-50/20 p-8 dark:border-red-950/40">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Event Not Found</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            The event you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition dark:hover:text-zinc-200 mb-6"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to Events
      </Link>

      {/* Main Details Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Cover Banner and Descriptions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Image & Category tags */}
          <div className="relative h-[25rem] w-full overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <img
              src={event.banner}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
                {event.category}
              </span>
              <span className={`rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-md ${
                event.mode === 'Online'
                  ? 'bg-emerald-600'
                  : event.mode === 'Hybrid'
                  ? 'bg-blue-600'
                  : 'bg-zinc-950/80'
              }`}>
                {event.mode}
              </span>
            </div>
          </div>

          {/* Core Event Information */}
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {event.title}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 font-medium">
              {event.description}
            </p>
          </div>

          {/* Details Panels */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">About the Event</h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
                {event.longDescription}
              </p>
            </div>
            
            {/* Meta Items Grid */}
            <div className="grid gap-4 sm:grid-cols-2 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Speaker</h3>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{event.speaker}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Duration</h3>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{event.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation: Similar Events Section */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Similar Events
            </h2>
            
            {isSimilarLoading ? (
              <div className="h-24 w-full bg-zinc-100 rounded-2xl animate-pulse" />
            ) : similarEvents.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">No other events in this category yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {similarEvents.map((sim) => (
                  <Link
                    key={sim._id}
                    href={`/events/${sim.slug}`}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900 group"
                  >
                    <div className="h-28 w-full overflow-hidden bg-zinc-100 relative">
                      <img src={sim.banner} alt={sim.title} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded-lg bg-orange-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {sim.mode}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {sim.title}
                      </h3>
                      <div className="mt-2 flex items-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        <Calendar className="mr-1 h-3.5 w-3.5 text-zinc-400" />
                        {new Date(sim.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Card with Registration CTA */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              Registration Info
            </h2>
            
            {/* Meta Rows */}
            <div className="space-y-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Date</span>
                  <span>
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Time</span>
                  <span>
                    {new Date(event.date).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Venue</span>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Seat Progress Gauge */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Seats Available:
                </span>
                <span className={event.availableSeats > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500 font-bold'}>
                  {event.availableSeats > 0 ? `${event.availableSeats} Seats Left` : 'FULLY BOOKED'}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    event.availableSeats <= 10
                      ? 'bg-red-500'
                      : event.availableSeats <= 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        (event.availableSeats / (event.availableSeats + event.registeredCount)) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block text-right font-medium">
                {event.registeredCount} already registered
              </span>
            </div>

            {/* Primary Action Button */}
            {event.availableSeats > 0 ? (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/10 hover:bg-orange-500 hover:scale-[1.01] active:scale-95 transition-all duration-200"
              >
                Register for Event
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-200 py-3 text-sm font-semibold text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
              >
                House Full
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Modal containing Registration Form */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Event Registration"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-3.5 py-2 rounded-xl">
            <ShieldCheck className="h-4 w-4" />
            Registering for: {event.title}
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="form-name" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              id="form-name"
              type="text"
              placeholder="e.g. Rohan Gupta"
              {...register('name')}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                errors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label htmlFor="form-email" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              id="form-email"
              type="email"
              placeholder="e.g. rohan.gupta@example.com"
              {...register('email')}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label htmlFor="form-phone" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Phone Number *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">
                +91
              </span>
              <input
                id="form-phone"
                type="tel"
                placeholder="9876543210"
                {...register('phone')}
                className={`w-full rounded-xl border py-2.5 pl-12 pr-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Professional Credentials (College / Company) */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="form-college" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                College (Students)
              </label>
              <input
                id="form-college"
                type="text"
                placeholder="e.g. IIT Delhi"
                {...register('college')}
                className="w-full rounded-xl border border-zinc-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950/50"
              />
              {errors.college && <p className="text-xs text-red-500 mt-1">{errors.college.message}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="form-company" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Company (Professionals)
              </label>
              <input
                id="form-company"
                type="text"
                placeholder="e.g. Razorpay"
                {...register('company')}
                className="w-full rounded-xl border border-zinc-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950/50"
              />
              {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>}
            </div>
          </div>

          {/* Referral Source Dropdown */}
          <div className="space-y-1">
            <label htmlFor="form-source" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              How did you hear about this event? *
            </label>
            <select
              id="form-source"
              {...register('source')}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                errors.source
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
              }`}
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Email">Email Announcement</option>
              <option value="Direct">Word of Mouth / Direct</option>
            </select>
            {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source.message}</p>}
          </div>

          {/* Submission Panel */}
          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 mt-6">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-70 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Registration
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
