/**
 * src/app/page.tsx
 * Root "/" route — Landing page.
 * Authenticated users (cookie present) are redirected to /dashboard.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata = {
  title: 'SocialPulse AI — Intelligent Social Media Intelligence Platform',
  description:
    'AI-powered social media analytics, trend prediction, competitor analysis, and campaign management powered by IBM Granite & Watson NLP.',
};

export default async function RootPage() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('access_token');

  if (hasToken) {
    redirect('/dashboard');
  }

  return <LandingPage />;
}
