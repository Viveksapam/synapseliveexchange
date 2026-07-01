"""
Quick test to verify Gemini API is working with real LLM.
This uses the analyze_audit_collection function directly.
"""

import json
from core.config import settings
from services.llm_audit import analyze_audit_collection

print(f"USE_MOCK_LLM: {settings.USE_MOCK_LLM}")
print(f"GEMINI_API_KEY: {settings.GEMINI_API_KEY[:20]}..." if settings.GEMINI_API_KEY else "None")

if not settings.GEMINI_API_KEY:
    print("\n❌ ERROR: GEMINI_API_KEY not set!")
    exit(1)

# Test data
test_blog_data = {
    "blog": {
        "id": 1,
        "strTitle": "AI Ethics",
        "strContent": "This post discusses the importance of ethical considerations in artificial intelligence development. Research shows that diverse teams produce more robust AI systems.",
        "strAuthorUsername": "test_user",
        "strCommunityName": "Ethics"
    },
    "comments": [
        {"id": 1, "strContent": "Great analysis", "strAuthor": "User1"},
        {"id": 2, "strContent": "Need more sources", "strAuthor": "User2"}
    ],
    "contexts": [],
    "sources": []
}

print("\n🔄 Sending request to Gemini API...")
print("=" * 70)

try:
    result = analyze_audit_collection(test_blog_data)
    print("✅ SUCCESS! Gemini API responded:")
    print("=" * 70)
    print(json.dumps(result, indent=2))

    # Verify response structure
    assert "logical_soundness" in result, "Missing logical_soundness"
    assert "verifiable" in result, "Missing verifiable"
    assert "summary" in result, "Missing summary"

    print("\n✅ Response is valid!")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
