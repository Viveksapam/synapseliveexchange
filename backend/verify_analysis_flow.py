"""
Direct verification of analysis flow without needing to run the server.
Tests database operations, CRUD functions, and LLM mock response.
"""

import json
from datetime import date
from sqlalchemy.orm import Session
from database import SessionLocal
from models.blog_models import (
    BlogModel, BlogCommentModel, CommunityModel,
    BlogAuditCollectionModel, BlogAIAnalysisModel,
    CommentAuditCollectionModel, CommentAnalysisModel
)
from crud import crud_blog
from services.llm_audit_mock import analyze_audit_collection_mock

db: Session = SessionLocal()


def cleanup():
    """Clean up test data."""
    db.query(CommentAnalysisModel).delete()
    db.query(CommentAuditCollectionModel).delete()
    db.query(BlogAIAnalysisModel).delete()
    db.query(BlogAuditCollectionModel).delete()
    db.query(BlogCommentModel).delete()
    db.query(BlogModel).delete()
    db.query(CommunityModel).delete()
    db.commit()


def test_post_analysis_flow():
    """Test complete post analysis flow: collect → mock LLM → sync."""
    print("\n" + "="*70)
    print("TEST 1: POST ANALYSIS FLOW")
    print("="*70)

    cleanup()

    # 1. Create test data
    community = CommunityModel(strName="Test Community", strDescription="For testing")
    db.add(community)
    db.commit()
    db.refresh(community)

    blog = BlogModel(
        strTitle="AI Future Predictions",
        strSummary="An analysis of AI development trends",
        strContent="""
        Recent research indicates that AI will continue to advance.
        Evidence from multiple sources shows strong growth in machine learning.
        This is supported by peer-reviewed studies and industry data.
        """,
        strThemeColor="#4f46e5",
        datePublished=date.today(),
        community_id=community.id
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    print(f"✅ Created blog (ID: {blog.id})")

    comment1 = BlogCommentModel(blog_id=blog.id, strAuthor="User1", strContent="Good analysis")
    comment2 = BlogCommentModel(blog_id=blog.id, strAuthor="User2", strContent="Needs more sources")
    db.add(comment1)
    db.add(comment2)
    db.commit()
    print(f"✅ Created 2 comments")

    # 2. Collect audit data
    print("\n📋 STEP 1: Collecting audit data...")
    collection = crud_blog.create_audit_collection(db, blog.id)
    assert collection is not None, "Failed to create audit collection"
    print(f"✅ Audit collection created (ID: {collection.id})")

    collected = json.loads(collection.collected_data)
    assert "blog" in collected, "Blog data missing"
    assert "comments" in collected, "Comments missing"
    assert len(collected["comments"]) == 2, "Not all comments collected"
    print(f"✅ Collected: blog + {len(collected['comments'])} comments")

    # 3. Mock LLM Analysis
    print("\n🤖 STEP 2: Mock LLM analysis...")
    llm_result = analyze_audit_collection_mock(collected)
    assert "logical_soundness" in llm_result, "LLM missing soundness score"
    assert "verifiable" in llm_result, "LLM missing verifiable status"
    assert "summary" in llm_result, "LLM missing summary"
    print(f"✅ LLM returned: soundness={llm_result['logical_soundness']}, verifiable={llm_result['verifiable']}")

    # 4. Sync to BlogAIAnalysisModel
    print("\n💾 STEP 3: Syncing to BlogAIAnalysisModel...")
    analysis = crud_blog.sync_audit_to_blog_analysis(db, blog.id, llm_result)
    assert analysis is not None, "Failed to sync analysis"
    assert analysis.blog_id == blog.id, "Analysis not linked to correct blog"
    assert analysis.logical_soundness == llm_result["logical_soundness"], "Soundness not synced"
    assert analysis.verifiable == llm_result["verifiable"], "Verifiable not synced"
    assert analysis.ai_summary == llm_result["summary"], "Summary not synced"
    print(f"✅ Analysis synced to BlogAIAnalysisModel (blog_id={analysis.blog_id})")

    # 5. Verify blog now has analysis
    print("\n🔍 STEP 4: Verifying blog has analysis...")
    updated_blog = crud_blog.get_blog_by_id(db, blog.id)
    assert updated_blog.logical_soundness is not None, "Blog analysis not accessible"
    assert updated_blog.verifiable is not None, "Blog analysis not accessible"
    print(f"✅ Blog analysis accessible via properties: soundness={updated_blog.logical_soundness}, verifiable={updated_blog.verifiable}")

    print("\n✅ POST ANALYSIS FLOW: PASSED")
    return True


def test_comment_analysis_flow():
    """Test complete comment analysis flow: collect → mock LLM → sync."""
    print("\n" + "="*70)
    print("TEST 2: COMMENT ANALYSIS FLOW")
    print("="*70)

    cleanup()

    # 1. Create test data with parent-reply chain
    community = CommunityModel(strName="Test Community", strDescription="For testing")
    db.add(community)
    db.commit()

    blog = BlogModel(
        strTitle="Machine Learning Ethics",
        strSummary="Discussing ethical considerations",
        strContent="Ethics is crucial in AI development. We need diverse perspectives.",
        strThemeColor="#8b5cf6",
        datePublished=date.today(),
        community_id=community.id
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)

    # Create parent comment
    parent = BlogCommentModel(
        blog_id=blog.id,
        strAuthor="Expert",
        strContent="I agree with the post. Here's research evidence supporting this view."
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)

    # Create reply
    reply = BlogCommentModel(
        blog_id=blog.id,
        parent_comment_id=parent.id,
        strAuthor="Scholar",
        strContent="This is constructive feedback that addresses the core concerns well."
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    print(f"✅ Created parent comment (ID: {parent.id}) and reply (ID: {reply.id})")

    # 2. Collect comment audit data
    print("\n📋 STEP 1: Collecting comment audit data...")
    collection = crud_blog.create_comment_audit_collection(db, reply.id)
    assert collection is not None, "Failed to create comment audit collection"
    print(f"✅ Comment audit collection created (ID: {collection.id})")

    collected = json.loads(collection.collected_data)
    assert "blog" in collected, "Blog context missing"
    assert "comment_chain" in collected, "Comment chain missing"
    assert "target_comment" in collected, "Target comment missing"
    assert len(collected["comment_chain"]) == 2, "Parent chain not fully collected"
    print(f"✅ Collected: blog context + {len(collected['comment_chain'])}-comment chain")

    # 3. Mock LLM Analysis
    print("\n🤖 STEP 2: Mock LLM analysis...")
    llm_result = analyze_audit_collection_mock(collected)
    assert "sentiment" in llm_result, "LLM missing sentiment"
    assert "relevance_score" in llm_result, "LLM missing relevance score"
    assert "ai_summary" in llm_result, "LLM missing summary"
    print(f"✅ LLM returned: sentiment={llm_result['sentiment']}, relevance={llm_result['relevance_score']}")

    # 4. Sync to CommentAnalysisModel
    print("\n💾 STEP 3: Syncing to CommentAnalysisModel...")
    analysis = crud_blog.sync_comment_audit_to_analysis(db, reply.id, llm_result)
    assert analysis is not None, "Failed to sync comment analysis"
    assert analysis.comment_id == reply.id, "Analysis not linked to correct comment"
    assert analysis.sentiment == llm_result["sentiment"], "Sentiment not synced"
    assert analysis.relevance_score == llm_result["relevance_score"], "Relevance not synced"
    print(f"✅ Comment analysis synced (comment_id={analysis.comment_id})")

    # 5. Verify comment has analysis
    print("\n🔍 STEP 4: Verifying comment has analysis...")
    db_comment = db.query(BlogCommentModel).filter(BlogCommentModel.id == reply.id).first()
    assert db_comment.analysis is not None, "Comment analysis not accessible"
    print(f"✅ Comment analysis accessible: sentiment={db_comment.analysis.sentiment}")

    print("\n✅ COMMENT ANALYSIS FLOW: PASSED")
    return True


def test_data_isolation():
    """Verify that one blog's analysis doesn't bleed into another's."""
    print("\n" + "="*70)
    print("TEST 3: DATA ISOLATION VERIFICATION")
    print("="*70)

    cleanup()

    # Create two separate blogs
    community = CommunityModel(strName="Community", strDescription="Test")
    db.add(community)
    db.commit()

    blog1 = BlogModel(strTitle="Blog 1", strSummary="First", strContent="Content A",
                     strThemeColor="#3b82f6", datePublished=date.today(), community_id=community.id)
    blog2 = BlogModel(strTitle="Blog 2", strSummary="Second", strContent="Content B",
                     strThemeColor="#8b5cf6", datePublished=date.today(), community_id=community.id)
    db.add(blog1)
    db.add(blog2)
    db.commit()
    db.refresh(blog1)
    db.refresh(blog2)
    print(f"✅ Created blog1 (ID: {blog1.id}) and blog2 (ID: {blog2.id})")

    # Analyze both blogs
    print("\n📋 Collecting and analyzing both blogs...")
    collection1 = crud_blog.create_audit_collection(db, blog1.id)
    collection2 = crud_blog.create_audit_collection(db, blog2.id)

    llm1 = analyze_audit_collection_mock(json.loads(collection1.collected_data))
    llm2 = analyze_audit_collection_mock(json.loads(collection2.collected_data))

    analysis1 = crud_blog.sync_audit_to_blog_analysis(db, blog1.id, llm1)
    analysis2 = crud_blog.sync_audit_to_blog_analysis(db, blog2.id, llm2)

    # Verify isolation
    print("\n🔍 Verifying data isolation...")
    assert analysis1.blog_id == blog1.id, "Blog 1 analysis has wrong blog_id"
    assert analysis2.blog_id == blog2.id, "Blog 2 analysis has wrong blog_id"
    assert analysis1.blog_id != analysis2.blog_id, "Same blog_id for both analyses"

    # Fetch directly to ensure database isolation
    db_analysis1 = db.query(BlogAIAnalysisModel).filter(BlogAIAnalysisModel.blog_id == blog1.id).first()
    db_analysis2 = db.query(BlogAIAnalysisModel).filter(BlogAIAnalysisModel.blog_id == blog2.id).first()

    assert db_analysis1 is not None, "Blog 1 analysis not found in database"
    assert db_analysis2 is not None, "Blog 2 analysis not found in database"
    assert db_analysis1.blog_id != db_analysis2.blog_id, "Analysis blog_ids are different"

    print(f"✅ Blog 1 analysis: blog_id={db_analysis1.blog_id}, soundness={db_analysis1.logical_soundness}")
    print(f"✅ Blog 2 analysis: blog_id={db_analysis2.blog_id}, soundness={db_analysis2.logical_soundness}")
    print("\n✅ DATA ISOLATION: VERIFIED - NO CROSS-CONTAMINATION")
    return True


def test_mock_llm_responses():
    """Verify mock LLM returns appropriate responses."""
    print("\n" + "="*70)
    print("TEST 4: MOCK LLM RESPONSE VALIDATION")
    print("="*70)

    # Test post analysis mock response
    print("\n📝 Testing post analysis mock response...")
    post_data = {
        "blog": {"strContent": "A" * 500, "title": "Test"},  # Long content
        "comments": [{"id": 1}, {"id": 2}, {"id": 3}]  # 3 comments
    }
    response = analyze_audit_collection_mock(post_data)

    assert isinstance(response.get("logical_soundness"), (int, float)), "Soundness should be numeric"
    assert 0 <= response.get("logical_soundness", 0) <= 1, "Soundness should be 0-1"
    assert response.get("verifiable") in ["yes", "no", "partial"], "Invalid verifiable value"
    assert isinstance(response.get("summary"), str), "Summary should be string"
    assert len(response.get("summary", "")) > 0, "Summary should not be empty"
    print(f"✅ Post response: soundness={response['logical_soundness']}, verifiable={response['verifiable']}")

    # Test comment analysis mock response
    print("\n💬 Testing comment analysis mock response...")
    comment_data = {
        "target_comment": {"strContent": "This is great evidence for the claim!"},
        "comment_chain": [{"id": 1}, {"id": 2}, {"id": 3}],
        "blog": {}
    }
    response = analyze_audit_collection_mock(comment_data)

    assert isinstance(response.get("sentiment"), str), "Sentiment should be string"
    assert response.get("sentiment") in ["supportive", "critical", "constructive", "neutral"], "Invalid sentiment"
    assert isinstance(response.get("relevance_score"), (int, float)), "Relevance should be numeric"
    assert 0 <= response.get("relevance_score", 0) <= 1, "Relevance should be 0-1"
    print(f"✅ Comment response: sentiment={response['sentiment']}, relevance={response['relevance_score']}")

    print("\n✅ MOCK LLM RESPONSES: VALID")
    return True


if __name__ == "__main__":
    print("\n" + "🧪 "*35)
    print("ANALYSIS FLOW VERIFICATION (No Server Required)")
    print("🧪 "*35)

    try:
        results = {
            "Post Analysis Flow": test_post_analysis_flow(),
            "Comment Analysis Flow": test_comment_analysis_flow(),
            "Data Isolation": test_data_isolation(),
            "Mock LLM Responses": test_mock_llm_responses(),
        }

        print("\n" + "="*70)
        print("FINAL SUMMARY")
        print("="*70)

        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status}: {test_name}")

        total = len(results)
        passed_count = sum(1 for v in results.values() if v)
        print(f"\nTotal: {passed_count}/{total} tests passed")

        if passed_count == total:
            print("\n🎉 ALL TESTS PASSED - ANALYSIS FLOW IS WORKING!\n")
        else:
            print("\n⚠️  SOME TESTS FAILED\n")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        cleanup()
        db.close()
