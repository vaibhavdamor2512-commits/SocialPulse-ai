/**
 * src/lib/utils.ts
 * Shared utility functions — formatting, class merging, helpers.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ── Class merging (clsx + tailwind-merge) ─────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Number formatters ──────────────────────────────────────────────────────────
export function formatNumber(n: number, compact = true): string {
  if (!compact) return n.toLocaleString('en-US');
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

// ── Date formatters ────────────────────────────────────────────────────────────
export function formatDate(iso: string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(iso);
  const formats = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  } as const;
  return date.toLocaleDateString('en-US', formats[style]);
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso, 'short');
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start, 'short')} – ${formatDate(end, 'short')}`;
}

// ── Growth indicator ──────────────────────────────────────────────────────────
export function growthLabel(pct: number): string {
  if (pct > 0) return `+${formatPercent(pct)}`;
  if (pct < 0) return formatPercent(pct);
  return '0%';
}

export function growthColor(pct: number): string {
  if (pct > 0) return 'text-accent-green';
  if (pct < 0) return 'text-red-400';
  return 'text-text-muted';
}

// ── String helpers ────────────────────────────────────────────────────────────
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function truncate(s: string, len: number): string {
  return s.length > len ? `${s.slice(0, len)}…` : s;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Platform helpers ──────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  twitter:   '#1da1f2',
  linkedin:  '#0a66c2',
  facebook:  '#1877f2',
};

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] ?? '#6172f3';
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter:   'X / Twitter',
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
};

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? capitalize(platform);
}

// ── Severity / status ─────────────────────────────────────────────────────────
export function severityColor(severity: string): string {
  switch (severity) {
    case 'success': return 'text-accent-green';
    case 'warning': return 'text-accent-orange';
    case 'error':   return 'text-red-400';
    default:        return 'text-accent-sky';
  }
}

export function severityBg(severity: string): string {
  switch (severity) {
    case 'success': return 'bg-accent-green/10 border-accent-green/20';
    case 'warning': return 'bg-accent-orange/10 border-accent-orange/20';
    case 'error':   return 'bg-red-400/10 border-red-400/20';
    default:        return 'bg-accent-sky/10 border-accent-sky/20';
  }
}

export function campaignStatusColor(status: string): string {
  switch (status) {
    case 'active':    return 'text-accent-green';
    case 'paused':    return 'text-accent-orange';
    case 'completed': return 'text-accent-indigo';
    default:          return 'text-text-muted';
  }
}

// ── Debounce ──────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
