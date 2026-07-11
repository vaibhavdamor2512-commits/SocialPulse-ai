"""
app/services/ibm.py
────────────────────
Thin async wrappers for IBM Cloud AI services:
  - GraniteClient  : watsonx.ai text generation (IBM Granite 13B)
  - LangflowClient : IBM Langflow agent pipeline (chat)
  - WatsonNLPClient: IBM Watson Natural Language Understanding

All methods gracefully degrade to realistic mock responses when credentials
are not configured, so the app is fully runnable without IBM API keys.
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Helpers ────────────────────────────────────────────────────────────────────

def _ibm_configured() -> bool:
    """True when the IBM Cloud API key and watsonx project ID are set."""
    return bool(settings.IBM_CLOUD_API_KEY and settings.WATSONX_PROJECT_ID)

def _watson_configured() -> bool:
    return bool(settings.WATSON_NLP_API_KEY and settings.WATSON_NLP_URL)

def _langflow_configured() -> bool:
    return bool(settings.LANGFLOW_FLOW_ID and settings.LANGFLOW_BASE_URL)


async def _get_iam_token() -> str:
    """Exchange an IBM Cloud API key for a short-lived IAM bearer token."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://iam.cloud.ibm.com/identity/token",
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": settings.IBM_CLOUD_API_KEY,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


# ── IBM Granite (watsonx.ai) ───────────────────────────────────────────────────

