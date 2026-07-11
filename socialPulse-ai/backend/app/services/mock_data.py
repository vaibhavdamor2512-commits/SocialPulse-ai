"""
app/services/mock_data.py
──────────────────────────
Realistic, seeded mock data generators for all feature domains.
Used by routers when MongoDB collections are empty (development / demo).

All generators are deterministic — same seed → same data every run.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _days_ago(n: int) -> datetime:
    return _now() - timedelta(days=n)


# ── Analytics ─────────────────────────────────────────────────────────────────

PLATFORM_OVERVIEW: Dict[str, Any] = {
    "total_followers": 124_500,
    "total_reach": 892_000,
    "avg_engagement_rate": 4.2,
    "total_posts": 347,
    "follower_growth": 12.5,
    "follower_growth_prev": 9.1,
    "reach_growth": 18.3,
    "engagement_growth": 2.1,
    "platforms": {
        "instagram": {
            "followers": 45_200,
            "engagement": 5.1,
            "reach": 324_000,
            "posts": 98,
            "growth": 14.2,
        },
        "twitter": {
            "followers": 28_300,
            "engagement": 3.8,
            "reach": 218_000,
            "posts": 143,
            "growth": 8.7,
        },
        "linkedin": {
            "followers": 31_500,
            "engagement": 4.4,
            "reach": 201_000,
            "posts": 62,
            "growth": 16.1,
        },
        "facebook": {
            "followers": 19_500,
            "engagement": 3.6,
            "reach": 149_000,
            "posts": 44,
            "growth": 5.3,
        },
    },
}


def followers_timeline(days: int = 30) -> List[Dict[str, Any]]:
    base = {"instagram": 42000, "twitter": 26000, "linkedin": 29000, "facebook": 19000}
    deltas = {"instagram": 100, "twitter": 55, "linkedin": 85, "facebook": 20}
    result = []
    for i in range(days, -1, -1):
        d = _now() - timedelta(days=i)
        entry: Dict[str, Any] = {"date": d.strftime("%Y-%m-%d")}
        for p, b in base.items():
            entry[p] = b + deltas[p] * (days - i)
        result.append(entry)
    return result


def engagement_timeline(days: int = 30) -> List[Dict[str, Any]]:
    rates = {"instagram": 5.1, "twitter": 3.8, "linkedin": 4.4, "facebook": 3.6}
    result = []
    import math
    for i in range(days, -1, -1):
        d = _now() - timedelta(days=i)
        entry: Dict[str, Any] = {"date": d.strftime("%Y-%m-%d")}
        for p, r in rates.items():
            # sinusoidal variation to look realistic
            entry[p] = round(r + math.sin(i * 0.4) * 0.6, 2)
        result.append(entry)
    return result


SENTIMENT_DATA: Dict[str, Any] = {
    "overall_score": 84,
    "label": "positive",
    "breakdown": {"positive": 68, "neutral": 22, "negative": 10},
    "emotions": {
        "joy": 0.62, "trust": 0.48, "anticipation": 0.38,
        "sadness": 0.12, "anger": 0.08,
    },
    "top_keywords": ["innovation", "growth", "community", "launch", "AI"],
    "trend": "up",
    "score_change": 3.2,
    "platform_sentiment": {
        "instagram": {"score": 88, "label": "positive"},
        "twitter":   {"score": 76, "label": "positive"},
        "linkedin":  {"score": 91, "label": "positive"},
        "facebook":  {"score": 79, "label": "positive"},
    },
}


TRENDING_HASHTAGS: List[Dict[str, Any]] = [
    {"tag": "#TechTuesday",          "posts": 1240, "reach": 85_000, "trend": "up",   "pct_change": 24},
    {"tag": "#AI2024",               "posts": 980,  "reach": 72_000, "trend": "up",   "pct_change": 31},
    {"tag": "#DigitalMarketing",     "posts": 876,  "reach": 65_000, "trend": "up",   "pct_change": 12},
    {"tag": "#StartupLife",          "posts": 754,  "reach": 58_000, "trend": "stable","pct_change":  3},
    {"tag": "#GrowthHacking",        "posts": 642,  "reach": 49_000, "trend": "up",   "pct_change": 18},
    {"tag": "#ContentMarketing",     "posts": 589,  "reach": 44_000, "trend": "down", "pct_change": -8},
    {"tag": "#SocialMediaStrategy",  "posts": 521,  "reach": 39_000, "trend": "up",   "pct_change":  9},
    {"tag": "#IBMGranite",           "posts": 487,  "reach": 36_000, "trend": "up",   "pct_change": 47},
    {"tag": "#FutureOfWork",         "posts": 412,  "reach": 31_000, "trend": "stable","pct_change":  1},
    {"tag": "#BrandBuilding",        "posts": 378,  "reach": 28_000, "trend": "down", "pct_change": -5},
]


BEST_POSTING_TIMES: Dict[str, List[Dict[str, Any]]] = {
    "instagram": [
        {"day": "Tuesday",   "hour": 18, "score": 92, "label": "Best"},
        {"day": "Wednesday", "hour": 12, "score": 87, "label": "Great"},
        {"day": "Thursday",  "hour": 19, "score": 84, "label": "Good"},
    ],
    "twitter": [
        {"day": "Wednesday", "hour": 9,  "score": 88, "label": "Best"},
        {"day": "Friday",    "hour": 12, "score": 82, "label": "Great"},
        {"day": "Tuesday",   "hour": 15, "score": 79, "label": "Good"},
    ],
    "linkedin": [
        {"day": "Thursday",  "hour": 8,  "score": 91, "label": "Best"},
        {"day": "Tuesday",   "hour": 10, "score": 86, "label": "Great"},
        {"day": "Wednesday", "hour": 7,  "score": 83, "label": "Good"},
    ],
    "facebook": [
        {"day": "Sunday",    "hour": 13, "score": 85, "label": "Best"},
        {"day": "Saturday",  "hour": 11, "score": 81, "label": "Great"},
        {"day": "Friday",    "hour": 16, "score": 76, "label": "Good"},
    ],
}


# ── Campaigns ─────────────────────────────────────────────────────────────────

CAMPAIGNS: List[Dict[str, Any]] = [
    {
        "name": "Summer Product Launch",
        "status": "active",
        "budget": 15_000,
        "spent": 8_420,
        "start_date": _days_ago(15).isoformat(),
        "end_date": (_now() + timedelta(days=15)).isoformat(),
        "platforms": ["instagram", "twitter"],
        "objective": "brand_awareness",
        "target_audience": "18-35 tech enthusiasts",
        "metrics": {"ctr": 4.2, "roas": 3.8, "impressions": 245_000, "clicks": 10_290},
        "ai_score": 87,
        "ai_strategy": "Focus on UGC and micro-influencer partnerships during peak hours.",
    },
    {
        "name": "Q4 B2B LinkedIn Push",
        "status": "active",
        "budget": 8_000,
        "spent": 2_100,
        "start_date": _days_ago(7).isoformat(),
        "end_date": (_now() + timedelta(days=23)).isoformat(),
        "platforms": ["linkedin"],
        "objective": "lead_generation",
        "target_audience": "C-suite and VP-level professionals",
        "metrics": {"ctr": 2.9, "roas": 5.2, "impressions": 98_000, "clicks": 2_842},
        "ai_score": 91,
        "ai_strategy": "Thought-leadership posts with gated content for lead capture.",
    },
    {
        "name": "Brand Awareness Wave",
        "status": "completed",
        "budget": 12_000,
        "spent": 11_850,
        "start_date": _days_ago(60).isoformat(),
        "end_date": _days_ago(30).isoformat(),
        "platforms": ["instagram", "facebook", "twitter"],
        "objective": "brand_awareness",
        "target_audience": "25-45 urban professionals",
        "metrics": {"ctr": 3.6, "roas": 4.1, "impressions": 512_000, "clicks": 18_432},
        "ai_score": 79,
        "ai_strategy": "Cross-platform story-telling with consistent visual identity.",
    },
    {
        "name": "Holiday Retargeting",
        "status": "draft",
        "budget": 20_000,
        "spent": 0,
        "start_date": (_now() + timedelta(days=45)).isoformat(),
        "end_date": (_now() + timedelta(days=75)).isoformat(),
        "platforms": ["instagram", "facebook"],
        "objective": "conversion",
        "target_audience": "Past website visitors, 25-50",
        "metrics": {"ctr": 0, "roas": 0, "impressions": 0, "clicks": 0},
        "ai_score": 0,
        "ai_strategy": "",
    },
]


# ── Competitors ───────────────────────────────────────────────────────────────

COMPETITORS: List[Dict[str, Any]] = [
    {
        "name": "TechVision Co",
        "handle": "@techvisionco",
        "platform": "instagram",
        "followers": 189_000,
        "growth_rate": 8.4,
        "engagement": 3.9,
        "sentiment": 76,
        "posts_per_week": 14,
        "top_hashtags": ["#TechVision", "#Innovation", "#AI"],
        "avatar_url": None,
    },
    {
        "name": "DataSphere Inc",
        "handle": "@datasphereinc",
        "platform": "twitter",
        "followers": 142_000,
        "growth_rate": 6.1,
        "engagement": 4.2,
        "sentiment": 81,
        "posts_per_week": 21,
        "top_hashtags": ["#DataSphere", "#BigData", "#Analytics"],
        "avatar_url": None,
    },
    {
        "name": "NexGen Digital",
        "handle": "@nexgendigital",
        "platform": "linkedin",
        "followers": 98_000,
        "growth_rate": 11.2,
        "engagement": 5.1,
        "sentiment": 88,
        "posts_per_week": 7,
        "top_hashtags": ["#NexGen", "#DigitalFirst", "#Leadership"],
        "avatar_url": None,
    },
    {
        "name": "Pulse Media",
        "handle": "@pulsemedia",
        "platform": "instagram",
        "followers": 76_000,
        "growth_rate": 15.7,
        "engagement": 6.8,
        "sentiment": 92,
        "posts_per_week": 18,
        "top_hashtags": ["#PulseMedia", "#ContentKing", "#Viral"],
        "avatar_url": None,
    },
]


AI_RECOMMENDATIONS: List[Dict[str, Any]] = [
    {
        "title": "Increase short-form video content",
        "description": "Competitors using Reels/TikTok-style content see 3.2x higher engagement. "
                       "Recommend allocating 40% of content budget to short-form video.",
        "priority": "high",
        "potential_impact": "+28% engagement",
    },
    {
        "title": "Expand LinkedIn thought leadership",
        "description": "NexGen Digital's 5.1% LinkedIn engagement outperforms your 4.4%. "
                       "Publishing 2 more weekly articles could close this gap.",
        "priority": "medium",
        "potential_impact": "+0.7% engagement rate",
    },
    {
        "title": "Diversify hashtag strategy",
        "description": "Your top competitors use 3x more niche hashtags per post. "
                       "Targeting hashtags with 10K-100K posts increases discovery.",
        "priority": "medium",
        "potential_impact": "+15% organic reach",
    },
    {
        "title": "Optimise posting frequency on X/Twitter",
        "description": "DataSphere posts 21x/week vs your 14x/week. "
                       "Increasing cadence to 18+ posts could improve visibility by 22%.",
        "priority": "low",
        "potential_impact": "+22% Twitter impressions",
    },
]


# ── Influencers ───────────────────────────────────────────────────────────────

INFLUENCERS: List[Dict[str, Any]] = [
    {
        "name": "Sarah Chen",
        "handle": "@sarahchen_tech",
        "platform": "instagram",
        "followers": 245_000,
        "engagement_rate": 6.8,
        "niche": "Tech & Innovation",
        "ai_collaboration_score": 94,
        "avg_likes": 16_660,
        "avg_comments": 892,
        "audience_match": 87,
        "authenticity": 96,
        "past_brand_deals": 12,
        "location": "San Francisco, CA",
        "avatar_url": None,
    },
    {
        "name": "Marcus Williams",
        "handle": "@mwilliams_digital",
        "platform": "twitter",
        "followers": 189_000,
        "engagement_rate": 4.2,
        "niche": "Digital Marketing",
        "ai_collaboration_score": 88,
        "avg_likes": 7_938,
        "avg_comments": 421,
        "audience_match": 82,
        "authenticity": 91,
        "past_brand_deals": 8,
        "location": "New York, NY",
        "avatar_url": None,
    },
    {
        "name": "Priya Sharma",
        "handle": "@priya_startup",
        "platform": "linkedin",
        "followers": 156_000,
        "engagement_rate": 7.3,
        "niche": "Startups & VC",
        "ai_collaboration_score": 91,
        "avg_likes": 11_388,
        "avg_comments": 632,
        "audience_match": 91,
        "authenticity": 94,
        "past_brand_deals": 15,
        "location": "Austin, TX",
        "avatar_url": None,
    },
    {
        "name": "Alex Rivera",
        "handle": "@alexrivera_ai",
        "platform": "instagram",
        "followers": 98_000,
        "engagement_rate": 9.1,
        "niche": "AI & Data Science",
        "ai_collaboration_score": 89,
        "avg_likes": 8_918,
        "avg_comments": 534,
        "audience_match": 94,
        "authenticity": 88,
        "past_brand_deals": 6,
        "location": "Seattle, WA",
        "avatar_url": None,
    },
]


INFLUENCER_NETWORK: Dict[str, Any] = {
    "nodes": [
        {"id": "you",    "label": "Your Brand", "size": 30, "color": "#6172f3", "type": "brand"},
        {"id": "inf1",   "label": "Sarah Chen",    "size": 22, "color": "#a855f7", "type": "influencer"},
        {"id": "inf2",   "label": "Marcus Williams","size": 18, "color": "#a855f7", "type": "influencer"},
        {"id": "inf3",   "label": "Priya Sharma",   "size": 20, "color": "#a855f7", "type": "influencer"},
        {"id": "inf4",   "label": "Alex Rivera",    "size": 16, "color": "#a855f7", "type": "influencer"},
        {"id": "aud1",   "label": "Tech Community", "size": 12, "color": "#22c55e", "type": "audience"},
        {"id": "aud2",   "label": "Startup Circle", "size": 10, "color": "#22c55e", "type": "audience"},
        {"id": "aud3",   "label": "AI Enthusiasts", "size": 14, "color": "#22c55e", "type": "audience"},
    ],
    "edges": [
        {"source": "you",  "target": "inf1", "weight": 94, "label": "Collab Score"},
        {"source": "you",  "target": "inf2", "weight": 88, "label": "Collab Score"},
        {"source": "you",  "target": "inf3", "weight": 91, "label": "Collab Score"},
        {"source": "you",  "target": "inf4", "weight": 89, "label": "Collab Score"},
        {"source": "inf1", "target": "aud1", "weight": 87, "label": "Audience Match"},
        {"source": "inf1", "target": "aud3", "weight": 82, "label": "Audience Match"},
        {"source": "inf2", "target": "aud1", "weight": 79, "label": "Audience Match"},
        {"source": "inf3", "target": "aud2", "weight": 91, "label": "Audience Match"},
        {"source": "inf4", "target": "aud3", "weight": 94, "label": "Audience Match"},
    ],
}


# ── Trends ────────────────────────────────────────────────────────────────────

TREND_PREDICTIONS: List[Dict[str, Any]] = [
    {
        "hashtag": "#AIContent",
        "category": "Technology",
        "current_volume": 12_400,
        "predicted_volume": 18_900,
        "confidence": 89,
        "direction": "up",
        "weeks": [12400, 13800, 14900, 15800, 17200, 18900],
        "peak_day": "Tuesday",
        "related_hashtags": ["#GenerativeAI", "#ContentAI", "#AIMarketing"],
    },
    {
        "hashtag": "#ShortFormVideo",
        "category": "Content Format",
        "current_volume": 45_200,
        "predicted_volume": 61_000,
        "confidence": 94,
        "direction": "up",
        "weeks": [45200, 47800, 51000, 54200, 57800, 61000],
        "peak_day": "Friday",
        "related_hashtags": ["#Reels", "#TikTokMarketing", "#VideoContent"],
    },
    {
        "hashtag": "#SustainableBrand",
        "category": "Brand Values",
        "current_volume": 8_900,
        "predicted_volume": 7_200,
        "confidence": 72,
        "direction": "down",
        "weeks": [8900, 8600, 8200, 7900, 7500, 7200],
        "peak_day": "Wednesday",
        "related_hashtags": ["#GreenMarketing", "#ESG", "#Sustainability"],
    },
    {
        "hashtag": "#CommunityFirst",
        "category": "Engagement",
        "current_volume": 15_600,
        "predicted_volume": 19_400,
        "confidence": 81,
        "direction": "up",
        "weeks": [15600, 16400, 17100, 17800, 18600, 19400],
        "peak_day": "Thursday",
        "related_hashtags": ["#BuildInPublic", "#Community", "#CreatorEconomy"],
    },
    {
        "hashtag": "#VoiceSearch",
        "category": "Technology",
        "current_volume": 3_200,
        "predicted_volume": 3_150,
        "confidence": 68,
        "direction": "stable",
        "weeks": [3200, 3180, 3210, 3190, 3170, 3150],
        "peak_day": "Monday",
        "related_hashtags": ["#SEO", "#VoiceMarketing", "#AudioContent"],
    },
]


def engagement_forecast(weeks: int = 6) -> List[Dict[str, Any]]:
    actual_base = [4.2, 4.5, 4.1, 4.8, 5.1, None, None, None]
    predicted_base = [4.2, 4.6, 4.3, 4.9, 5.2, 5.6, 5.9, 6.2]
    result = []
    for i in range(weeks + 2):
        d = _now() + timedelta(weeks=i - 2)
        entry: Dict[str, Any] = {
            "week": f"W{i+1}",
            "date": d.strftime("%b %d"),
            "predicted": round(predicted_base[min(i, len(predicted_base) - 1)], 1),
        }
        actual = actual_base[min(i, len(actual_base) - 1)]
        if actual is not None:
            entry["actual"] = round(actual, 1)
        result.append(entry)
    return result


def virality_predictions() -> List[Dict[str, Any]]:
    return [
        {
            "content_type": "Product Launch Video",
            "platform": "instagram",
            "virality_score": 87,
            "predicted_reach": 142_000,
            "confidence": 82,
            "key_factors": ["trending audio", "product reveal", "high production value"],
        },
        {
            "content_type": "Behind-the-Scenes Thread",
            "platform": "twitter",
            "virality_score": 73,
            "predicted_reach": 68_000,
            "confidence": 76,
            "key_factors": ["authentic storytelling", "peak posting time", "thread format"],
        },
        {
            "content_type": "Industry Report",
            "platform": "linkedin",
            "virality_score": 91,
            "predicted_reach": 89_000,
            "confidence": 88,
            "key_factors": ["data-driven", "professional audience", "shareable insights"],
        },
    ]


# ── Notifications ─────────────────────────────────────────────────────────────

def default_notifications() -> List[Dict[str, Any]]:
    return [
        {
            "type": "viral_prediction",
            "title": "Viral Alert: Your post is trending!",
            "body": "Your Instagram post from 2 hours ago is gaining rapid traction. "
                    "Engagement rate is 3.2x above average.",
            "severity": "success",
            "read": False,
            "action_url": "/analytics",
            "created_at": (_now() - timedelta(hours=2)).isoformat(),
        },
        {
            "type": "sentiment_shift",
            "title": "Sentiment drop on X/Twitter",
            "body": "Watson NLP detected a 12% drop in positive sentiment over the last 6 hours. "
                    "Review recent @mentions for context.",
            "severity": "warning",
            "read": False,
            "action_url": "/analytics",
            "created_at": (_now() - timedelta(hours=5)).isoformat(),
        },
        {
            "type": "campaign_alert",
            "title": "Campaign budget at 80%",
            "body": "'Summer Product Launch' has used 80% of its budget with 15 days remaining.",
            "severity": "warning",
            "read": False,
            "action_url": "/campaigns",
            "created_at": (_now() - timedelta(hours=8)).isoformat(),
        },
        {
            "type": "competitor_update",
            "title": "Competitor activity spike",
            "body": "TechVision Co posted 5 times in the last 2 hours — unusually high activity. "
                    "Possible product launch or campaign.",
            "severity": "info",
            "read": True,
            "action_url": "/competitors",
            "created_at": (_now() - timedelta(hours=12)).isoformat(),
        },
        {
            "type": "milestone",
            "title": "🎉 100K followers milestone reached!",
            "body": "Your combined follower count just crossed 100K. "
                    "LinkedIn is your fastest-growing platform at +16% this month.",
            "severity": "success",
            "read": True,
            "action_url": "/dashboard",
            "created_at": (_now() - timedelta(days=1)).isoformat(),
        },
        {
            "type": "best_time",
            "title": "Optimal posting window in 30 minutes",
            "body": "IBM Granite predicts your Tuesday 6:00 PM window is approaching. "
                    "Your Instagram engagement peaks at this time.",
            "severity": "info",
            "read": False,
            "action_url": "/assistant",
            "created_at": (_now() - timedelta(minutes=28)).isoformat(),
        },
    ]
