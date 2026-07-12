/**
 * src/lib/mockData.ts
 * Frontend mock data layer — mirrors the backend mock_data.py.
 * Used by pages when the API is unavailable / for Storybook / for tests.
 */

import type {
  AnalyticsOverview,
  Campaign,
  ChatMessage,
  Competitor,
  ForecastPoint,
  Influencer,
  InfluencerNetwork,
  InfluencerProfile,
  InfluencerRecommendation,
  Notification,
  Report,
  SentimentData,
  TrendPrediction,
  ViralityPrediction,
} from '@/types';

// ── Analytics ─────────────────────────────────────────────────────────────────
export const mockAnalyticsOverview: AnalyticsOverview = {
  total_followers: 124_500,
  total_reach: 892_000,
  avg_engagement_rate: 4.2,
  total_posts: 347,
  follower_growth: 12.5,
  follower_growth_prev: 9.1,
  reach_growth: 18.3,
  engagement_growth: 2.1,
  period: '30d',
  platforms: {
    instagram: { followers: 45_200, engagement: 5.1, reach: 324_000, posts: 98,  growth: 14.2 },
    twitter:   { followers: 28_300, engagement: 3.8, reach: 218_000, posts: 143, growth: 8.7  },
    linkedin:  { followers: 31_500, engagement: 4.4, reach: 201_000, posts: 62,  growth: 16.1 },
    facebook:  { followers: 19_500, engagement: 3.6, reach: 149_000, posts: 44,  growth: 5.3  },
  },
  followers_timeline: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86_400_000).toISOString().slice(0, 10),
    instagram: 42_000 + i * 100,
    twitter:   26_000 + i * 55,
    linkedin:  29_000 + i * 85,
    facebook:  19_000 + i * 20,
  })),
  engagement_timeline: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86_400_000).toISOString().slice(0, 10),
    instagram: parseFloat((5.1 + Math.sin(i * 0.4) * 0.6).toFixed(2)),
    twitter:   parseFloat((3.8 + Math.sin(i * 0.4) * 0.4).toFixed(2)),
    linkedin:  parseFloat((4.4 + Math.sin(i * 0.3) * 0.5).toFixed(2)),
    facebook:  parseFloat((3.6 + Math.sin(i * 0.5) * 0.3).toFixed(2)),
  })),
};