class GraniteClient:
    """
    Async client for IBM Granite 13B Instruct v2 via watsonx.ai.
    Falls back to mock responses when WATSONX_PROJECT_ID is not set.
    """

    GENERATE_URL_TEMPLATE = "{base}/ml/v1/text/generation?version=2023-05-29"

    @classmethod
    async def generate(
        cls,
        prompt: str,
        system_prompt: str = "",
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """
        Generate text using IBM Granite 13B Instruct v2.
        Returns the generated text string.
        """
        if not _ibm_configured():
            logger.debug("IBM not configured — returning mock Granite response")
            return cls._mock_response(prompt)

        try:
            token = await _get_iam_token()
            url = cls.GENERATE_URL_TEMPLATE.format(base=settings.WATSONX_URL)

            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            payload: Dict[str, Any] = {
                "model_id": settings.WATSONX_MODEL_ID,
                "project_id": settings.WATSONX_PROJECT_ID,
                "input": full_prompt,
                "parameters": {
                    "decoding_method": "sample",
                    "max_new_tokens": max_tokens or settings.WATSONX_MAX_NEW_TOKENS,
                    "temperature": temperature or settings.WATSONX_TEMPERATURE,
                    "top_p": settings.WATSONX_TOP_P,
                    "stop_sequences": ["<|endoftext|>"],
                },
            }

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["results"][0]["generated_text"].strip()

        except Exception as exc:
            logger.warning("Granite API call failed (%s) — using mock fallback", exc)
            return cls._mock_response(prompt)

    @staticmethod
    def _mock_response(prompt: str) -> str:
        """Context-aware mock responses for demo / development."""
        p = prompt.lower()
        if any(k in p for k in ["instagram", "caption"]):
            return (
                "✨ Innovation meets purpose. Our latest breakthrough is redefining "
                "what's possible — and we're just getting started. "
                "Join us on this incredible journey. 🚀\n\n"
                "#Innovation #TechForGood #FutureReady #BrandStory"
            )
        if any(k in p for k in ["twitter", "tweet", "thread"]):
            return (
                "🧵 Thread: Why the next decade belongs to AI-first companies\n\n"
                "1/ The companies winning tomorrow are building with AI today.\n"
                "2/ Not as a feature — as the foundation.\n"
                "3/ Here's what we're seeing in the data… 👇"
            )
        if any(k in p for k in ["linkedin", "thought leadership"]):
            return (
                "In 2024, the most important leadership skill isn't strategy — "
                "it's the ability to learn faster than the market changes.\n\n"
                "Three things I've seen separate great leaders from good ones:\n"
                "1. They ask better questions\n"
                "2. They build diverse teams\n"
                "3. They act on data, not assumptions\n\n"
                "What would you add? 👇"
            )
        if any(k in p for k in ["swot", "competitor", "analysis"]):
            return (
                "**Strengths:** Strong brand recognition, engaged community, "
                "consistent content quality.\n"
                "**Weaknesses:** Limited platform diversity, slower response to trends.\n"
                "**Opportunities:** Short-form video growth, AI-driven personalisation.\n"
                "**Threats:** Increasing competition, algorithm volatility, "
                "rising ad costs."
            )
        if any(k in p for k in ["campaign", "strategy", "marketing"]):
            return (
                "**Campaign Strategy: Summer Launch 2024**\n\n"
                "**Phase 1 (Weeks 1-2):** Teaser content — behind-the-scenes, "
                "countdown posts across Instagram & X.\n"
                "**Phase 2 (Weeks 3-4):** Launch week — hero content, influencer "
                "partnerships, paid amplification.\n"
                "**Phase 3 (Weeks 5-6):** Sustain — UGC campaigns, retargeting, "
                "performance review.\n\n"
                "**KPIs:** 500K reach, 4.5% engagement rate, 12% CTR."
            )
        if any(k in p for k in ["hashtag", "trending"]):
            return (
                "Top hashtag recommendations:\n"
                "#TechTuesday #AIInnovation #DigitalTransformation "
                "#FutureOfWork #StartupLife #GrowthMindset #TechCommunity"
            )
        return (
            "Based on my analysis, here are my recommendations for your social "
            "media strategy:\n\n"
            "1. **Consistency**: Post at peak engagement times (Tue-Thu, 8-10am)\n"
            "2. **Authenticity**: Behind-the-scenes content drives 3x more engagement\n"
            "3. **Community**: Respond to comments within the first hour\n"
            "4. **Data**: A/B test your CTAs — small tweaks drive big results\n\n"
            "Would you like me to elaborate on any of these points?"
        )


# ── IBM Langflow (Agent pipeline) ──────────────────────────────────────────────

class LangflowClient:
    """
    Async client for the IBM Langflow agent pipeline.
    Proxies requests to the deployed Langflow instance.
    Falls back to GraniteClient.generate() when not configured.
    """

    @classmethod
    async def chat(
        cls,
        message: str,
        session_id: str,
        platform: str = "general",
        content_type: str = "general",
    ) -> Dict[str, Any]:
        """Send a message to the Langflow agent and return the response."""
        if not _langflow_configured():
            logger.debug("Langflow not configured — routing direct to Granite mock")
            system = (
                f"You are SocialPulse AI, an expert social media strategist. "
                f"Platform: {platform}. Content type: {content_type}."
            )
            text = await GraniteClient.generate(
                prompt=message, system_prompt=system
            )
            return {
                "response": text,
                "session_id": session_id,
                "model": settings.WATSONX_MODEL_ID,
                "tokens_used": len(text.split()) * 2,  # rough estimate
            }

        try:
            url = (
                f"{settings.LANGFLOW_BASE_URL}/api/v1/run/{settings.LANGFLOW_FLOW_ID}"
                "?stream=false"
            )
            headers: Dict[str, str] = {"Content-Type": "application/json"}
            if settings.LANGFLOW_API_KEY:
                headers["x-api-key"] = settings.LANGFLOW_API_KEY

            body = {
                "input_value": message,
                "input_type": "chat",
                "output_type": "chat",
                "session_id": session_id,
                "tweaks": {
                    "system_prompt": {
                        "platform": platform,
                        "content_type": content_type,
                    }
                },
            }

            async with httpx.AsyncClient(timeout=90) as client:
                resp = await client.post(url, json=body, headers=headers)
                resp.raise_for_status()
                data = resp.json()

            # Extract text from Langflow response envelope
            outputs = data.get("outputs", [{}])
            message_out = (
                outputs[0]
                .get("outputs", [{}])[0]
                .get("results", {})
                .get("message", {})
                .get("text", "")
            )
            return {
                "response": message_out or data.get("output", ""),
                "session_id": session_id,
                "model": settings.WATSONX_MODEL_ID,
                "tokens_used": data.get("tokens_used", 0),
            }

        except Exception as exc:
            logger.warning("Langflow call failed (%s) — direct Granite fallback", exc)
            text = await GraniteClient.generate(prompt=message)
            return {
                "response": text,
                "session_id": session_id,
                "model": settings.WATSONX_MODEL_ID,
                "tokens_used": len(text.split()) * 2,
            }


# ── IBM Watson NLP ─────────────────────────────────────────────────────────────

class WatsonNLPClient:
    """
    Async client for IBM Watson Natural Language Understanding.
    Falls back to realistic mock sentiment data when not configured.
    """

    @classmethod
    async def analyze(
        cls,
        text: str,
        features: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Analyse text with Watson NLP.
        Returns sentiment, emotions, keywords, and entities.
        """
        if not _watson_configured():
            return cls._mock_analysis(text)

        try:
            features_payload: Dict[str, Any] = {}
            selected = features or ["sentiment", "emotion", "keywords", "entities"]
            if "sentiment" in selected:
                features_payload["sentiment"] = {}
            if "emotion" in selected:
                features_payload["emotion"] = {}
            if "keywords" in selected:
                features_payload["keywords"] = {"limit": 10}
            if "entities" in selected:
                features_payload["entities"] = {"limit": 5}

            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(
                    f"{settings.WATSON_NLP_URL}/v1/analyze",
                    params={"version": settings.WATSON_NLP_VERSION},
                    auth=("apikey", settings.WATSON_NLP_API_KEY),
                    json={"text": text, "language": "en", "features": features_payload},
                )
                resp.raise_for_status()
                return resp.json()

        except Exception as exc:
            logger.warning("Watson NLP call failed (%s) — mock fallback", exc)
            return cls._mock_analysis(text)

    @staticmethod
    def _mock_analysis(text: str) -> Dict[str, Any]:
        """Return deterministic mock NLP data based on simple heuristics."""
        positive_words = {
            "great", "amazing", "love", "excellent", "fantastic", "awesome",
            "best", "incredible", "wonderful", "brilliant", "launch", "growth",
        }
        negative_words = {
            "bad", "terrible", "awful", "worst", "hate", "disappointed",
            "poor", "problem", "issue", "fail", "decline",
        }
        words = set(text.lower().split())
        pos_count = len(words & positive_words)
        neg_count = len(words & negative_words)

        if pos_count > neg_count:
            label, score = "positive", round(0.65 + min(pos_count * 0.05, 0.30), 2)
        elif neg_count > pos_count:
            label, score = "negative", round(0.55 + min(neg_count * 0.05, 0.35), 2)
        else:
            label, score = "neutral", 0.50

        return {
            "sentiment": {"document": {"label": label, "score": score}},
            "emotion": {
                "document": {
                    "emotion": {
                        "joy": round(0.45 + pos_count * 0.05, 2),
                        "trust": 0.42,
                        "anticipation": 0.38,
                        "sadness": round(0.12 + neg_count * 0.05, 2),
                        "anger": round(0.08 + neg_count * 0.03, 2),
                    }
                }
            },
            "keywords": [
                {"text": w, "relevance": round(0.95 - i * 0.08, 2), "count": 1}
                for i, w in enumerate(list(words)[:8])
                if len(w) > 4
            ],
            "entities": [],
            "_mock": True,
        }
