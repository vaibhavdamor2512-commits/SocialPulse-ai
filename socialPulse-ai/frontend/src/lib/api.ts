/**
 * src/lib/api.ts
 * Axios HTTP client with JWT injection, token refresh, and typed helpers.
 */

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import type {
  AnalyticsOverview,
  Campaign,
  CampaignGenerateRequest,
  ChatRequest,
  ChatResponse,
  Competitor,
  GenerateRequest,
  GenerateResponse,
  Influencer,
  InfluencerNetwork,
  InfluencerProfile,
  Notification,
  NotificationsResponse,
  Report,
  ReportFormat,
  ReportType,
  SentimentData,
  TokenResponse,
  TrendPrediction,
  User,
  ViralityPrediction,
} from '@/types';

// ── Base instance ──────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor — inject JWT ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 → clear auth ───────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Token helpers ──────────────────────────────────────────────────────────────
export function setTokens(tokens: TokenResponse): void {
  Cookies.set('access_token',  tokens.access_token,  { expires: 1 / 24, sameSite: 'Strict' });
  Cookies.set('refresh_token', tokens.refresh_token, { expires: 7,      sameSite: 'Strict' });
}

export function clearTokens(): void {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function hasToken(): boolean {
  return !!Cookies.get('access_token');
}

// ── Typed API methods ──────────────────────────────────────────────────────────

// Auth
export const authApi = {
  signup: (body: { name: string; email: string; password: string }) =>
    apiClient.post<User>('/auth/signup', body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    apiClient.post<TokenResponse>('/auth/login', body).then((r) => r.data),

  me: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),

  updateMe: (body: Partial<User>) =>
    apiClient.put<User>('/auth/me', body).then((r) => r.data),
};

// Analytics
export const analyticsApi = {
  overview: (period = '30d') =>
    apiClient.get<AnalyticsOverview>('/analytics/overview', { params: { period } }).then((r) => r.data),

  sentiment: (platform?: string) =>
    apiClient.get<SentimentData>('/analytics/sentiment', { params: { platform } }).then((r) => r.data),

  trendingHashtags: (limit = 10) =>
    apiClient.get<{ hashtags: Array<{ tag: string; posts: number; reach: number; trend: string; pct_change: number }> }>(
      '/analytics/hashtags/trending', { params: { limit } }
    ).then((r) => r.data),

  bestPostingTimes: () =>
    apiClient.get<{ posting_times: Record<string, Array<{ day: string; hour: number; score: number; label: string }>> }>(
      '/analytics/best-posting-times'
    ).then((r) => r.data),

  platformComparison: (metric = 'engagement') =>
    apiClient.get('/analytics/platform-comparison', { params: { metric } }).then((r) => r.data),
};

// Assistant
export const assistantApi = {
  chat: (body: ChatRequest) =>
    apiClient.post<ChatResponse>('/assistant/chat', body).then((r) => r.data),

  analyzeImage: (file: File, platform = 'instagram') => {
    const form = new FormData();
    form.append('file', file);
    form.append('platform', platform);
    return apiClient
      .post<{ caption: string; suggested_hashtags: string[]; platform: string; content_score: number }>
      ('/assistant/analyze-image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },

  generate: (body: GenerateRequest) =>
    apiClient.post<GenerateResponse>('/assistant/generate', body).then((r) => r.data),
};

// Campaigns
export const campaignsApi = {
  list: (status?: string) =>
    apiClient.get<Campaign[]>('/campaigns/', { params: status ? { status_filter: status } : {} }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Campaign>(`/campaigns/${id}`).then((r) => r.data),

  create: (body: Omit<Campaign, 'id' | 'spent' | 'metrics' | 'ai_score' | 'created_at'>) =>
    apiClient.post<Campaign>('/campaigns/', body).then((r) => r.data),

  update: (id: string, body: Partial<Campaign>) =>
    apiClient.put<Campaign>(`/campaigns/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/campaigns/${id}`),

  generate: (body: CampaignGenerateRequest) =>
    apiClient.post<{ strategy: string; ai_score: number; estimated_reach: number }>
    ('/campaigns/generate', body).then((r) => r.data),

  analytics: () =>
    apiClient.get('/campaigns/analytics/summary').then((r) => r.data),
};

// Competitors
export const competitorsApi = {
  list: () =>
    apiClient.get<Competitor[]>('/competitors/').then((r) => r.data),

  add: (body: { name: string; handle: string; platform: string }) =>
    apiClient.post<Competitor>('/competitors/', body).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/competitors/${id}`),

  swot: (competitor?: string) =>
    apiClient.get('/competitors/swot', { params: competitor ? { competitor } : {} }).then((r) => r.data),

  recommendations: () =>
    apiClient.get('/competitors/recommendations').then((r) => r.data),
};

// Influencers
export const influencersApi = {
  list: (params?: { platform?: string; min_score?: number; limit?: number }) =>
    apiClient.get<InfluencerProfile[]>('/influencers/', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<InfluencerProfile>(`/influencers/${id}`).then((r) => r.data),

  add: (body: Omit<InfluencerProfile, 'id'>) =>
    apiClient.post<InfluencerProfile>('/influencers/', body).then((r) => r.data),

  update: (id: string, body: Partial<InfluencerProfile>) =>
    apiClient.put<InfluencerProfile>(`/influencers/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/influencers/${id}`),

  network: () =>
    apiClient.get<InfluencerNetwork>('/influencers/network').then((r) => r.data),

  score: (id: string) =>
    apiClient.get(`/influencers/${id}/score`).then((r) => r.data),
};

// Trends
export const trendsApi = {
  list: (params?: { category?: string; direction?: string; min_confidence?: number }) =>
    apiClient.get<{ predictions: TrendPrediction[] }>('/trends/', { params }).then((r) => r.data),

  forecast: (weeks = 6) =>
    apiClient.get('/trends/forecast', { params: { weeks } }).then((r) => r.data),

  virality: () =>
    apiClient.get<{ predictions: ViralityPrediction[] }>('/trends/virality').then((r) => r.data),

  hashtagDeepDive: (tag: string) =>
    apiClient.get(`/trends/hashtag/${encodeURIComponent(tag)}`).then((r) => r.data),
};

// Reports
export const reportsApi = {
  list: () =>
    apiClient.get<Report[]>('/reports/').then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Report>(`/reports/${id}`).then((r) => r.data),

  generate: (body: {
    report_type: ReportType;
    format: ReportFormat;
    period?: string;
    include_ai_summary?: boolean;
  }) =>
    apiClient.post<Report>('/reports/generate', body).then((r) => r.data),

  downloadUrl: (id: string) => `${BASE_URL}/reports/${id}/download`,

  delete: (id: string) =>
    apiClient.delete(`/reports/${id}`),
};

// Notifications
export const notificationsApi = {
  list: (params?: { unread_only?: boolean; limit?: number; skip?: number }) =>
    apiClient.get<NotificationsResponse>('/notifications/', { params }).then((r) => r.data),

  markRead: (id: string) =>
    apiClient.put<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.put<{ marked_read: number }>('/notifications/read-all').then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};
