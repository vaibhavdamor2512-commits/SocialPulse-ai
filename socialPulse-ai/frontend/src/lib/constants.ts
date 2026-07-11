/**
 * src/lib/constants.ts
 * App-wide constants: navigation config, platform metadata, query keys.
 */

// ── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;           // Lucide icon name
  badge?: string | number;
  children?: NavItem[];
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard',          href: '/dashboard',   icon: 'LayoutDashboard' },
  { label: 'AI Assistant',        href: '/assistant',   icon: 'Bot' },
  { label: 'Analytics',           href: '/analytics',   icon: 'BarChart3' },
  { label: 'Campaigns',           href: '/campaigns',   icon: 'Rocket' },
  { label: 'Competitor Analysis', href: '/competitors', icon: 'Target' },
  { label: 'Trend Prediction',    href: '/trends',      icon: 'TrendingUp' },
  { label: 'Notifications',       href: '/notifications', icon: 'Bell' },
  { label: 'Influencer Mapping',  href: '/influencers', icon: 'Star' },
  { label: 'Reports',             href: '/reports',     icon: 'FileText' },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Contact',  href: '/contact',  icon: 'Mail' },
];

// ── Platform metadata ─────────────────────────────────────────────────────────
export const PLATFORMS = ['instagram', 'twitter', 'linkedin', 'facebook'] as const;

export const PLATFORM_META = {
  instagram: {
    label: 'Instagram',
    color: '#e1306c',
    bg: 'rgba(225,48,108,0.15)',
    border: 'rgba(225,48,108,0.3)',
    chartColor: '#e1306c',
  },
  twitter: {
    label: 'X / Twitter',
    color: '#1da1f2',
    bg: 'rgba(29,161,242,0.15)',
    border: 'rgba(29,161,242,0.3)',
    chartColor: '#1da1f2',
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0a66c2',
    bg: 'rgba(10,102,194,0.15)',
    border: 'rgba(10,102,194,0.3)',
    chartColor: '#0a66c2',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877f2',
    bg: 'rgba(24,119,242,0.15)',
    border: 'rgba(24,119,242,0.3)',
    chartColor: '#1877f2',
  },
} as const;

// ── Chart colors ──────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  primary:   '#6172f3',
  secondary: '#a855f7',
  tertiary:  '#ec4899',
  green:     '#4ade80',
  orange:    '#fb923c',
  sky:       '#38bdf8',
  pink:      '#f472b6',
};

export const PLATFORM_CHART_COLORS = [
  PLATFORM_META.instagram.chartColor,
  PLATFORM_META.twitter.chartColor,
  PLATFORM_META.linkedin.chartColor,
  PLATFORM_META.facebook.chartColor,
];

// ── TanStack Query keys ────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  // Auth
  me: ['me'] as const,

  // Analytics
  analyticsOverview:    (period: string) => ['analytics', 'overview', period] as const,
  analyticsSentiment:   (platform?: string) => ['analytics', 'sentiment', platform] as const,
  trendingHashtags:     (limit?: number) => ['analytics', 'hashtags', limit] as const,
  bestPostingTimes:     () => ['analytics', 'posting-times'] as const,
  platformComparison:   (metric: string) => ['analytics', 'platform-comparison', metric] as const,

  // Assistant
  conversations: ['conversations'] as const,

  // Campaigns
  campaigns:         ['campaigns'] as const,
  campaign:          (id: string) => ['campaigns', id] as const,
  campaignAnalytics: ['campaigns', 'analytics'] as const,

  // Competitors
  competitors:            ['competitors'] as const,
  competitorSwot:         (name?: string) => ['competitors', 'swot', name] as const,
  competitorRecommendations: ['competitors', 'recommendations'] as const,

  // Influencers
  influencers:       (platform?: string) => ['influencers', platform] as const,
  influencerNetwork: ['influencers', 'network'] as const,
  influencerScore:   (id: string) => ['influencers', id, 'score'] as const,

  // Trends
  trends:         () => ['trends'] as const,
  trendForecast:  (weeks: number) => ['trends', 'forecast', weeks] as const,
  virality:       ['trends', 'virality'] as const,

  // Reports
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,

  // Notifications
  notifications: (unreadOnly?: boolean) => ['notifications', unreadOnly] as const,
} as const;

// ── App constants ──────────────────────────────────────────────────────────────
export const APP_NAME = 'SocialPulse AI';
export const APP_DESCRIPTION = 'Intelligent Social Media Agent';
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 64;
