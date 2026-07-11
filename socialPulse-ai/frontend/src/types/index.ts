/**
 * src/types/index.ts
 * Complete TypeScript interfaces for SocialPulse AI.
 */

// ── Auth ───────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatar_url?: string | null;
  connected_platforms: Platform[];
  ai_config: AIConfig;
  notification_prefs: NotificationPrefs;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIConfig {
  model: string;
  temperature: number;
  language: string;
  max_tokens: number;
}

export interface NotificationPrefs {
  email_alerts: boolean;
  viral_predictions: boolean;
  campaign_updates: boolean;
  competitor_alerts: boolean;
  weekly_digest: boolean;
}

export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'facebook';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ── Analytics ──────────────────────────────────────────────────────────────────
export interface PlatformMetrics {
  followers: number;
  engagement: number;
  reach: number;
  posts: number;
  growth: number;
}

export interface AnalyticsOverview {
  total_followers: number;
  total_reach: number;
  avg_engagement_rate: number;
  total_posts: number;
  follower_growth: number;
  follower_growth_prev: number;
  reach_growth: number;
  engagement_growth: number;
  period: string;
  platforms: Record<Platform, PlatformMetrics>;
  followers_timeline: TimelinePoint[];
  engagement_timeline: TimelinePoint[];
}

export interface TimelinePoint {
  date: string;
  instagram?: number;
  twitter?: number;
  linkedin?: number;
  facebook?: number;
  [key: string]: string | number | undefined;
}

export interface SentimentData {
  overall_score: number;
  label: 'positive' | 'neutral' | 'negative';
  breakdown: { positive: number; neutral: number; negative: number };
  emotions: Record<string, number>;
  top_keywords: string[];
  trend: 'up' | 'down' | 'stable';
  score_change: number;
  platform_sentiment: Record<Platform, { score: number; label: string }>;
}

export interface TrendingHashtag {
  tag: string;
  posts: number;
  reach: number;
  trend: 'up' | 'down' | 'stable';
  pct_change: number;
}

export interface PostingTime {
  day: string;
  hour: number;
  score: number;
  label: string;
}

// ── Assistant ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  platform?: Platform | 'general';
  content_type?: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  platform?: Platform | 'general';
  content_type?: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  model: string;
  tokens_used: number;
}

export interface GenerateRequest {
  prompt: string;
  platform: Platform | 'general';
  content_type: string;
  tone?: string;
}

export interface GenerateResponse {
  content: string;
  platform: string;
  content_type: string;
  suggested_hashtags: string[];
  sentiment_preview?: { label: string; score: number } | null;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignObjective =
  | 'brand_awareness'
  | 'lead_generation'
  | 'conversion'
  | 'engagement'
  | 'traffic';

export interface CampaignMetrics {
  ctr: number;
  roas: number;
  impressions: number;
  clicks: number;
  reach?: number;
  engagement_rate?: number;
  conversion_rate?: number;
}

export interface CampaignTask {
  id: string;
  title: string;
  completed: boolean;
  due_date: string;
}

export interface CampaignMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string | null;
}

export interface CampaignAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface CampaignActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface CampaignCalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: Platform;
  status: 'planned' | 'published' | 'review';
}

export interface CampaignTimelineEvent {
  date: string;
  activity: string;
  platform: Platform;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  platforms: Platform[];
  target_audience: string;
  metrics: CampaignMetrics;
  ai_score: number;
  ai_strategy?: string;
  content_schedule?: string;
  progress_percent?: number;
  tasks?: CampaignTask[];
  team?: CampaignMember[];
  attachments?: CampaignAttachment[];
  notes?: string;
  activity?: CampaignActivityItem[];
  calendar_events?: CampaignCalendarEvent[];
  timeline?: CampaignTimelineEvent[];
  recent_activity?: string[];
  created_at?: string;
}

export interface CampaignGenerateRequest {
  campaign_name: string;
  objective: string;
  budget: number;
  target_audience: string;
  platforms: Platform[];
  duration_days: number;
  brand_voice?: string;
}

// ── Competitors ───────────────────────────────────────────────────────────────
export interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  growth_rate: number;
  engagement: number;
  sentiment: number;
  posts_per_week: number;
  top_hashtags: string[];
  avatar_url?: string | null;
}

export interface SWOTAnalysis {
  competitor: string;
  analysis: string;
  structured: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  powered_by: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  potential_impact: string;
}

// ── Influencers ───────────────────────────────────────────────────────────────
export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  engagement_rate: number;
  niche: string;
  ai_collaboration_score: number;
  audience_match: number;
  authenticity: number;
  avg_likes: number;
  avg_comments: number;
  location?: string;
  avatar_url?: string | null;
}

export type InfluencerStatus = 'invited' | 'negotiating' | 'active' | 'completed' | 'declined';

export interface InfluencerSocialAccount {
  platform: Platform;
  handle: string;
  url: string;
}

export interface InfluencerContact {
  email: string;
  phone: string;
  manager: string;
}

export interface InfluencerHistoryEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'active' | 'completed' | 'declined' | 'invited';
}

export interface InfluencerDemographic {
  label: string;
  share: number;
}

export interface PlatformDistribution {
  platform: Platform;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface InfluencerProfile extends Influencer {
  bio: string;
  avg_views: number;
  collaboration_status: InfluencerStatus;
  social_accounts: InfluencerSocialAccount[];
  audience_demographics: InfluencerDemographic[];
  collaboration_history: InfluencerHistoryEntry[];
  campaigns: Array<{ id: string; name: string; status: string }>;
  notes: string;
  contact: InfluencerContact;
  platform_distribution: PlatformDistribution[];
  followers_growth: TimeSeriesPoint[];
  engagement_trend: TimeSeriesPoint[];
  reach_series: TimeSeriesPoint[];
}

export interface InfluencerRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  potential_impact: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  size: number;
  color: string;
  type: 'brand' | 'influencer' | 'audience';
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

export interface InfluencerNetwork {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  generated_at: string;
}

export interface CollaborationScore {
  influencer_id: string;
  influencer_name: string;
  overall_score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  score_breakdown: {
    audience_alignment: number;
    engagement_quality: number;
    brand_safety: number;
    content_authenticity: number;
    reach_potential: number;
  };
  ai_recommendation: string;
  estimated_reach: number;
  estimated_cpm: number;
  powered_by: string;
}

// ── Trends ────────────────────────────────────────────────────────────────────
export interface TrendPrediction {
  hashtag: string;
  category: string;
  current_volume: number;
  predicted_volume: number;
  confidence: number;
  direction: 'up' | 'down' | 'stable';
  weeks: number[];
  peak_day: string;
  related_hashtags: string[];
}

export interface ForecastPoint {
  week: string;
  date: string;
  predicted: number;
  actual?: number;
}

export interface ViralityPrediction {
  content_type: string;
  platform: Platform;
  virality_score: number;
  predicted_reach: number;
  confidence: number;
  key_factors: string[];
}

// ── Reports ───────────────────────────────────────────────────────────────────
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportType =
  | 'analytics_summary'
  | 'campaign_performance'
  | 'competitor_analysis'
  | 'sentiment_report'
  | 'influencer_report'
  | 'trend_forecast';

export interface Report {
  id: string;
  name: string;
  report_type: ReportType;
  format: ReportFormat;
  period: string;
  platforms?: string[];
  ai_summary?: string;
  status: 'generating' | 'ready' | 'failed';
  download_url?: string;
  file_size_bytes?: number;
  created_at: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: { skip: number; limit: number };
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface APIError {
  detail: string | Array<{ field: string; message: string }>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
