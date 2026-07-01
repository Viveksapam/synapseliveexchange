"""Mock LLM service for dev/demo - returns sentence-based, decomposed audit
output without calling Gemini. Mirrors the flattened shape produced by
llm_audit._flatten_audit_response so crud/router code is identical either way.

The heuristics here are deliberately simple but content-aware: they read the
post/comment text for evidence markers vs. pseudo-scientific / absolutist
markers and produce a calibrated, prose assessment rather than raw stats.
"""

# Words that signal grounded, checkable reasoning.
_EVIDENCE_MARKERS = [
    "study", "studies", "data", "dataset", "evidence", "peer-review",
    "peer reviewed", "journal", "doi", "citation", "source", "research",
    "experiment", "measured", "sample", "controlled", "%", "percent",
]

# Words that signal unfalsifiable, absolutist, or hyperbolic claims.
_PSEUDO_MARKERS = [
    "conclusive proof", "proof that", "obviously", "clearly proves",
    "undeniable", "everyone knows", "it's a fact that", "seamlessly",
    "broke the internet", "only ", "cannot be explained", "hyper-dimensional",
    "4th-dimensional", "tesseract", "they don't want you to know",
]

_ABSOLUTES = ["always", "never", "everyone", "no one", "impossible", "guaranteed", "100%"]


def _count_markers(text, markers):
    return sum(1 for m in markers if m in text)


def _band(score):
    if score <= 20:
        return "very low"
    if score <= 40:
        return "low"
    if score <= 60:
        return "mixed"
    if score <= 80:
        return "solid"
    return "strong"


def _recommended_sources_for(topic_hint):
    """Two to three reputable, verifiable search strategies. These are search
    directions for a human to verify, never fabricated deep links."""
    return [
        {
            "publisher_or_organization": "Nature / Nature Communications",
            "reason_for_inclusion": (
                "Peer-reviewed primary literature is the appropriate evidentiary "
                "tier for the empirical claim in this post; it is currently "
                "supported only by assertion."
            ),
            "suggested_search_query_or_url": (
                f'site:nature.com "{topic_hint}" peer-reviewed study'
            ),
        },
        {
            "publisher_or_organization": "Google Scholar",
            "reason_for_inclusion": (
                "Surfaces the breadth of academic consensus (and dissent) so the "
                "claim can be weighed against the established literature rather "
                "than a single source."
            ),
            "suggested_search_query_or_url": (
                f'https://scholar.google.com/scholar?q={topic_hint.replace(" ", "+")}'
            ),
        },
        {
            "publisher_or_organization": "Reuters Fact Check",
            "reason_for_inclusion": (
                "Provides an independent, editorially-accountable adjudication of "
                "the viral framing, useful for separating the factual core from "
                "rhetorical amplification."
            ),
            "suggested_search_query_or_url": (
                f'site:reuters.com/fact-check {topic_hint}'
            ),
        },
    ]


def analyze_audit_collection_mock(collected_data: dict) -> dict:
    """Mock audit for a blog post or a single comment. Returns the flat shape
    consumed by crud_blog.sync_* and the router."""
    is_comment_analysis = (
        "comment_chain" in collected_data and "target_comment" in collected_data
    )
    if is_comment_analysis:
        return _analyze_comment_mock(collected_data)
    return _analyze_post_mock(collected_data)


