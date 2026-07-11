/**
 * src/components/landing/LandingFooter.tsx
 * Five-column footer: brand, product links, resources, company, and social icons.
 */
'use client';

import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',      href: '#features' },
    { label: 'IBM AI Stack',  href: '#ibm-stack' },
    { label: 'Architecture',  href: '#architecture' },
    { label: 'Pricing',       href: '#pricing' },
    { label: 'Changelog',     href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Langflow Guide',href: '#' },
    { label: 'Status Page',   href: '#' },
  ],
  Company: [
    { label: 'About',         href: '#' },
    { label: 'Blog',          href: '#' },
    { label: 'Careers',       href: '#' },
    { label: 'Contact',       href: '/contact' },
    { label: 'Privacy Policy',href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-base-border bg-base-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </span>
              <span className="font-bold text-text-primary">
                SocialPulse <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mb-6">
              AI-powered social media intelligence built on IBM Granite, Langflow,
              and Watson NLP. IBM AI Hackathon 2024 entry.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Github,   href: '#', label: 'GitHub'   },
                { Icon: Twitter,  href: '#', label: 'Twitter'  },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-base-border flex items-center justify-center
                             text-text-muted hover:text-white hover:border-brand-indigo/40 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-text-primary uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-base-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} SocialPulse AI. Built for the IBM AI Hackathon 2024.</p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
