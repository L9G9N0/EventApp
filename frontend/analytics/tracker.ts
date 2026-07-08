import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type ClientAnalyticsEventType =
  | 'event_list_viewed'
  | 'event_search_performed'
  | 'event_filter_applied'
  | 'event_card_clicked'
  | 'registration_submitted'
  | 'registration_success'
  | 'registration_failed'
  | 'dashboard_opened'
  | 'dashboard_export_csv'
  | 'share_clicked'
  | 'bookmark_clicked'
  | 'download_calendar'
  | 'copy_url'
  | 'speaker_clicked'
  | 'faq_expanded';

/**
 * Reusable utility to log analytics events.
 * Logs directly to the browser console and forwards to the MongoDB backend.
 */
export const trackEvent = async (
  eventType: ClientAnalyticsEventType,
  payload: Record<string, any> = {}
): Promise<void> => {
  // 1. Log in the browser console
  console.log(`[Analytics Event] %c${eventType}`, 'color: #0ea5e9; font-weight: bold;', {
    payload,
    timestamp: new Date().toISOString(),
  });

  // 2. Persist to MongoDB through backend API
  try {
    await axios.post(`${API_BASE_URL}/api/analytics/log`, {
      eventType,
      payload,
    });
  } catch (error) {
    // Suppress console error to prevent cluttering but log warning
    console.warn(`[Analytics Tracker] Failed to persist event to server: ${eventType}`, error);
  }
};