def _analyze_comment_mock(collected_data: dict) -> dict:
    comment = collected_data.get("target_comment", {})
    content = (comment.get("strContent") or "").lower()
    chain_len = len(collected_data.get("comment_chain", []))

    evidence = _count_markers(content, _EVIDENCE_MARKERS)
    pseudo = _count_markers(content, _PSEUDO_MARKERS)

    if any(w in content for w in ["disagree", "wrong", "incorrect", "however", "but ", "actually"]):
        sentiment = "critical" if evidence == 0 else "constructive"
    elif any(w in content for w in ["great", "agree", "confirm", "fantastic", "solved", "love"]):
        sentiment = "supportive"
    else:
        sentiment = "neutral"

    relevance = 0.45 + min(0.25, evidence * 0.1) + (0.1 if chain_len > 1 else 0) - min(0.2, pseudo * 0.1)
    relevance = round(max(0.1, min(0.95, relevance)), 2)

    if evidence and not pseudo:
        summary = (
            f"This {sentiment} comment grounds its point in checkable specifics "
            f"({evidence} evidence marker(s)), which raises its evidentiary weight "
            "above bare opinion. It engages the thread's substance rather than the "
            "author, and its claim could be verified against the cited material."
        )
    elif pseudo:
        summary = (
            f"This {sentiment} comment leans on assertion and absolutist phrasing "
            "rather than evidence. Treat its conclusion as unverified: it restates "
            "confidence without offering a way to check the claim."
        )
    else:
        summary = (
            f"A {sentiment} comment that stays on-topic but is largely anecdotal. "
            "It neither cites evidence nor commits an obvious fallacy, so it adds "
            "context without materially strengthening or weakening the post's case."
        )

    return {
        "sentiment": sentiment,
        "relevance_score": relevance,
        "ai_summary": summary,
        "approved_source_ids": [],
        "rejected_source_ids": [],
    }


