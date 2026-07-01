import json
import google.generativeai as genai
from core.config import settings

_MODEL_NAME = "gemini-2.0-flash"


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
    Sends a blog's collected comments/contexts/sources to Gemini and asks it
    to assess overall soundness/verifiability and recommend which pending
    sources look legitimate enough to auto-approve.

    Returns a dict shaped like:
    {
      "logical_soundness": 0.0-1.0,
      "verifiable": "yes" | "no" | "partial",
      "summary": str,
      "approved_source_ids": [int, ...],
      "rejected_source_ids": [int, ...],
    }
    """
    _require_api_key()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(_MODEL_NAME)

    prompt = (
        "You are auditing a discussion post on a fact-checking platform, "
        "including any community-submitted sources for it. Respond with "
        "ONLY a JSON object of this exact shape, no other text:\n"
        "{\n"
        '  "logical_soundness": <float 0-1, how well-reasoned the post/comments are>,\n'
        '  "verifiable": "yes" | "no" | "partial",\n'
        '  "summary": "<one paragraph explaining the assessment>",\n'
        '  "approved_source_ids": [<ids of sources that look like real, '
        "on-topic, working links worth showing publicly>],\n"
        '  "rejected_source_ids": [<ids of sources that look broken, spammy, '
        "or unrelated to the post>]\n"
        "}\n\n"
        f"DATA:\n{json.dumps(collected_data)}"
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )
    except Exception as e:
        raise LlmAuditError(f"Gemini API call failed: {e}") from e

    try:
        return json.loads(response.text)
    except (ValueError, AttributeError) as e:
        raise LlmAuditError(f"Gemini returned a non-JSON response: {e}") from e
