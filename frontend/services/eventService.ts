import axios from 'axios';
import { Event, Registration, DashboardStats } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

export const eventService = {
  /**
   * Fetches events with support for search, pagination, and filters.
   */
  async getEvents(params?: {
    search?: string;
    category?: string;
    mode?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    events: Event[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    const response = await apiClient.get('/events', { params });
    return response.data.data;
  },

  /**
   * Fetches a single event by ID or slug.
   */
  async getEventByIdOrSlug(idOrSlug: string): Promise<Event> {
    const response = await apiClient.get(`/events/${idOrSlug}`);
    return response.data.data;
  },

  /**
   * Registers a user for a specific event.
   */
  async registerForEvent(
    eventId: string,
    data: {
      name: string;
      email: string;
      phone: string;
      college?: string;
      company?: string;
      source: string;
    }
  ): Promise<{
    registration: Registration;
    event: {
      id: string;
      title: string;
      availableSeats: number;
      registeredCount: number;
    };
  }> {
    const response = await apiClient.post(`/events/${eventId}/register`, data);
    return response.data;
  },

  /**
   * Fetches admin dashboard statistics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  },

  /**
   * Fetches all registrations with optional search filtering (for admin dashboard).
   */
  async searchRegistrations(search?: string): Promise<Registration[]> {
    const response = await apiClient.get('/analytics/registrations', {
      params: { search },
    });
    return response.data.data;
  },
};
export default eventService;
