"""
Create a demo blog post about climate change and employment laws.
"""

from datetime import date
from sqlalchemy.orm import Session
from database import SessionLocal
from models.blog_models import BlogModel, BlogCommentModel, CommunityModel, BlogContextModel, BlogSourceModel

db: Session = SessionLocal()

# Get or create community
community = db.query(CommunityModel).filter(CommunityModel.strName == "Environment & Policy").first()
if not community:
    community = CommunityModel(
        strName="Environment & Policy",
        strDescription="Discussions on environmental regulations and their impact on employment"
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    print(f"✅ Created community: {community.strName}")
else:
    print(f"✅ Using existing community: {community.strName}")

# Create blog post
blog = BlogModel(
    strTitle="How Climate Change Laws Are Reshaping Employment Markets",
    strSummary="An analysis of how new environmental regulations are creating and transforming job opportunities across industries",
    strContent="""
Climate change legislation is fundamentally transforming employment landscapes worldwide. Recent studies show that environmental regulations drive significant job creation in renewable energy sectors while displacing workers in fossil fuel industries.

Key findings from our research:

1. Green Jobs Creation: The renewable energy sector has grown by 45% over the past five years, creating over 2.3 million new jobs globally. Solar and wind installation, battery manufacturing, and electric vehicle production are the fastest-growing employment areas.

2. Job Displacement: Traditional coal mining and oil refining sectors have experienced workforce reductions of 15-30% as companies transition to cleaner energy sources. Workers in these sectors face significant retraining challenges.

3. Skills Gap: New environmental regulations require workers with specialized skills in renewable energy technologies, environmental compliance, and green engineering. Current vocational training programs struggle to keep pace with demand.

4. Geographic Impact: Climate policies disproportionately affect specific regions dependent on fossil fuel industries. However, these same regions are becoming hubs for renewable energy investment and manufacturing.

5. Economic Transition: Evidence suggests that well-planned just transition programs can help workers move from declining industries to growth sectors, though funding remains insufficient in many jurisdictions.

The data clearly indicates that while climate laws create net job growth, the transition requires significant investment in worker retraining and community support to minimize negative impacts on vulnerable populations.
    """,
    strThemeColor="#1abc9c",
    datePublished=date.today(),
    community_id=community.id
)
db.add(blog)
db.commit()
db.refresh(blog)
print(f"✅ Created blog post: {blog.strTitle} (ID: {blog.id})")

# Add some comments
comments = [
    {
        "strAuthor": "Dr. Sarah Mitchell",
        "strContent": "This analysis is thorough and well-researched. However, I'd like to see more data on the effectiveness of government transition programs. The retraining initiatives in my region have shown mixed results."
    },
    {
        "strAuthor": "James Chen",
        "strContent": "Excellent breakdown of the employment trends. The 45% growth in renewable sector is impressive, but we need to address the wage disparity. Green jobs often pay less than traditional energy sector positions, creating challenges for displaced workers."
    },
    {
        "strAuthor": "Maria Garcia",
        "strContent": "As an environmental economist, I agree with most points, but the geographic impact analysis needs more nuance. Coastal regions with tech industries are adapting faster than inland communities dependent on coal."
    }
]

comment_objects = []
for comment_data in comments:
    comment = BlogCommentModel(
        blog_id=blog.id,
        strAuthor=comment_data["strAuthor"],
        strContent=comment_data["strContent"]
    )
    db.add(comment)
    comment_objects.append(comment)
db.commit()
print(f"✅ Added {len(comments)} comments to the blog")

# Add a reply to the first comment
reply = BlogCommentModel(
    blog_id=blog.id,
    parent_comment_id=comment_objects[0].id,
    strAuthor="Climate Policy Analyst",
    strContent="Dr. Mitchell raises an excellent point about transition program effectiveness. I've been tracking several regional programs, and the ones with strong employer partnerships and wage support show 70% successful transitions within 3 years."
)
db.add(reply)
db.commit()
print(f"✅ Added reply comment")

# Create contexts and sources
sources_data = [
    {
        "context": "Research & Studies",
        "sources": [
            {
                "strTitle": "International Renewable Energy Agency (IRENA) Global Employment Report",
                "strUrl": "https://www.irena.org/publications/2023-jan/renewable-energy-and-jobs-annual-review-2023",
                "strDescription": "Comprehensive analysis of renewable energy employment trends globally with sector-specific breakdowns",
                "strAuthor": "IRENA"
            },
            {
                "strTitle": "World Economic Forum - The Future of Jobs Report",
                "strUrl": "https://www.weforum.org/publications/future-of-jobs-report-2023",
                "strDescription": "Employment impact analysis of climate transition and green technology adoption",
                "strAuthor": "WEF"
            }
        ]
    },
    {
        "context": "Policy & Government",
        "sources": [
            {
                "strTitle": "U.S. Environmental Protection Agency - Green Jobs Report",
                "strUrl": "https://www.epa.gov/environmental-economics/green-economy",
                "strDescription": "Official EPA statistics on employment in environmental and green sectors",
                "strAuthor": "EPA"
            },
            {
                "strTitle": "European Commission - Just Transition Mechanism",
                "strUrl": "https://ec.europa.eu/info/business-economy-euro/banking-and-finance/sustainable-finance/sustainable-finance-taxonomy_en",
                "strDescription": "EU framework for supporting workers and communities in climate transition",
                "strAuthor": "European Commission"
            }
        ]
    },
    {
        "context": "Economic Analysis",
        "sources": [
            {
                "strTitle": "BloombergNEF - Renewable Energy Job Creation Analysis",
                "strUrl": "https://www.bnef.com",
                "strDescription": "Investment-focused analysis of job creation in clean energy sectors",
                "strAuthor": "BloombergNEF"
            },
            {
                "strTitle": "International Labour Organization - Skills for Green Jobs",
                "strUrl": "https://www.ilo.org/global/topics/green-jobs/lang--en/index.htm",
                "strDescription": "Worker training and skills gap analysis in transition to green economy",
                "strAuthor": "ILO"
            }
        ]
    }
]

for context_data in sources_data:
    # Create context
    context = BlogContextModel(
        blog_id=blog.id,
        strTitle=context_data["context"],
        strDescription=f"Sources related to {context_data['context'].lower()}"
    )
    db.add(context)
    db.commit()
    db.refresh(context)

    # Create sources for this context
    for source_data in context_data["sources"]:
        source = BlogSourceModel(
            context_id=context.id,
            strTitle=source_data["strTitle"],
            strUrl=source_data["strUrl"],
            strDescription=source_data["strDescription"],
            strAuthor=source_data["strAuthor"],
            review_status="pending"  # Sources start as pending approval
        )
        db.add(source)
    db.commit()

print(f"✅ Added {sum(len(c['sources']) for c in sources_data)} sources in {len(sources_data)} contexts")

print("\n" + "="*70)
print("DEMO BLOG CREATED SUCCESSFULLY")
print("="*70)
print(f"Blog ID: {blog.id}")
print(f"Title: {blog.strTitle}")
print(f"Comments: {len(comments)}")
print(f"\nAccess at: http://localhost:5173/verisphere/post/{blog.id}")
print(f"Discuss at: http://localhost:5173/verisphere/post/{blog.id}/comments")
print("\n" + "="*70)

db.close()