def _analyze_post_mock(collected_data: dict) -> dict:
    blog = collected_data.get("blog", {})
    title = blog.get("strTitle") or "this topic"
    content = (blog.get("strContent") or "").lower()
    summary_text = (blog.get("strSummary") or "").lower()
    haystack = f"{title.lower()} {content} {summary_text}"

    comments = collected_data.get("comments", [])
    sources = collected_data.get("sources", [])

    evidence = _count_markers(haystack, _EVIDENCE_MARKERS)
    pseudo = _count_markers(haystack, _PSEUDO_MARKERS)
    absolutes = _count_markers(haystack, _ABSOLUTES)

    # Decomposed sub-scores (0-100), each justified.
    clarity = max(5, 70 - pseudo * 25)
    premise = max(5, 30 + evidence * 15 - pseudo * 15)
    inference = max(5, 65 - pseudo * 20 - absolutes * 5)
    src_reliability = 25 + min(50, len(sources) * 20)
    fallacy_freedom = max(5, 80 - pseudo * 20 - absolutes * 10)

    detected_fallacies = []
    if pseudo:
        detected_fallacies.append({
            "name": "Unfalsifiability / non-scientific premise",
            "quote": _first_marker_span(blog, _PSEUDO_MARKERS),
            "explanation": (
                "The central claim is framed so that no observation could disprove "
                "it, placing it outside the domain of empirical verification."
            ),
        })
    if "broke the internet" in haystack or "only " in haystack:
        detected_fallacies.append({
            "name": "Non sequitur",
            "quote": _first_marker_span(blog, ["broke the internet", "only "]),
            "explanation": (
                "Popularity or virality is offered as if it entailed the "
                "conclusion; the inference does not follow from the premise."
            ),
        })
    if absolutes:
        detected_fallacies.append({
            "name": "Overgeneralization",
            "quote": _first_marker_span(blog, _ABSOLUTES),
            "explanation": (
                "Absolutist language asserts universality that the evidence "
                "presented does not support."
            ),
        })

    sub_scores = {
        "clarity_falsifiability": {
            "score": clarity,
            "rationale": (
                "Claim is unfalsifiable as stated." if pseudo
                else "Claim is stated clearly enough to test."
            ),
        },
        "premise_support": {
            "score": premise,
            "rationale": (
                f"{evidence} evidence marker(s); premises rest largely on assertion."
                if evidence else "Premises rest on assertion, not cited evidence."
            ),
        },
        "inferential_validity": {
            "score": inference,
            "rationale": (
                "Conclusion outruns the premises." if pseudo or absolutes
                else "Conclusion broadly follows from the premises."
            ),
        },
        "source_reliability": {
            "score": src_reliability,
            "rationale": (
                f"{len(sources)} source(s) attached; relevance to the exact claim "
                "must still be checked." if sources
                else "No community sources bear directly on the claim."
            ),
        },
        "fallacy_bias_freedom": {
            "score": fallacy_freedom,
            "rationale": (
                f"{len(detected_fallacies)} fallacy pattern(s) detected."
                if detected_fallacies else "No overt fallacies detected."
            ),
        },
    }

    aggregate = round(
        (clarity + premise + inference + src_reliability + fallacy_freedom) / 500.0, 2
    )
    verifiable = "yes" if aggregate > 0.7 else "partial" if aggregate > 0.45 else "no"

    steelman = (
        f'The strongest charitable reading of "{title}" is that the author has '
        "noticed a genuine pattern and is reaching for an explanatory framework; "
        "the observation may be real even if the proposed mechanism is not "
        "established."
    )

    if pseudo:
        summary = (
            f'This post advances an empirical-sounding claim ("{title}") that is, '
            f"on inspection, unfalsifiable — it scores {_band(clarity)} on clarity "
            f"and falsifiability. Its premises rest on assertion rather than the "
            f"peer-reviewed evidence the claim would require, and {len(detected_fallacies)} "
            "fallacy pattern(s) were detected in the reasoning. Reader engagement "
            "and reactions carry no evidentiary weight and were disregarded. The "
            f"aggregate soundness of {int(aggregate * 100)}/100 reflects a claim "
            "that is confidently stated but not currently supportable."
        )
    else:
        summary = (
            f'This post makes a checkable claim ("{title}") supported by '
            f"{evidence} evidence marker(s) and {len(sources)} community source(s). "
            f"It scores {_band(premise)} on premise support and {_band(inference)} "
            "on inferential validity. The reasoning is broadly coherent, though the "
            "sources should still be checked for relevance to the exact claim rather "
            f"than the general topic. Aggregate soundness: {int(aggregate * 100)}/100."
        )

    verification_pathway = (
        "This claim would be confirmed or falsified by locating peer-reviewed "
        f'measurements directly addressing "{title}", ideally a controlled study '
        "or dataset reported in a primary source, and checking whether independent "
        "replications reach the same result."
    )

    context_guardrail = (
        f'Established ground truth: there is no accepted body of evidence supporting '
        f'the specific mechanism proposed here, and the burden of proof rests with '
        f'the claimant. This discussion is at risk of drifting when virality or '
        f'reaction counts are treated as confirmation, when absolutist language '
        f'({absolutes} instance(s) detected) substitutes for measurement, or when '
        f'sources on the general topic are cited as if they settled the exact claim. '
        f'Hold the thread to falsifiable statements and primary evidence.'
        if pseudo else
        f'Established ground truth: the claim is the kind of statement that can be '
        f'checked against primary evidence, so the discussion should stay anchored '
        f'to what the cited sources actually measured. Watch for scope drift — '
        f'generalizing beyond what the evidence covers — and for sources being '
        f'treated as more authoritative or more on-point than they are.'
    )

    topic_hint = title if len(title) < 60 else title[:57]

    return {
        "logical_soundness": aggregate,
        "verifiable": verifiable,
        "summary": summary,
        "ai_context_guardrail": context_guardrail,
        "analysis_detail": {
            "sub_scores": sub_scores,
            "detected_fallacies": detected_fallacies,
            "steelman": steelman,
            "verification_pathway": verification_pathway,
        },
        "recommended_new_sources": _recommended_sources_for(topic_hint),
        "approved_source_ids": [],
        "rejected_source_ids": [],
    }


def _first_marker_span(blog: dict, markers) -> str:
    """Return the original-cased sentence fragment around the first marker hit,
    so 'detected_fallacies' quotes real text rather than a lowercased token."""
    original = (blog.get("strContent") or blog.get("strSummary") or blog.get("strTitle") or "")
    low = original.lower()
    for m in markers:
        idx = low.find(m)
        if idx != -1:
            start = max(0, idx - 20)
            end = min(len(original), idx + len(m) + 30)
            span = original[start:end].strip()
            return f"...{span}..." if span else m
    return markers[0] if markers else ""
