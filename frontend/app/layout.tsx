import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QueryProvider from '../components/QueryProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'BharatEvents | India\'s Premier Tech & AI Event Hub',
  description: 'Discover and register for top workshops, hackathons, seminars, bootcamps, and AI meetups across India\'s tech capitals.',
  keywords: ['tech events India', 'AI meetups Bengaluru', 'hackathons Delhi', 'developer workshops India', 'UPI seminar Mumbai'],
  authors: [{ name: 'Hariom' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'BharatEvents | India\'s Premier Tech & AI Event Hub',
    description: 'Discover and register for top tech workshops, hackathons, and AI meetups across India.',
    url: 'https://bharatevents.vercel.app',
    siteName: 'BharatEvents',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'BharatEvents Promo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <QueryProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'rounded-2xl border border-zinc-100 bg-white font-medium text-zinc-900 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50',
            }}
          />
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          {modal}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
