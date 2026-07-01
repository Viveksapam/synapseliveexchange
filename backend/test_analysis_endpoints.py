"""
Test script for Post & Comment Analysis endpoints.
Run with: python -m pytest test_analysis_endpoints.py -v
Or manually: python test_analysis_endpoints.py
"""

import json
from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from database import SessionLocal
from crud import crud_blog
from models.blog_models import BlogModel, BlogCommentModel, CommunityModel
from datetime import date

client = TestClient(app)
db: Session = SessionLocal()


def setup_test_data():
    """Create test blog, comment, and reply for testing."""
    # Create community
    community = CommunityModel(strName="Test Community", strDescription="For testing")
    db.add(community)
    db.commit()
    db.refresh(community)

    # Create blog
    blog = BlogModel(
        strTitle="Test Blog Post",
        strSummary="A test blog post for analysis",
        strContent="""
        This is a detailed blog post about artificial intelligence and machine learning.
        The topic discusses various evidence-based approaches to developing AI systems.
        Research shows that proper data collection is essential for effective models.
        """,
        strThemeColor="#4f46e5",
        datePublished=date.today(),
        community_id=community.id
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    print(f"✅ Created test blog (ID: {blog.id})")

    # Create root comment
    comment1 = BlogCommentModel(
        blog_id=blog.id,
        strAuthor="Test User 1",
        strContent="Great post! However, I think the evidence about data collection is weak. More sources needed."
    )
    db.add(comment1)
    db.commit()
    db.refresh(comment1)
    print(f"✅ Created root comment (ID: {comment1.id})")

    # Create reply to comment
    comment2 = BlogCommentModel(
        blog_id=blog.id,
        parent_comment_id=comment1.id,
        strAuthor="Test User 2",
        strContent="You make a good point. Here's additional research on data quality requirements."
    )
    db.add(comment2)
    db.commit()
    db.refresh(comment2)
    print(f"✅ Created reply comment (ID: {comment2.id})")

    return blog, comment1, comment2


def test_post_analysis():
    """Test blog post analysis endpoint."""
    print("\n" + "="*60)
    print("TEST 1: Blog Post Analysis")
    print("="*60)

    blog, _, _ = setup_test_data()

    # Mock token (in real scenario would be JWT)
    headers = {"Authorization": "Bearer mock-token"}

    url = f"/api/verisphere/blogs/{blog.id}/analysis/"
    print(f"POST {url}")

    response = client.post(url, headers=headers)

    print(f"\n📊 Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Analysis successful!")
        print(f"   - Soundness: {data.get('logical_soundness', 'N/A')}/1.0")
        print(f"   - Verifiable: {data.get('verifiable', 'N/A')}")
        print(f"   - Summary: {data.get('ai_summary', 'N/A')[:100]}...")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False


def test_comment_analysis():
    """Test comment analysis endpoint."""
    print("\n" + "="*60)
    print("TEST 2: Comment Analysis")
    print("="*60)

    blog, comment, reply = setup_test_data()

    # Mock token
    headers = {"Authorization": "Bearer mock-token"}

    url = f"/api/comments/{comment.id}/analyze/"
    print(f"POST {url}")

    response = client.post(url, headers=headers)

    print(f"\n📊 Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Comment analysis successful!")
        print(f"   - Sentiment: {data.get('sentiment', 'N/A')}")
        print(f"   - Relevance: {data.get('relevance_score', 'N/A')*100:.0f}%")
        print(f"   - Summary: {data.get('ai_summary', 'N/A')[:100]}...")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False


def test_reply_analysis():
    """Test analysis on a reply comment."""
    print("\n" + "="*60)
    print("TEST 3: Reply Comment Analysis")
    print("="*60)

    blog, _, reply = setup_test_data()

    # Mock token
    headers = {"Authorization": "Bearer mock-token"}

    url = f"/api/comments/{reply.id}/analyze/"
    print(f"POST {url}")

    response = client.post(url, headers=headers)

    print(f"\n📊 Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Reply analysis successful!")
        print(f"   - Sentiment: {data.get('sentiment', 'N/A')}")
        print(f"   - Relevance: {data.get('relevance_score', 'N/A')*100:.0f}%")
        print(f"   - Summary: {data.get('ai_summary', 'N/A')[:100]}...")
        return True
    else:
        print(f"❌ Error: {response.text}")
        return False


def test_data_isolation():
    """Verify data isolation - post analysis shouldn't affect other blogs."""
    print("\n" + "="*60)
    print("TEST 4: Data Isolation Check")
    print("="*60)

    blog1, _, _ = setup_test_data()

    # Create another blog
    community = db.query(CommunityModel).first()
    blog2 = BlogModel(
        strTitle="Another Blog",
        strSummary="A different blog",
        strContent="Different content for a different blog post",
        strThemeColor="#8b5cf6",
        datePublished=date.today(),
        community_id=community.id
    )
    db.add(blog2)
    db.commit()
    db.refresh(blog2)
    print(f"✅ Created second blog (ID: {blog2.id})")

    headers = {"Authorization": "Bearer mock-token"}

    # Analyze blog1
    response1 = client.post(f"/api/verisphere/blogs/{blog1.id}/analysis/", headers=headers)
    print(f"Blog 1 analysis: {response1.status_code}")

    # Analyze blog2
    response2 = client.post(f"/api/verisphere/blogs/{blog2.id}/analysis/", headers=headers)
    print(f"Blog 2 analysis: {response2.status_code}")

    if response1.status_code == 200 and response2.status_code == 200:
        data1 = response1.json()
        data2 = response2.json()

        # Both should have analysis but with different content
        if (data1.get('ai_summary') != data2.get('ai_summary')):
            print(f"✅ Data isolation verified!")
            print(f"   Blog 1 summary: {data1.get('ai_summary', 'N/A')[:80]}...")
            print(f"   Blog 2 summary: {data2.get('ai_summary', 'N/A')[:80]}...")
            return True
        else:
            print(f"⚠️  Both blogs have same analysis (might indicate data contamination)")
            return False
    else:
        print(f"❌ One or both analyses failed")
        return False


if __name__ == "__main__":
    print("\n🧪 STARTING ANALYSIS ENDPOINT TESTS\n")

    results = {
        "Post Analysis": test_post_analysis(),
        "Comment Analysis": test_comment_analysis(),
        "Reply Analysis": test_reply_analysis(),
        "Data Isolation": test_data_isolation()
    }

    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")

    total = len(results)
    passed = sum(1 for v in results.values() if v)
    print(f"\nTotal: {passed}/{total} tests passed")

    # Cleanup
    db.close()
