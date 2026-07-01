import json
import google.generativeai as genai
from core.config import settings
from services.llm_audit_mock import analyze_audit_collection_mock

# "-latest" alias so Google's periodic model deprecations (e.g. gemini-2.0-flash
# was pulled from serving despite still appearing in list_models()) don't
# silently break analysis - this always resolves to a currently served model.
_MODEL_NAME = "gemini-flash-latest"

# The platform's AI reviewer identity. It has a real user account (see
# scripts/create_synapse_ai.py) so its approvals are attributable like any
# other moderator. This display name is what gets stamped on sources it acts on.
SYNAPSE_AI_USERNAME = "synapse_ai"
APPROVER_DISPLAY_NAME = "Synapse AI"


class LlmAuditError(Exception):
    """Raised when the audit LLM call can't be completed or parsed."""


def _require_api_key():
    if not settings.GEMINI_API_KEY:
        raise LlmAuditError(
            "GEMINI_API_KEY is not set. Add it to the backend's environment "
            "(see .env.example) to enable AI-driven source review."
        )


def analyze_audit_collection(collected_data: dict) -> dict:
    """
    Sends a blog's collected comments/contexts/sources to an LLM and asks it
    to assess overall soundness/verifiability and recommend which pending
    sources look legitimate enough to auto-approve.

    If USE_MOCK_LLM is True (default in dev), returns mock data.
    Otherwise sends to Gemini.

    Returns a dict shaped like:
    {
      "logical_soundness": 0.0-1.0,
      "verifiable": "yes" | "no" | "partial",
      "summary": str,
      "approved_source_ids": [int, ...],
      "rejected_source_ids": [int, ...],
    }
    """
    # Use mock LLM in development
    if settings.USE_MOCK_LLM:
        return analyze_audit_collection_mock(collected_data)

    # Use real Gemini in production
    _require_api_key()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(_MODEL_NAME)

    prompt = _POST_AUDIT_PROMPT + f"\n\nDATA:\n{json.dumps(collected_data)}"

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )
    except Exception as e:
        raise LlmAuditError(f"Gemini API call failed: {e}") from e

    try:
        raw = json.loads(response.text)
    except (ValueError, AttributeError) as e:
        raise LlmAuditError(f"Gemini returned a non-JSON response: {e}") from e

    return _flatten_audit_response(raw)


