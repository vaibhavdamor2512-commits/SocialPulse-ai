/**
 * src/app/layout.tsx
 * Root layout — Providers, dark mode class, metadata, global CSS.
 */
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'SocialPulse AI',
    template: '%s | SocialPulse AI',
  },
  description:
    'Intelligent Social Media Agent powered by IBM Granite, Langflow & Watson NLP.',
  keywords: ['social media', 'AI', 'IBM Granite', 'analytics', 'marketing', 'automation'],
  openGraph: {
    title: 'SocialPulse AI',
    description: 'Monitor, analyze, predict and optimize your social media with IBM AI.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-base text-text-primary antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
