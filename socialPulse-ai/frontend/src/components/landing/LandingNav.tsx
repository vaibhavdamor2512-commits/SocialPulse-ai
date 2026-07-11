/**
 * src/components/landing/LandingNav.tsx
 * Sticky top navigation bar for the landing page.
 * Becomes opaque + blurred when scrolled past 60px.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'IBM AI Stack', href: '#ibm-stack' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'FAQ',          href: '#faq' },
];

export function LandingNav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-base/90 backdrop-blur-md border-b border-base-border'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <Zap className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold text-base text-text-primary group-hover:text-white transition-colors">
            SocialPulse <span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">Get Started Free</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-base/95 backdrop-blur-md border-b border-base-border px-4 pb-5 pt-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-text-secondary hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">Get Started Free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
