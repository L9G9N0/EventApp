import { MetadataRoute } from 'next';
import eventService from '../services/eventService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bharatevents.vercel.app';
  
  // Static core routes
  const routes = [
    '',
    '/admin/dashboard',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Fetch events list to generate dynamic paths
    const data = await eventService.getEvents({ page: 1, limit: 100 });
    const eventRoutes = data.events.map((evt) => ({
      url: `${baseUrl}/events/${evt.slug}`,
      lastModified: new Date(evt.updatedAt || evt.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    
    return [...routes, ...eventRoutes];
  } catch (error) {
    console.error('[Sitemap Generator] Failed to fetch dynamic event paths:', error);
    return routes;
  }
}
// Set dynamic execution parameter to avoid static build failures when API is offline
export const dynamic = 'force-dynamic';