export const mockSentiment: SentimentData = {
  overall_score: 84,
  label: 'positive',
  breakdown: { positive: 68, neutral: 22, negative: 10 },
  emotions: { joy: 0.62, trust: 0.48, anticipation: 0.38, sadness: 0.12, anger: 0.08 },
  top_keywords: ['innovation', 'growth', 'community', 'launch', 'AI'],
  trend: 'up',
  score_change: 3.2,
  platform_sentiment: {
    instagram: { score: 88, label: 'positive' },
    twitter:   { score: 76, label: 'positive' },
    linkedin:  { score: 91, label: 'positive' },
    facebook:  { score: 79, label: 'positive' },
  },
};

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Summer Product Launch',
    status: 'active',
    objective: 'brand_awareness',
    budget: 15_000,
    spent: 8_420,
    start_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    end_date:   new Date(Date.now() + 15 * 86400000).toISOString(),
    platforms: ['instagram', 'twitter'],
    target_audience: '18-35 tech enthusiasts',
    metrics: { ctr: 4.2, roas: 3.8, impressions: 245_000, clicks: 10_290, reach: 320_000, engagement_rate: 5.1, conversion_rate: 2.8 },
    ai_score: 87,
    ai_strategy: 'Focus on UGC and micro-influencer partnerships during peak hours.',
    content_schedule: 'Instagram stories, Twitter ads, and launch countdown posts across the next 2 weeks.',
    progress_percent: 56,
    tasks: [
      { id: 'task_1', title: 'Finalize campaign creative', completed: true, due_date: new Date(Date.now() - 9 * 86400000).toISOString() },
      { id: 'task_2', title: 'Approve influencer brief', completed: true, due_date: new Date(Date.now() - 6 * 86400000).toISOString() },
      { id: 'task_3', title: 'Launch paid ad sets', completed: false, due_date: new Date(Date.now() + 2 * 86400000).toISOString() },
      { id: 'task_4', title: 'Publish live event teaser', completed: false, due_date: new Date(Date.now() + 4 * 86400000).toISOString() },
    ],
    team: [
      { id: 'team_1', name: 'Amina Patel', role: 'Campaign Lead', avatar_url: null },
      { id: 'team_2', name: 'Jae Kim', role: 'Content Strategist', avatar_url: null },
      { id: 'team_3', name: 'Lena Torres', role: 'Media Buyer', avatar_url: null },
    ],
    attachments: [
      { id: 'attach_1', name: 'Launch Brief.pdf', type: 'PDF', size: '1.2 MB', url: '#' },
      { id: 'attach_2', name: 'Influencer Deck.pptx', type: 'PPTX', size: '4.8 MB', url: '#' },
    ],
    notes: 'Focus on mid-funnel engagement and drive signups through gated webinar content.',
    activity: [
      { id: 'act_1', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), actor: 'Amina Patel', action: 'Updated budget', details: 'Increased ad budget to support additional Instagram placements.' },
      { id: 'act_2', timestamp: new Date(Date.now() - 28 * 3600000).toISOString(), actor: 'Jae Kim', action: 'Approved copy', details: 'Finalized headline variations for the homepage carousel.' },
      { id: 'act_3', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), actor: 'Lena Torres', action: 'Scheduled ads', details: 'Set paid social schedule for launch week.' },
    ],
    calendar_events: [
      { id: 'cal_1', title: 'Social teaser live', date: new Date(Date.now() - 12 * 86400000).toISOString(), platform: 'instagram', status: 'published' },
      { id: 'cal_2', title: 'Influencer post', date: new Date(Date.now() - 8 * 86400000).toISOString(), platform: 'twitter', status: 'published' },
      { id: 'cal_3', title: 'Paid ads go live', date: new Date(Date.now() + 1 * 86400000).toISOString(), platform: 'instagram', status: 'planned' },
      { id: 'cal_4', title: 'Customer webinar', date: new Date(Date.now() + 8 * 86400000).toISOString(), platform: 'twitter', status: 'planned' },
    ],
    timeline: [
      { date: new Date(Date.now() - 12 * 86400000).toISOString(), activity: 'Launched teaser video', platform: 'instagram' },
      { date: new Date(Date.now() - 8 * 86400000).toISOString(), activity: 'Published influencer spotlight', platform: 'twitter' },
      { date: new Date(Date.now() - 3 * 86400000).toISOString(), activity: 'Activated paid carousel ads', platform: 'instagram' },
    ],
  },
  {
    id: 'camp_2',
    name: 'Q4 B2B LinkedIn Push',
    status: 'active',
    objective: 'lead_generation',
    budget: 8_000,
    spent: 2_100,
    start_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    end_date:   new Date(Date.now() + 23 * 86400000).toISOString(),
    platforms: ['linkedin'],
    target_audience: 'C-suite and VP-level professionals',
    metrics: { ctr: 2.9, roas: 5.2, impressions: 98_000, clicks: 2_842, reach: 110_000, engagement_rate: 4.4, conversion_rate: 3.1 },
    ai_score: 91,
    ai_strategy: 'Thought-leadership posts with gated content for lead capture.',
    content_schedule: 'Weekly LinkedIn articles, gated whitepapers, and sponsored in-mail.',
    progress_percent: 34,
    tasks: [
      { id: 'task_5', title: 'Write whitepaper', completed: true, due_date: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: 'task_6', title: 'Design lead magnet', completed: true, due_date: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 'task_7', title: 'Launch sponsored campaign', completed: false, due_date: new Date(Date.now() + 3 * 86400000).toISOString() },
    ],
    team: [
      { id: 'team_4', name: 'Maya Singh', role: 'Growth Strategist', avatar_url: null },
      { id: 'team_5', name: 'Noah Harris', role: 'Copy Lead', avatar_url: null },
    ],
    attachments: [
      { id: 'attach_3', name: 'LinkedIn Audience Model.xlsx', type: 'XLSX', size: '2.8 MB', url: '#' },
      { id: 'attach_4', name: 'Campaign Timeline.pdf', type: 'PDF', size: '1.0 MB', url: '#' },
    ],
    notes: 'Build relationships with enterprise buyers using executive content and gated case studies.',
    activity: [
      { id: 'act_4', timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), actor: 'Maya Singh', action: 'Updated target audience', details: 'Refined to C-suite based on CRM segmentation.' },
      { id: 'act_5', timestamp: new Date(Date.now() - 42 * 3600000).toISOString(), actor: 'Noah Harris', action: 'Published lead magnet', details: 'Uploaded new whitepaper to campaign landing page.' },
    ],
    calendar_events: [
      { id: 'cal_5', title: 'Sponsored InMail launch', date: new Date(Date.now() + 2 * 86400000).toISOString(), platform: 'linkedin', status: 'planned' },
      { id: 'cal_6', title: 'Executive article', date: new Date(Date.now() + 10 * 86400000).toISOString(), platform: 'linkedin', status: 'planned' },
    ],
    timeline: [
      { date: new Date(Date.now() - 5 * 86400000).toISOString(), activity: 'Posted leadership case study', platform: 'linkedin' },
      { date: new Date(Date.now() - 2 * 86400000).toISOString(), activity: 'Shared gated ebook', platform: 'linkedin' },
    ],
  },
  {
    id: 'camp_3',
    name: 'Brand Awareness Wave',
    status: 'completed',
    objective: 'brand_awareness',
    budget: 12_000,
    spent: 11_850,
    start_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    end_date:   new Date(Date.now() - 30 * 86400000).toISOString(),
    platforms: ['instagram', 'facebook', 'twitter'],
    target_audience: '25-45 urban professionals',
    metrics: { ctr: 3.6, roas: 4.1, impressions: 512_000, clicks: 18_432, reach: 520_000, engagement_rate: 4.8, conversion_rate: 3.4 },
    ai_score: 79,
    ai_strategy: 'Cross-platform story-telling with consistent visual identity.',
    content_schedule: 'Daily carousel posts, engaging polls, and boosted highlights across Instagram and Facebook.',
    progress_percent: 100,
    tasks: [
      { id: 'task_8', title: 'Finalize campaign deck', completed: true, due_date: new Date(Date.now() - 56 * 86400000).toISOString() },
      { id: 'task_9', title: 'Run awareness ads', completed: true, due_date: new Date(Date.now() - 38 * 86400000).toISOString() },
    ],
    team: [
      { id: 'team_6', name: 'Noelle Rivera', role: 'Creative Director', avatar_url: null },
      { id: 'team_7', name: 'Ethan Brooks', role: 'Paid Social Lead', avatar_url: null },
    ],
    attachments: [
      { id: 'attach_5', name: 'Report Summary.pdf', type: 'PDF', size: '1.8 MB', url: '#' },
      { id: 'attach_6', name: 'Creative Guidelines.sketch', type: 'SKETCH', size: '6.3 MB', url: '#' },
    ],
    notes: 'Campaign completed with strong reach; review learnings for next brand refresh.',
    activity: [
      { id: 'act_6', timestamp: new Date(Date.now() - 96 * 3600000).toISOString(), actor: 'Noelle Rivera', action: 'Published final deck', details: 'Shared results with executive stakeholders.' },
      { id: 'act_7', timestamp: new Date(Date.now() - 132 * 3600000).toISOString(), actor: 'Ethan Brooks', action: 'Archived campaign assets', details: 'Moved completed assets into shared library.' },
    ],
    calendar_events: [
      { id: 'cal_7', title: 'Campaign recap', date: new Date(Date.now() - 16 * 86400000).toISOString(), platform: 'facebook', status: 'published' },
    ],
    timeline: [
      { date: new Date(Date.now() - 52 * 86400000).toISOString(), activity: 'Published brand manifesto', platform: 'facebook' },
      { date: new Date(Date.now() - 40 * 86400000).toISOString(), activity: 'Launched story series', platform: 'instagram' },
      { date: new Date(Date.now() - 34 * 86400000).toISOString(), activity: 'Delivered final summary report', platform: 'twitter' },
    ],
  },
  {
    id: 'camp_4',
    name: 'Holiday Retargeting',
    status: 'scheduled',
    objective: 'conversion',
    budget: 20_000,
    spent: 0,
    start_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    end_date:   new Date(Date.now() + 75 * 86400000).toISOString(),
    platforms: ['instagram', 'facebook'],
    target_audience: 'Past website visitors, 25-50',
    metrics: { ctr: 0, roas: 0, impressions: 0, clicks: 0, reach: 0, engagement_rate: 0, conversion_rate: 0 },
    ai_score: 0,
    content_schedule: 'Start with dynamic retargeting ads and expand to carousel offers in December.',
    progress_percent: 0,
    tasks: [
      { id: 'task_10', title: 'Build remarketing audience', completed: false, due_date: new Date(Date.now() + 32 * 86400000).toISOString() },
      { id: 'task_11', title: 'Design holiday creative', completed: false, due_date: new Date(Date.now() + 38 * 86400000).toISOString() },
      { id: 'task_12', title: 'Plan live countdown', completed: false, due_date: new Date(Date.now() + 42 * 86400000).toISOString() },
    ],
    team: [
      { id: 'team_8', name: 'Sofia Chen', role: 'Campaign Planner', avatar_url: null },
      { id: 'team_9', name: 'David Kim', role: 'Creative Lead', avatar_url: null },
    ],
    attachments: [
      { id: 'attach_7', name: 'Retargeting Strategy.docx', type: 'DOCX', size: '880 KB', url: '#' },
    ],
    notes: 'Holiday campaign is scheduled and waiting on final creative assets before launch.',
    activity: [
      { id: 'act_8', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), actor: 'Sofia Chen', action: 'Created campaign brief', details: 'Built the timeline and scheduled review checkpoints.' },
    ],
    calendar_events: [
      { id: 'cal_8', title: 'Creative review', date: new Date(Date.now() + 30 * 86400000).toISOString(), platform: 'facebook', status: 'planned' },
      { id: 'cal_9', title: 'Launch countdown', date: new Date(Date.now() + 44 * 86400000).toISOString(), platform: 'instagram', status: 'planned' },
    ],
    timeline: [],
  },
  {
    id: 'camp_5',
    name: 'Rebrand Relaunch',
    status: 'cancelled',
    objective: 'engagement',
    budget: 30_000,
    spent: 4_200,
    start_date: new Date(Date.now() - 18 * 86400000).toISOString(),
    end_date:   new Date(Date.now() + 12 * 86400000).toISOString(),
    platforms: ['linkedin', 'facebook'],
    target_audience: 'Brand leads and partners',
    metrics: { ctr: 1.7, roas: 0.9, impressions: 78_000, clicks: 1_320, reach: 90_000, engagement_rate: 3.1, conversion_rate: 1.2 },
    ai_score: 44,
    ai_strategy: 'Paused due to brand guidelines review; revisit creative after stakeholder approval.',
    content_schedule: 'Paused. Waiting on legal signoff for new brand guidelines.',
    progress_percent: 18,
    tasks: [
      { id: 'task_13', title: 'Approve new visual system', completed: false, due_date: new Date(Date.now() + 8 * 86400000).toISOString() },
      { id: 'task_14', title: 'Lock messaging pillars', completed: true, due_date: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
    team: [
      { id: 'team_10', name: 'Priya Singh', role: 'Brand Manager', avatar_url: null },
      { id: 'team_11', name: 'Carlos Ruiz', role: 'Legal Reviewer', avatar_url: null },
    ],
    attachments: [
      { id: 'attach_8', name: 'Brand Guidelines.pdf', type: 'PDF', size: '2.3 MB', url: '#' },
    ],
    notes: 'Campaign was cancelled until the new brand voice is approved across all channels.',
    activity: [
      { id: 'act_9', timestamp: new Date(Date.now() - 20 * 3600000).toISOString(), actor: 'Priya Singh', action: 'Paused campaign', details: 'Put the campaign on hold pending blackline review.' },
    ],
    calendar_events: [
      { id: 'cal_10', title: 'Legal review', date: new Date(Date.now() - 3 * 86400000).toISOString(), platform: 'linkedin', status: 'review' },
    ],
    timeline: [
      { date: new Date(Date.now() - 18 * 86400000).toISOString(), activity: 'Started rebrand campaign', platform: 'facebook' },
    ],
  },
];

// ── Competitors ───────────────────────────────────────────────────────────────
export const mockCompetitors: Competitor[] = [
  { id: 'comp_1', name: 'TechVision Co',  handle: '@techvisionco',   platform: 'instagram', followers: 189_000, growth_rate: 8.4,  engagement: 3.9, sentiment: 76, posts_per_week: 14, top_hashtags: ['#TechVision', '#AI'] },
  { id: 'comp_2', name: 'DataSphere Inc', handle: '@datasphereinc',  platform: 'twitter',   followers: 142_000, growth_rate: 6.1,  engagement: 4.2, sentiment: 81, posts_per_week: 21, top_hashtags: ['#DataSphere', '#BigData'] },
  { id: 'comp_3', name: 'NexGen Digital', handle: '@nexgendigital',  platform: 'linkedin',  followers: 98_000,  growth_rate: 11.2, engagement: 5.1, sentiment: 88, posts_per_week: 7,  top_hashtags: ['#NexGen', '#Leadership'] },
  { id: 'comp_4', name: 'Pulse Media',    handle: '@pulsemedia',     platform: 'instagram', followers: 76_000,  growth_rate: 15.7, engagement: 6.8, sentiment: 92, posts_per_week: 18, top_hashtags: ['#PulseMedia', '#Viral'] },
];

// ── Influencers ───────────────────────────────────────────────────────────────
export const mockInfluencers: Influencer[] = [
  { id: 'inf_1', name: 'Sarah Chen',     handle: '@sarahchen_tech',    platform: 'instagram', followers: 245_000, engagement_rate: 6.8, niche: 'Tech & Innovation',  ai_collaboration_score: 94, audience_match: 87, authenticity: 96, avg_likes: 16_660, avg_comments: 892,  location: 'San Francisco, CA' },
  { id: 'inf_2', name: 'Marcus Williams',handle: '@mwilliams_digital', platform: 'twitter',   followers: 189_000, engagement_rate: 4.2, niche: 'Digital Marketing',  ai_collaboration_score: 88, audience_match: 82, authenticity: 91, avg_likes: 7_938,  avg_comments: 421,  location: 'New York, NY' },
  { id: 'inf_3', name: 'Priya Sharma',   handle: '@priya_startup',     platform: 'linkedin',  followers: 156_000, engagement_rate: 7.3, niche: 'Startups & VC',     ai_collaboration_score: 91, audience_match: 91, authenticity: 94, avg_likes: 11_388, avg_comments: 632,  location: 'Austin, TX' },
  { id: 'inf_4', name: 'Alex Rivera',    handle: '@alexrivera_ai',     platform: 'instagram', followers: 98_000,  engagement_rate: 9.1, niche: 'AI & Data Science', ai_collaboration_score: 89, audience_match: 94, authenticity: 88, avg_likes: 8_918,  avg_comments: 534,  location: 'Seattle, WA' },
];

export const mockInfluencerProfiles: InfluencerProfile[] = [
  {
    id: 'inf_1',
    name: 'Sarah Chen',
    handle: '@sarahchen_tech',
    platform: 'instagram',
    followers: 245_000,
    engagement_rate: 6.8,
    niche: 'Tech & Innovation',
    ai_collaboration_score: 94,
    audience_match: 87,
    authenticity: 96,
    avg_likes: 16_660,
    avg_comments: 892,
    avg_views: 132_000,
    bio: 'Leading AI storyteller with a strong product launch audience and high voice authenticity.',
    location: 'San Francisco, CA',
    collaboration_status: 'active',
    social_accounts: [
      { platform: 'instagram', handle: '@sarahchen_tech', url: 'https://www.instagram.com/sarahchen_tech' },
      { platform: 'linkedin', handle: '@sarahchen', url: 'https://www.linkedin.com/in/sarahchen' },
    ],
    audience_demographics: [
      { label: 'Tech professionals', share: 38 },
      { label: 'Startup founders', share: 24 },
      { label: 'AI enthusiasts', share: 20 },
      { label: 'Content creators', share: 18 },
    ],
    collaboration_history: [
      { id: 'hist_1', title: 'AI Product Showcase', date: 'Jun 2024', description: 'Supported launch with a 3-part story campaign across Instagram and LinkedIn.', status: 'completed' },
      { id: 'hist_2', title: 'Brand Toolkit Review', date: 'Apr 2024', description: 'Co-created brand messaging for an enterprise AI product release.', status: 'completed' },
    ],
    campaigns: [
      { id: 'camp_1', name: 'Summer Product Launch', status: 'active' },
    ],
    notes: 'Works best with explainers, demos and product launch content. Keep calls to action concise.',
    contact: { email: 'sarah@influencer.com', phone: '+1 415 555 0145', manager: 'Eli Wong' },
    platform_distribution: [
      { platform: 'instagram', value: 70 },
      { platform: 'linkedin', value: 30 },
    ],
    followers_growth: [
      { date: 'W1', value: 232_000 },
      { date: 'W2', value: 238_000 },
      { date: 'W3', value: 245_000 },
      { date: 'W4', value: 251_000 },
    ],
    engagement_trend: [
      { date: 'W1', value: 6.0 },
      { date: 'W2', value: 6.3 },
      { date: 'W3', value: 6.7 },
      { date: 'W4', value: 6.8 },
    ],
    reach_series: [
      { date: 'W1', value: 118_000 },
      { date: 'W2', value: 124_000 },
      { date: 'W3', value: 128_000 },
      { date: 'W4', value: 132_000 },
    ],
  },
  {
    id: 'inf_2',
    name: 'Marcus Williams',
    handle: '@mwilliams_digital',
    platform: 'twitter',
    followers: 189_000,
    engagement_rate: 4.2,
    niche: 'Digital Marketing',
    ai_collaboration_score: 88,
    audience_match: 82,
    authenticity: 91,
    avg_likes: 7_938,
    avg_comments: 421,
    avg_views: 84_000,
    bio: 'High-volume marketing analyst with strong trending content and viral thread performance.',
    location: 'New York, NY',
    collaboration_status: 'negotiating',
    social_accounts: [
      { platform: 'twitter', handle: '@mwilliams_digital', url: 'https://www.twitter.com/mwilliams_digital' },
      { platform: 'linkedin', handle: '@marcuswilliams', url: 'https://www.linkedin.com/in/marcuswilliams' },
    ],
    audience_demographics: [
      { label: 'Marketers', share: 44 },
      { label: 'Founders', share: 26 },
      { label: 'Agency professionals', share: 18 },
      { label: 'Content strategists', share: 12 },
    ],
    collaboration_history: [
      { id: 'hist_3', title: 'Trend Insight Thread', date: 'May 2024', description: 'Delivered a high-performing analysis thread for the Q2 demand gen campaign.', status: 'completed' },
    ],
    campaigns: [
      { id: 'camp_2', name: 'Q4 B2B LinkedIn Push', status: 'active' },
    ],
    notes: 'Yield higher engagement when posting during North American business hours.',
    contact: { email: 'marcus@influencer.com', phone: '+1 212 555 0182', manager: 'Lina Park' },
    platform_distribution: [
      { platform: 'twitter', value: 60 },
      { platform: 'linkedin', value: 40 },
    ],
    followers_growth: [
      { date: 'W1', value: 178_000 },
      { date: 'W2', value: 183_000 },
      { date: 'W3', value: 186_000 },
      { date: 'W4', value: 189_000 },
    ],
    engagement_trend: [
      { date: 'W1', value: 3.9 },
      { date: 'W2', value: 4.1 },
      { date: 'W3', value: 4.0 },
      { date: 'W4', value: 4.2 },
    ],
    reach_series: [
      { date: 'W1', value: 72_000 },
      { date: 'W2', value: 78_000 },
      { date: 'W3', value: 81_000 },
      { date: 'W4', value: 84_000 },
    ],
  },
  {
    id: 'inf_3',
    name: 'Priya Sharma',
    handle: '@priya_startup',
    platform: 'linkedin',
    followers: 156_000,
    engagement_rate: 7.3,
    niche: 'Startups & VC',
    ai_collaboration_score: 91,
    audience_match: 91,
    authenticity: 94,
    avg_likes: 11_388,
    avg_comments: 632,
    avg_views: 98_000,
    bio: 'Startup mentor and investor storyteller with premium B2B reach and executive voice.',
    location: 'Austin, TX',
    collaboration_status: 'invited',
    social_accounts: [
      { platform: 'linkedin', handle: '@priya_startup', url: 'https://www.linkedin.com/in/priya_startup' },
      { platform: 'twitter', handle: '@priya_startup', url: 'https://www.twitter.com/priya_startup' },
    ],
    audience_demographics: [
      { label: 'Founders', share: 36 },
      { label: 'Investors', share: 28 },
      { label: 'Product leaders', share: 20 },
      { label: 'Startup teams', share: 16 },
    ],
    collaboration_history: [
      { id: 'hist_4', title: 'Executive Story Series', date: 'Mar 2024', description: 'Published weekly authority posts tied to product launch updates.', status: 'completed' },
    ],
    campaigns: [
      { id: 'camp_3', name: 'Brand Awareness Wave', status: 'completed' },
    ],
    notes: 'Excellent fit for thought leadership and executive-facing brand stories.',
    contact: { email: 'priya@influencer.com', phone: '+1 512 555 0136', manager: 'Asha Kapoor' },
    platform_distribution: [
      { platform: 'linkedin', value: 85 },
      { platform: 'twitter', value: 15 },
    ],
    followers_growth: [
      { date: 'W1', value: 145_000 },
      { date: 'W2', value: 149_000 },
      { date: 'W3', value: 152_000 },
      { date: 'W4', value: 156_000 },
    ],
    engagement_trend: [
      { date: 'W1', value: 6.9 },
      { date: 'W2', value: 7.1 },
      { date: 'W3', value: 7.2 },
      { date: 'W4', value: 7.3 },
    ],
    reach_series: [
      { date: 'W1', value: 84_000 },
      { date: 'W2', value: 90_000 },
      { date: 'W3', value: 94_000 },
      { date: 'W4', value: 98_000 },
    ],
  },
  {
    id: 'inf_4',
    name: 'Alex Rivera',
    handle: '@alexrivera_ai',
    platform: 'instagram',
    followers: 98_000,
    engagement_rate: 9.1,
    niche: 'AI & Data Science',
    ai_collaboration_score: 89,
    audience_match: 94,
    authenticity: 88,
    avg_likes: 8_918,
    avg_comments: 534,
    avg_views: 72_000,
    bio: 'AI educator and demo creator who drives strong audience interaction with concise tutorials.',
    location: 'Seattle, WA',
    collaboration_status: 'completed',
    social_accounts: [
      { platform: 'instagram', handle: '@alexrivera_ai', url: 'https://www.instagram.com/alexrivera_ai' },
      { platform: 'twitter', handle: '@alexrivera_ai', url: 'https://www.twitter.com/alexrivera_ai' },
    ],
    audience_demographics: [
      { label: 'AI enthusiasts', share: 48 },
      { label: 'Developers', share: 22 },
      { label: 'Product teams', share: 18 },
      { label: 'Students', share: 12 },
    ],
    collaboration_history: [
      { id: 'hist_5', title: 'Tutorial Launch', date: 'Feb 2024', description: 'Produced a tutorial campaign that drove significant demo signups.', status: 'completed' },
    ],
    campaigns: [
      { id: 'camp_4', name: 'Holiday Retargeting', status: 'scheduled' },
    ],
    notes: 'Top performer for tutorial-led content and technical explainers.',
    contact: { email: 'alex@influencer.com', phone: '+1 206 555 0199', manager: 'Morgan Lee' },
    platform_distribution: [
      { platform: 'instagram', value: 100 },
    ],
    followers_growth: [
      { date: 'W1', value: 90_000 },
      { date: 'W2', value: 93_000 },
      { date: 'W3', value: 96_000 },
      { date: 'W4', value: 98_000 },
    ],
    engagement_trend: [
      { date: 'W1', value: 8.6 },
      { date: 'W2', value: 8.8 },
      { date: 'W3', value: 9.0 },
      { date: 'W4', value: 9.1 },
    ],
    reach_series: [
      { date: 'W1', value: 64_000 },
      { date: 'W2', value: 68_000 },
      { date: 'W3', value: 70_000 },
      { date: 'W4', value: 72_000 },
    ],
  },
];

export const mockInfluencerRecommendations: InfluencerRecommendation[] = [
  {
    title: 'Use product demo reels',
    description: 'Showcase the product in short-form reels with clear CTA to improve reach and conversions.',
    priority: 'high',
    potential_impact: 'Improve video engagement by 22%',
  },
  {
    title: 'Leverage LinkedIn thought leadership',
    description: 'Publish long-form posts on platform updates and use cases to engage executive audiences.',
    priority: 'medium',
    potential_impact: 'Boost audience match for B2B campaigns',
  },
  {
    title: 'Align story cadence with campaign launch',
    description: 'Coordinate posting schedule around the product launch windows to maximize impressions.',
    priority: 'low',
    potential_impact: 'Increase campaign visibility by 15%',
  },
];

// ── Influencer network ────────────────────────────────────────────────────────
export const mockInfluencerNetwork: InfluencerNetwork = {
  nodes: [
    { id: 'you',  label: 'Your Brand',    size: 30, color: '#6172f3', type: 'brand' },
    { id: 'inf1', label: 'Sarah Chen',    size: 22, color: '#a855f7', type: 'influencer' },
    { id: 'inf2', label: 'Marcus Williams', size: 18, color: '#a855f7', type: 'influencer' },
    { id: 'inf3', label: 'Priya Sharma',  size: 20, color: '#a855f7', type: 'influencer' },
    { id: 'inf4', label: 'Alex Rivera',   size: 16, color: '#a855f7', type: 'influencer' },
    { id: 'aud1', label: 'Tech Community', size: 12, color: '#4ade80', type: 'audience' },
    { id: 'aud2', label: 'Startup Circle', size: 10, color: '#4ade80', type: 'audience' },
    { id: 'aud3', label: 'AI Enthusiasts', size: 14, color: '#4ade80', type: 'audience' },
  ],
  edges: [
    { source: 'you',  target: 'inf1', weight: 94, label: 'Collab Score' },
    { source: 'you',  target: 'inf2', weight: 88, label: 'Collab Score' },
    { source: 'you',  target: 'inf3', weight: 91, label: 'Collab Score' },
    { source: 'you',  target: 'inf4', weight: 89, label: 'Collab Score' },
    { source: 'inf1', target: 'aud1', weight: 87, label: 'Audience Match' },
    { source: 'inf1', target: 'aud3', weight: 82, label: 'Audience Match' },
    { source: 'inf2', target: 'aud1', weight: 79, label: 'Audience Match' },
    { source: 'inf3', target: 'aud2', weight: 91, label: 'Audience Match' },
    { source: 'inf4', target: 'aud3', weight: 94, label: 'Audience Match' },
  ],
  generated_at: new Date().toISOString(),
};

// ── Trends ────────────────────────────────────────────────────────────────────
export const mockTrendPredictions: TrendPrediction[] = [
  { hashtag: '#AIContent',       category: 'Technology',    current_volume: 12_400, predicted_volume: 18_900, confidence: 89, direction: 'up',     weeks: [12400,13800,14900,15800,17200,18900], peak_day: 'Tuesday',   related_hashtags: ['#GenerativeAI','#ContentAI'] },
  { hashtag: '#ShortFormVideo',  category: 'Content Format',current_volume: 45_200, predicted_volume: 61_000, confidence: 94, direction: 'up',     weeks: [45200,47800,51000,54200,57800,61000], peak_day: 'Friday',    related_hashtags: ['#Reels','#VideoContent'] },
  { hashtag: '#SustainableBrand',category: 'Brand Values',  current_volume: 8_900,  predicted_volume: 7_200,  confidence: 72, direction: 'down',   weeks: [8900,8600,8200,7900,7500,7200],       peak_day: 'Wednesday', related_hashtags: ['#GreenMarketing','#ESG'] },
  { hashtag: '#CommunityFirst',  category: 'Engagement',    current_volume: 15_600, predicted_volume: 19_400, confidence: 81, direction: 'up',     weeks: [15600,16400,17100,17800,18600,19400], peak_day: 'Thursday',  related_hashtags: ['#BuildInPublic','#Community'] },
  { hashtag: '#VoiceSearch',     category: 'Technology',    current_volume: 3_200,  predicted_volume: 3_150,  confidence: 68, direction: 'stable', weeks: [3200,3180,3210,3190,3170,3150],       peak_day: 'Monday',    related_hashtags: ['#SEO','#AudioContent'] },
];

export const mockForecast: ForecastPoint[] = [
  { week: 'W1', date: 'Jun 03', predicted: 4.2, actual: 4.2 },
  { week: 'W2', date: 'Jun 10', predicted: 4.6, actual: 4.5 },
  { week: 'W3', date: 'Jun 17', predicted: 4.3, actual: 4.1 },
  { week: 'W4', date: 'Jun 24', predicted: 4.9, actual: 4.8 },
  { week: 'W5', date: 'Jul 01', predicted: 5.2, actual: 5.1 },
  { week: 'W6', date: 'Jul 08', predicted: 5.6 },
  { week: 'W7', date: 'Jul 15', predicted: 5.9 },
  { week: 'W8', date: 'Jul 22', predicted: 6.2 },
];

export const mockViralityPredictions: ViralityPrediction[] = [
  { content_type: 'Product Launch Video',       platform: 'instagram', virality_score: 87, predicted_reach: 142_000, confidence: 82, key_factors: ['trending audio','product reveal','high production value'] },
  { content_type: 'Behind-the-Scenes Thread',   platform: 'twitter',   virality_score: 73, predicted_reach: 68_000,  confidence: 76, key_factors: ['authentic storytelling','peak posting time','thread format'] },
  { content_type: 'Industry Report',            platform: 'linkedin',  virality_score: 91, predicted_reach: 89_000,  confidence: 88, key_factors: ['data-driven','professional audience','shareable insights'] },
];

// ── Reports ───────────────────────────────────────────────────────────────────
export const mockReports: Report[] = [
  {
    id: 'rep_1',
    name: 'Analytics Summary — July 2024',
    report_type: 'analytics_summary',
    format: 'pdf',
    period: 'last_30_days',
    platforms: ['instagram', 'twitter', 'linkedin'],
    ai_summary:
      'This report highlights a strong 12.5% follower growth, improving engagement across Instagram and LinkedIn, and a 18.3% reach increase versus the prior period.',
    status: 'ready',
    download_url: '#',
    file_size_bytes: 248_000,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rep_2',
    name: 'Campaign Performance — Q2',
    report_type: 'campaign_performance',
    format: 'excel',
    period: 'last_90_days',
    platforms: ['facebook', 'twitter'],
    ai_summary:
      'Campaign spend remained efficient with a 3.8 ROAS, and Facebook paid reach delivered the most consistent conversions.',
    status: 'ready',
    download_url: '#',
    file_size_bytes: 84_000,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rep_3',
    name: 'Competitor Analysis — June',
    report_type: 'competitor_analysis',
    format: 'pdf',
    period: 'last_30_days',
    platforms: ['instagram', 'linkedin'],
    ai_summary:
      'Competitor benchmarks show a higher post cadence from rival accounts, while your audience sentiment remains stronger in key verticals.',
    status: 'ready',
    download_url: '#',
    file_size_bytes: 320_000,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'rep_4',
    name: 'Sentiment Report — Real-time',
    report_type: 'sentiment_report',
    format: 'csv',
    period: 'last_7_days',
    platforms: ['twitter'],
    status: 'generating',
    created_at: new Date().toISOString(),
  },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'notif_1', type: 'viral_prediction', title: 'Viral Alert: Your post is trending!',    body: 'Your Instagram post from 2 hours ago is gaining rapid traction. Engagement rate is 3.2x above average.', severity: 'success', read: false, action_url: '/analytics', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'notif_2', type: 'sentiment_shift',  title: 'Sentiment drop on X/Twitter',            body: 'Watson NLP detected a 12% drop in positive sentiment over the last 6 hours.',                                severity: 'warning', read: false, action_url: '/analytics', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'notif_3', type: 'campaign_alert',   title: "Campaign budget at 80%",                  body: "'Summer Product Launch' has used 80% of its budget with 15 days remaining.",                               severity: 'warning', read: false, action_url: '/campaigns', created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'notif_4', type: 'competitor',       title: 'Competitor activity spike',               body: 'TechVision Co posted 5 times in the last 2 hours.',                                                          severity: 'info',    read: true,  action_url: '/competitors',created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 'notif_5', type: 'milestone',        title: '🎉 100K followers milestone reached!',   body: 'Your combined follower count just crossed 100K. LinkedIn is your fastest-growing platform.',               severity: 'success', read: true,  action_url: '/dashboard', created_at: new Date(Date.now() - 86400000).toISOString() },
];

