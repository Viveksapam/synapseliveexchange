"""Mock LLM service for testing - returns predictable responses without calling Gemini."""

def analyze_audit_collection_mock(collected_data: dict) -> dict:
    """
    Mock LLM response for blog/comment analysis.
    Returns predictable test data based on input content length.
    """
    # Determine if this is comment analysis or post analysis
    is_comment_analysis = "comment_chain" in collected_data and "target_comment" in collected_data

    # Comment analysis
    if is_comment_analysis:
        comment_content = collected_data.get("target_comment", {}).get("strContent", "").lower()
        parent_chain_len = len(collected_data.get("comment_chain", []))

        # Determine sentiment based on keywords
        if any(word in comment_content for word in ["good", "great", "excellent", "agree", "support"]):
            sentiment = "supportive"
        elif any(word in comment_content for word in ["disagree", "wrong", "incorrect", "bad"]):
            sentiment = "critical"
        elif any(word in comment_content for word in ["however", "but", "although", "consider"]):
            sentiment = "constructive"
        else:
            sentiment = "neutral"

        # Relevance based on length and specificity
        relevance = 0.5
        if len(comment_content) > 100:
            relevance += 0.2
        if any(word in comment_content for word in ["evidence", "example", "data", "research"]):
            relevance += 0.15
        if parent_chain_len > 1:
            relevance = min(0.95, relevance + 0.1)

        return {
            "sentiment": sentiment,
            "relevance_score": round(min(0.95, relevance), 2),
            "ai_summary": f"Comment analysis: {sentiment} tone, part of {parent_chain_len}-comment thread. Relevance score: {int(min(0.95, relevance)*100)}%. Content addresses the topic with meaningful contribution.",
            "approved_source_ids": [],
            "rejected_source_ids": []
        }

    # Post analysis
    else:
        blog_content = collected_data.get("blog", {}).get("strContent", "").lower()
        comment_count = len(collected_data.get("comments", []))

        # Simple heuristic: longer content + more comments = higher soundness
        base_score = 0.5
        if len(blog_content) > 500:
            base_score += 0.2
        if comment_count > 3:
            base_score += 0.15
        if "evidence" in blog_content or "source" in blog_content:
            base_score += 0.15

        soundness = min(0.95, base_score)

        return {
            "logical_soundness": round(soundness, 2),
            "verifiable": "yes" if soundness > 0.7 else "partial" if soundness > 0.5 else "no",
            "summary": f"Post analysis: {comment_count} comments received. Content length: {len(blog_content)} chars. Logical soundness estimated at {int(soundness*100)}%.",
            "approved_source_ids": [],
            "rejected_source_ids": []
        }
