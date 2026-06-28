from database import SessionLocal
from models.blog_models import BlogModel, BlogCommentModel
from models.portfolio_models import SkillModel, VideoModel, ProjectModel

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(BlogModel).count() > 0:
        print("Data already seeded. Skipping blogs, comments, skills, and videos.")
    else:
        print("Seeding Blogs...")
        blog1 = BlogModel(
            strTitle="Welcome to FastAPI",
            strSummary="A brief introduction to building modern APIs with FastAPI.",
            strContent="FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.",
            strThemeColor="#10b981"
        )
        blog2 = BlogModel(
            strTitle="Understanding React Hooks",
            strSummary="How to use useState and useEffect.",
            strContent="Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.",
            strThemeColor="#3b82f6"
        )
        db.add_all([blog1, blog2])
        db.commit()
        
        print("Seeding Comments...")
        comment1 = BlogCommentModel(blog_id=blog1.id, strAuthor="Alice", strContent="Great introduction!")
        comment2 = BlogCommentModel(blog_id=blog1.id, strAuthor="Bob", strContent="Very helpful, thanks.")
        db.add_all([comment1, comment2])
        
        print("Seeding Skills...")
        skill1 = SkillModel(
            strTitle="Python",
            strThemeColor="#f59e0b",
            strThemeLight="rgba(245, 158, 11, 0.1)",
            strIconSvg='<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.87 2C6.9 2 6.8 5.3 6.8 5.3h2.38s.16-1.57 2.62-1.57c2.46 0 2.58 1.48 2.58 1.48 0 1.2-1.12 1.48-1.12 1.48H9.3c-2.3 0-4.08 1.62-4.08 4.12 0 2.5 1.5 4 4.08 4h1v-1.37s-.1-1.63 2.1-1.63h3.5s1.95-.14 1.95-3.07c0-2.92-2.12-5.45-6.07-5.45z" fill="currentColor"/><path d="M12.13 22c4.97 0 5.07-3.3 5.07-3.3H14.8s-.16 1.57-2.62 1.57c-2.46 0-2.58-1.48-2.58-1.48 0-1.2 1.12-1.48 1.12-1.48h3.96c2.3 0 4.08-1.62 4.08-4.12 0-2.5-1.5-4-4.08-4h-1v1.37s.1 1.63-2.1 1.63H7.66s-1.95.14-1.95 3.07C5.7 19.2 7.82 22 11.77 22z" fill="currentColor"/></svg>',
            strModalHtml="<p>Experienced in backend development with Python.</p>"
        )
        skill2 = SkillModel(
            strTitle="React",
            strThemeColor="#61dafb",
            strThemeLight="rgba(97, 218, 251, 0.1)",
            strIconSvg='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
            strModalHtml="<p>Building dynamic SPAs with React.</p>"
        )
        db.add_all([skill1, skill2])
        
        print("Seeding Videos...")
        video1 = VideoModel(
            strTitle="Project Demo: Synapse",
            strDescription="A full-stack application demo.",
            strYoutubeEmbedUrl="https://www.youtube.com/embed/dQw4w9WgXcQ",
            boolIsFeatured=True
        )
        db.add(video1)
        db.commit()

    if db.query(ProjectModel).count() == 0:
        print("Seeding Projects...")
        project1 = ProjectModel(
            strName="Synapse-LE",
            strDescription="A modern, high-performance portfolio and blog built with FastAPI and React.",
            strTechStack="React,FastAPI,SQLite,Vite",
            strGithubUrl="https://github.com/example/synapse-le",
            boolIsFeatured=True
        )
        db.add(project1)
        db.commit()

    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
