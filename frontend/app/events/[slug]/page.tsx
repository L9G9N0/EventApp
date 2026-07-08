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
  Share2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  BadgeAlert,
  ChevronLeft,
  Bookmark,
  CalendarPlus,
  Coins,
  Star,
  Check
} from 'lucide-react';
import eventService from '../../../services/eventService';
import { trackEvent } from '../../../analytics/tracker';
import Modal from '../../../components/Modal';

const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

// Zod Registration Schema supporting multi-step ticket details
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
  ticketType: z.enum(['General Admission', 'VIP Pass', 'Student Discount']),
  couponCode: z.string().max(20, 'Coupon is too long').optional().or(z.literal('')),
  referralCode: z.string().max(20, 'Referral code is too long').optional().or(z.literal('')),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch Event Detail
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventService.getEventByIdOrSlug(slug),
  });

  // Track event view
  useEffect(() => {
    if (event) {
      trackEvent('event_card_clicked', {
        eventId: event._id,
        eventName: event.title,
        category: event.category,
      });
    }
  }, [event]);

  // Fetch Similar Events
  const { data: similarData, isLoading: isSimilarLoading } = useQuery({
    queryKey: ['similar-events', event?.category],
    queryFn: () => eventService.getEvents({ category: event?.category, limit: 4 }),
    enabled: !!event?.category,
  });

  const similarEvents = similarData?.events
    ? similarData.events.filter((e) => e._id !== event?._id).slice(0, 3)
    : [];

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
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
      ticketType: 'General Admission',
      couponCode: '',
      referralCode: '',
    },
  });

  // Watch fields for dynamic calculations
  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');
  const watchedTicket = watch('ticketType');
  const watchedCoupon = watch('couponCode');

  // Calculate ticket pricing based on selected options
  const basePrice = event?.price || 0;
  let finalPrice = basePrice;
  if (watchedTicket === 'VIP Pass') {
    finalPrice = basePrice > 0 ? basePrice + 500 : 499;
  } else if (watchedTicket === 'Student Discount') {
    finalPrice = basePrice > 0 ? Math.max(0, basePrice - 200) : 0;
  }

  // Apply discount if coupon matches EARLYBIRD20
  if (couponApplied) {
    finalPrice = Math.round(finalPrice * 0.8);
  }

  // Validate coupon code
  const handleApplyCoupon = () => {
    if (watchedCoupon?.trim().toUpperCase() === 'EARLYBIRD20') {
      setCouponApplied(true);
      setCouponError(false);
      toast.success('Coupon applied! 20% discount added.');
    } else {
      setCouponApplied(false);
      setCouponError(true);
      toast.error('Invalid coupon code.');
    }
  };

  // Step Validation Trigger
  const handleNextStep = async () => {
    let fieldsToValidate: ('name' | 'email' | 'phone' | 'college' | 'company' | 'source')[] = [];
    if (formStep === 1) {
      fieldsToValidate = ['name', 'email', 'phone'];
    } else if (formStep === 2) {
      fieldsToValidate = ['college', 'company', 'source'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setFormStep((s) => s + 1);
    }
  };

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
      toast.success('Registration successful! Confirmation ticket issued.');
      trackEvent('registration_success', {
        eventId: event?._id,
        eventName: event?.title,
        email: data.registration.email,
        ticketType: watchedTicket,
        finalPrice,
      });
      // Skip cleanup immediately to display dynamic confirmation invoice state
      setFormStep(4); 
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
    },
    onError: (error: any) => {
      const apiErrorMessage = error.response?.data?.message || 'Failed to complete registration';
      toast.error(apiErrorMessage);
      
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

  // Share Event Links
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      }).then(() => {
        trackEvent('share_clicked', { slug, method: 'native' });
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard.');
      trackEvent('share_clicked', { slug, method: 'clipboard' });
    }
  };

  // Add Calendar Reminder
  const handleAddToCalendar = () => {
    trackEvent('download_calendar', { slug });
    const title = encodeURIComponent(event?.title || '');
    const details = encodeURIComponent(event?.description || '');
    const location = encodeURIComponent(event?.location || '');
    const dateStr = new Date(event?.date || '').toISOString().replace(/-|:|\.\d\d\d/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateStr}/${dateStr}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (isEventLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8 animate-pulse space-y-8">
        <div className="h-6 w-24 bg-zinc-200 rounded" />
        <div className="h-[28rem] bg-zinc-200 rounded-3xl" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 w-2/3 bg-zinc-200 rounded" />
            <div className="h-4 w-full bg-zinc-200 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 rounded" />
          </div>
          <div className="h-72 bg-zinc-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-24 text-center">
        <div className="rounded-3xl border border-red-100 bg-red-50/20 p-8 dark:border-red-950/40">
          <BadgeAlert className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Event Not Found</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            The event you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Events
        </Link>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.success(isBookmarked ? 'Event removed from bookmarks.' : 'Event saved to bookmarks.');
              trackEvent(isBookmarked ? 'bookmark_clicked' : 'bookmark_clicked', { slug, active: !isBookmarked });
            }}
            className={`rounded-xl border p-2.5 transition shadow-sm ${
              isBookmarked
                ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                : 'border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <Bookmark className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleShare}
            className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 hover:text-zinc-950 transition dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Columns - Detailed Landing Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cover Banner */}
          <div className="relative h-[26rem] w-full overflow-hidden rounded-3xl border border-zinc-150 dark:border-zinc-800/80 shadow-md">
            <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
                  {event.category.toUpperCase()}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {event.title}
                </h1>
              </div>
              
              <span className={`rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow ${
                event.mode === 'Online'
                  ? 'bg-emerald-600'
                  : event.mode === 'Hybrid'
                  ? 'bg-blue-600'
                  : 'bg-zinc-900/90'
              }`}>
                {event.mode}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{event.rating} ({event.reviewsCount} reviews)</span>
              </div>
            </div>
            
            <div className="space-y-1 border-l border-zinc-100 pl-4 dark:border-zinc-850">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Difficulty</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{event.difficulty}</span>
            </div>

            <div className="space-y-1 border-l border-zinc-100 pl-4 dark:border-zinc-850">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Expected Audience</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{event.expectedAudience}</span>
            </div>

            <div className="space-y-1 border-l border-zinc-100 pl-4 dark:border-zinc-850">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Ticket Pricing</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                {event.price === 0 ? 'FREE' : `₹${event.price}`}
              </span>
            </div>
          </div>

          {/* Event Narrative */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">About this Event</h2>
              <p className="text-sm leading-relaxed text-zinc-650 dark:text-zinc-350 whitespace-pre-line">
                {event.longDescription}
              </p>
            </div>

            {event.requirements?.length > 0 && (
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3">Prerequisites & Requirements</h3>
                <ul className="space-y-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {event.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Agenda & Timeline */}
          {event.agenda?.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Event Agenda</h2>
              <div className="relative border-l-2 border-zinc-100 pl-6 space-y-6 ml-2 dark:border-zinc-850">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Ring indicator */}
                    <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-orange-500 dark:bg-zinc-900" />
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                      {item.time}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{item.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers Panel */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Featured Speakers</h2>
            <div className="flex flex-col sm:flex-row gap-5 items-center p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800/80">
              <img
                src={event.speakerImage}
                alt={event.speaker}
                className="h-16 w-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
              />
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{event.speaker}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {event.speakerTitle}
                </p>
                <p className="text-xs text-zinc-400 max-w-md">
                  Expert speaker in {event.category} concepts with extensive hands-on expertise building enterprise infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic FAQ Accordion */}
          {event.faqs?.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {event.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-start gap-2">
                      <HelpCircle className="h-4.5 w-4.5 text-orange-600 shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificate Badge */}
          <div className="rounded-3xl border border-orange-200 bg-orange-50/20 p-6 flex flex-col sm:flex-row items-center gap-5 dark:border-orange-950/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-orange-900 dark:text-orange-400">Certified Attendance Included</h3>
              <p className="text-xs text-orange-850 dark:text-zinc-400">
                Unlock a verifiable blockchain completion certificate powered by Polygon on successful attendance. Perfect for your LinkedIn and professional resumes!
              </p>
            </div>
          </div>

          {/* Sponsors Section */}
          {event.sponsors?.length > 0 && (
            <div className="text-center space-y-4 py-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sponsors & Community Partners</h3>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition duration-300">
                {event.sponsors.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Ticket Card Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Reservation Ticket</h2>
              {event.price === 0 ? (
                <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  FREE
                </span>
              ) : (
                <span className="text-base font-black text-orange-600 dark:text-orange-400">
                  ₹{event.price}
                </span>
              )}
            </div>

            {/* Event Meta Details */}
            <div className="space-y-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block tracking-wider">Date</span>
                  <span className="text-zinc-950 dark:text-zinc-200 font-bold">
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
                  <span className="text-[10px] text-zinc-400 uppercase block tracking-wider">Time</span>
                  <span className="text-zinc-950 dark:text-zinc-200 font-bold">
                    {new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block tracking-wider">Venue Location</span>
                  <span className="text-zinc-950 dark:text-zinc-200 font-bold line-clamp-1">{event.location}</span>
                </div>
              </div>
            </div>

            {/* Seat Capacity Meter */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacity status:
                </span>
                <span className={event.availableSeats > 0 ? 'text-zinc-850 dark:text-zinc-200' : 'text-red-500 font-extrabold animate-pulse'}>
                  {event.availableSeats > 0 ? `${event.availableSeats} Seats Left` : 'FULLY BOOKED'}
                </span>
              </div>

              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-850">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    event.availableSeats <= 10
                      ? 'bg-red-500'
                      : event.availableSeats <= 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (event.availableSeats / (event.availableSeats + event.registeredCount)) * 100))}%`
                  }}
                />
              </div>
              <span className="text-[9px] text-zinc-400 block text-right font-medium">
                {event.registeredCount} developers registered
              </span>
            </div>

            {/* Primary CTA */}
            {event.availableSeats > 0 ? (
              <button
                onClick={() => {
                  setFormStep(1);
                  setCouponApplied(false);
                  setCouponError(false);
                  setIsRegisterModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/10 hover:bg-orange-500 transition-all hover:scale-[1.01]"
              >
                Register Now
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-200 py-3.5 text-sm font-bold text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-650"
              >
                House Full
              </button>
            )}

            {/* Calendar & Reminders Links */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              <button
                onClick={handleAddToCalendar}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <CalendarPlus className="h-4 w-4 text-zinc-400" />
                Add to Calendar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Dynamic Multi-Step Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Secure Seat Registration"
      >
        <div className="space-y-6">
          {/* Progress Bar (Only visible before completion Step 4) */}
          {formStep < 4 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                <span>Step {formStep} of 3</span>
                <span>
                  {formStep === 1 && 'Personal Info'}
                  {formStep === 2 && 'Organization'}
                  {formStep === 3 && 'Ticket & Checkout'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                <div
                  className="h-full bg-orange-600 transition-all duration-350"
                  style={{ width: `${(formStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Content Wrapper */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* ==========================================
                STEP 1: Personal Details
                ========================================== */}
            {formStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. Aditi Sharma"
                    {...register('name')}
                    className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                      errors.name ? 'border-red-500' : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="e.g. aditi.sharma@example.com"
                    {...register('email')}
                    className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                      errors.email ? 'border-red-500' : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-phone" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-450 font-bold">
                      +91
                    </span>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="9876543210"
                      {...register('phone')}
                      className={`w-full rounded-xl border py-2.5 pl-12 pr-3.5 text-sm outline-none transition dark:bg-zinc-950/50 ${
                        errors.phone ? 'border-red-500' : 'border-zinc-200 focus:border-orange-500 dark:border-zinc-800'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-500 shadow"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 2: Credentials & Referral Source
                ========================================== */}
            {formStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="reg-college" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      College / University
                    </label>
                    <input
                      id="reg-college"
                      type="text"
                      placeholder="e.g. DTU Delhi"
                      {...register('college')}
                      className="w-full rounded-xl border border-zinc-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-850 dark:bg-zinc-950/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-company" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Company Org
                    </label>
                    <input
                      id="reg-company"
                      type="text"
                      placeholder="e.g. Cred Tech"
                      {...register('company')}
                      className="w-full rounded-xl border border-zinc-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-850 dark:bg-zinc-950/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-source" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    Referral Channel *
                  </label>
                  <select
                    id="reg-source"
                    {...register('source')}
                    className="w-full rounded-xl border border-zinc-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-850 dark:bg-zinc-950/50"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Email">Email Announcement</option>
                    <option value="Direct">Direct / Word of Mouth</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-350"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-500 shadow"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 3: Ticket Types, Coupons & Checkout
                ========================================== */}
            {formStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Select Ticket Tier */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Select Ticket Tier</span>
                  <div className="grid gap-2.5">
                    {/* General Admission */}
                    <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      watchedTicket === 'General Admission'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-zinc-200 hover:bg-zinc-50/50 dark:border-zinc-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          value="General Admission"
                          {...register('ticketType')}
                          className="accent-orange-600 h-4 w-4"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-150 block">General Admission</span>
                          <span className="text-[10px] text-zinc-500 block">Access to keynotes, open workspaces & certificate</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                        {basePrice === 0 ? 'FREE' : `₹${basePrice}`}
                      </span>
                    </label>

                    {/* VIP Pass */}
                    <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      watchedTicket === 'VIP Pass'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-zinc-200 hover:bg-zinc-50/50 dark:border-zinc-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          value="VIP Pass"
                          {...register('ticketType')}
                          className="accent-orange-600 h-4 w-4"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-150 block">VIP Priority Pass</span>
                          <span className="text-[10px] text-zinc-500 block">Reserved front seating, VIP buffet & speaker roundtable</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                        ₹{basePrice > 0 ? basePrice + 500 : 499}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label htmlFor="reg-coupon" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    Promo Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="reg-coupon"
                      type="text"
                      placeholder="e.g. EARLYBIRD20"
                      {...register('couponCode')}
                      className="flex-grow rounded-xl border border-zinc-250 py-2 px-3 text-xs outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-xl border border-zinc-900 bg-zinc-900 text-white px-4 py-2 text-xs font-bold hover:bg-zinc-800 dark:bg-zinc-800 dark:border-zinc-800"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      ✓ Coupon Applied! Save 20% on booking.
                    </span>
                  )}
                  {couponError && (
                    <span className="text-[10px] text-red-500 font-bold block">
                      ⚠ Invalid promo coupon. Try EARLYBIRD20.
                    </span>
                  )}
                </div>

                {/* Checkout Summary Invoice Box */}
                <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 space-y-2 text-xs dark:bg-zinc-950/40 dark:border-zinc-800">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Invoice Invoice Summary</span>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Ticket Type:</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-150">{watchedTicket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Booking price:</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-150">
                      {watchedTicket === 'General Admission' && basePrice === 0 ? 'FREE' : `₹${watchedTicket === 'VIP Pass' ? (basePrice > 0 ? basePrice + 500 : 499) : (basePrice > 0 ? Math.max(0, basePrice - 200) : 0)}`}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Promo Coupon (20% off):</span>
                      <span className="font-bold">Active</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-zinc-200/60 pt-2 font-bold text-sm text-zinc-900 dark:text-zinc-50 dark:border-zinc-850">
                    <span>Total Owed:</span>
                    <span className="text-orange-650 dark:text-orange-400">
                      {finalPrice === 0 ? 'FREE' : `₹${finalPrice}`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-350"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-70 shadow"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Complete Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 4: Registration Success Confirmation
                ========================================== */}
            {formStep === 4 && (
              <div className="text-center py-6 space-y-5 animate-fadeIn">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                  <CheckCircle className="h-8 w-8" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Booking Verified!</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Your registration has been successfully processed and recorded in our database ledger.
                  </p>
                </div>

                {/* Invoice Invoice receipt details */}
                <div className="bg-emerald-50/20 border border-emerald-150/40 rounded-2xl p-4 text-xs max-w-sm mx-auto space-y-2 dark:bg-zinc-950/40 dark:border-zinc-850">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Registrant:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{watchedName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Email:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{watchedEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Mobile ID:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">+91 {watchedPhone}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200/50 pt-2 font-bold text-zinc-900 dark:text-zinc-100 dark:border-zinc-850">
                    <span>Owed:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{finalPrice === 0 ? 'FREE' : `₹${finalPrice}`}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterModalOpen(false);
                      setFormStep(1);
                    }}
                    className="rounded-xl bg-zinc-900 text-white px-6 py-2.5 text-xs font-bold hover:bg-zinc-800 transition dark:bg-zinc-800"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </Modal>
    </div>
  );
}