// ── Chat history ──────────────────────────────────────────────────────────────
export const mockChatMessages: ChatMessage[] = [
  { id: 'msg_1', role: 'user',      content: 'Write an Instagram caption for our new AI product launch.', platform: 'instagram', content_type: 'caption',         created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'msg_2', role: 'assistant', content: '✨ The future is here — and it\'s smarter than ever.\n\nIntroducing our latest AI-powered solution, designed to transform the way you work. Early access is now open. Tap the link in bio to be first. 🚀\n\n#AIInnovation #FutureOfWork #TechLaunch #Productivity', created_at: new Date(Date.now() - 290000).toISOString() },
  { id: 'msg_3', role: 'user',      content: 'Now write a Twitter thread about it.',             platform: 'twitter',   content_type: 'thread',          created_at: new Date(Date.now() - 180000).toISOString() },
  { id: 'msg_4', role: 'assistant', content: '🧵 1/ We just launched something that will change how teams use AI. Here\'s what you need to know:\n\n2/ The problem: Most AI tools are powerful but disconnected from your actual workflow.\n\n3/ Our solution: Seamless AI integration that learns from your data and adapts to your team. No PhD required. 🧠\n\n4/ Early results: Beta users report 40% faster content creation and 2.8x engagement rates.\n\n5/ Available now. Free trial for the first 500 sign-ups. Link below 👇', created_at: new Date(Date.now() - 170000).toISOString() },
];