# System prompt for the post/discussion audit. The model returns a rich,
# decomposed object; _flatten_audit_response collapses it into the flat shape
# the rest of the app (crud + router) already consumes.
_POST_AUDIT_PROMPT = (
    "You are a fact-checking and epistemics analyst auditing a discussion post "
    "(and any community-submitted sources) on a platform used by academic "
    "researchers. Your readers are educated and will reject unjustified "
    "confidence. Rigor and calibration matter more than a verdict.\n\n"
    "METHOD - work through these before scoring:\n"
    "1. Restate the post's central claim in one sentence. Classify it: "
    "empirical (falsifiable) | normative | definitional | speculative.\n"
    "2. Steelman it: state the strongest charitable version before any critique.\n"
    "3. Map the argument: premises, the inference, and hidden assumptions. For "
    "each premise assign an evidence tier: systematic-review > RCT > "
    "observational > expert-assertion > anecdote > bare-claim.\n"
    "4. Identify logical fallacies or cognitive biases. For each, QUOTE the "
    "exact span of text that triggers it. Do not report a fallacy you cannot quote.\n"
    "5. Evaluate each provided source for authority, provenance, recency, and "
    "RELEVANCE TO THE SPECIFIC CLAIM (a source on the general topic that does "
    "not bear on the exact claim is not support).\n"
    "6. State the verification pathway: the specific evidence, dataset, or "
    "experiment that would confirm or falsify the claim.\n"
    "7. Cross-reference against your own knowledge for authoritative context.\n\n"
    "SCORING - score each 0-100 with a one-line rationale, then set "
    "logical_soundness (0-1) as a justified aggregate (bands: 0-20 very low, "
    "21-40 low, 41-60 mixed, 61-80 solid, 81-100 strong):\n"
    "clarity_falsifiability | premise_support | inferential_validity | "
    "source_reliability | fallacy_bias_freedom\n\n"
    "GUARDRAILS (hard rules):\n"
    "- Recommended sources must have a REAL, RESOLVABLE, readable URL - prefer a "
    "DOI (https://doi.org/...) or an official publisher/landing page you are "
    "confident exists. Do NOT invent DOIs or deep links that may not resolve; if "
    "unsure of an exact article URL, link the publisher's real search or section "
    "page instead. Format each reference in APA 7th edition.\n"
    "- No false precision: every number must be tied to a rubric band + rationale.\n"
    "- The summary must be entailed by the sub-scores; do not contradict them.\n"
    "- Popularity, reactions, and author identity are NOT evidence. Ignore them.\n"
    "- Judge the argument, not the person. No moralizing.\n"
    "- Where your knowledge is uncertain or past your cutoff, say so explicitly.\n\n"
    "Return ONLY this JSON (no prose, no markdown fences):\n"
    "{\n"
    '  "logical_soundness": <float 0-1>,\n'
    '  "verifiable": "yes" | "no" | "partial",\n'
    '  "sub_scores": {\n'
    '    "clarity_falsifiability": {"score": <int>, "rationale": "<one line>"},\n'
    '    "premise_support":        {"score": <int>, "rationale": "<one line>"},\n'
    '    "inferential_validity":   {"score": <int>, "rationale": "<one line>"},\n'
    '    "source_reliability":     {"score": <int>, "rationale": "<one line>"},\n'
    '    "fallacy_bias_freedom":   {"score": <int>, "rationale": "<one line>"}\n'
    "  },\n"
    '  "detected_fallacies": [\n'
    '    {"name": "<fallacy>", "quote": "<exact trigger text>", "explanation": "<why>"}\n'
    "  ],\n"
    '  "steelman": "<strongest charitable version of the claim>",\n'
    '  "summary": "<3-5 sentence audit: claim type, key weaknesses/strengths, why the score>",\n'
    '  "context_guardrail": "<the established ground truth on this topic and where '
    "THIS discussion is at risk of drifting from it - the epistemic frame, "
    'distinct from the summary>",\n'
    '  "verification_pathway": "<specific evidence/data/experiment that would confirm or falsify>",\n'
    '  "source_evaluation": {\n'
    '    "approved_source_ids": [<real, on-topic, claim-relevant source ids>],\n'
    '    "rejected_source_ids": [<broken, off-claim, or low-authority ids>]\n'
    "  },\n"
    '  "recommended_new_sources": [\n'
    "    {\n"
    '      "apa_reference": "<full APA 7th-edition reference for the source, e.g. Author, A. A. (Year). Title. Publisher/Journal. https://doi.org/...>",\n'
    '      "publisher_or_organization": "<e.g. Nature, Cochrane, Reuters, a gov database>",\n'
    '      "url": "<a real, resolvable, readable URL - a DOI or official landing/search page you are confident exists>",\n'
    '      "reason_for_inclusion": "<what specific gap this fills>"\n'
    "    }\n"
    "  ]\n"
    "}"
)


def _flatten_audit_response(raw: dict) -> dict:
    """Collapse the rich audit object the model returns into the flat shape the
    crud/router layer consumes, while preserving the decomposed detail under
    'analysis_detail' and 'ai_context_guardrail' for the UI."""
    source_eval = raw.get("source_evaluation") or {}
    return {
        "logical_soundness": raw.get("logical_soundness", 0.5),
        "verifiable": raw.get("verifiable", "partial"),
        "summary": raw.get("summary", ""),
        "ai_context_guardrail": raw.get("context_guardrail", ""),
        "analysis_detail": {
            "sub_scores": raw.get("sub_scores", {}),
            "detected_fallacies": raw.get("detected_fallacies", []),
            "steelman": raw.get("steelman", ""),
            "verification_pathway": raw.get("verification_pathway", ""),
        },
        "recommended_new_sources": raw.get("recommended_new_sources", []),
        "approved_source_ids": source_eval.get("approved_source_ids", []),
        "rejected_source_ids": source_eval.get("rejected_source_ids", []),
    }
