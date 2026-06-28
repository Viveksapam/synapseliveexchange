from database import engine, SessionLocal
from sqlalchemy import text
from models.blog_models import BlogModel

def run_migration():
    with engine.begin() as conn:
        # Create CommunityModel table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS blog_communitymodel (
                id SERIAL PRIMARY KEY,
                "strName" VARCHAR(255) NOT NULL,
                "strDescription" TEXT
            )
        """))
        print("Created CommunityModel")

        # Create BlogAIAnalysisModel table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS blog_blogaianalysismodel (
                blog_id INTEGER PRIMARY KEY REFERENCES blog_blogmodel(id) ON DELETE CASCADE,
                verifiable VARCHAR(50) DEFAULT 'yes',
                logical_soundness FLOAT DEFAULT 0.99,
                ai_summary TEXT
            )
        """))
        print("Created BlogAIAnalysisModel")

        # 1. Populate Communities
        print("Migrating Communities...")
        communities = conn.execute(text('SELECT DISTINCT "objCommunity", "strCommunityName" FROM blog_blogmodel')).fetchall()
        for comm in communities:
            comm_id = comm[0]
            comm_name = comm[1].replace("'", "''") if comm[1] else "General"
            conn.execute(text(f"INSERT INTO blog_communitymodel (id, \"strName\") VALUES ({comm_id}, '{comm_name}') ON CONFLICT (id) DO NOTHING"))
        
        # Adjust BlogModel sequence if necessary
        conn.execute(text("SELECT setval(pg_get_serial_sequence('blog_communitymodel', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM blog_communitymodel"))

        # 2. Populate AI Metrics
        print("Migrating AI Metrics...")
        metrics = conn.execute(text("SELECT id, verifiable, logical_soundness, ai_summary FROM blog_blogmodel")).fetchall()
        for m in metrics:
            conn.execute(text("""
                INSERT INTO blog_blogaianalysismodel (blog_id, verifiable, logical_soundness, ai_summary) 
                VALUES (:blog_id, :verifiable, :logical_soundness, :ai_summary)
                ON CONFLICT (blog_id) DO NOTHING
            """), {"blog_id": m[0], "verifiable": m[1], "logical_soundness": m[2], "ai_summary": m[3]})
        
        # 3. Handle author mapping
        # Currently strAuthorUsername maps to username in user_usermodel.
        print("Mapping Authors...")
        # Check if author_id column exists
        res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogmodel' AND column_name='author_id'")).fetchone()
        if not res:
            conn.execute(text("ALTER TABLE blog_blogmodel ADD COLUMN author_id BIGINT REFERENCES user_usermodel(id) ON DELETE SET NULL"))
            # Populate author_id
            conn.execute(text("""
                UPDATE blog_blogmodel b 
                SET author_id = u.id 
                FROM user_usermodel u 
                WHERE b."strAuthorUsername" = u.username OR (b."strAuthorUsername" = 'System' AND u.id = 1)
            """))
            # Drop strAuthorUsername
            conn.execute(text('ALTER TABLE blog_blogmodel DROP COLUMN "strAuthorUsername"'))
            print("Mapped authors and dropped strAuthorUsername")

        # 4. Clean up community columns in BlogModel
        res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogmodel' AND column_name='community_id'")).fetchone()
        if not res:
            # We already have objCommunity which can serve as community_id, let's just rename it and add FK
            conn.execute(text('ALTER TABLE blog_blogmodel RENAME COLUMN "objCommunity" TO community_id'))
            conn.execute(text("ALTER TABLE blog_blogmodel ADD CONSTRAINT fk_blog_community FOREIGN KEY (community_id) REFERENCES blog_communitymodel(id) ON DELETE SET NULL"))
            conn.execute(text('ALTER TABLE blog_blogmodel DROP COLUMN "strCommunityName"'))
            print("Renamed objCommunity to community_id and dropped strCommunityName")

        # 5. Clean up AI metric columns in BlogModel
        cols_to_drop = ['verifiable', 'logical_soundness', 'ai_summary']
        for col in cols_to_drop:
            res = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogmodel' AND column_name='{col}'")).fetchone()
            if res:
                conn.execute(text(f"ALTER TABLE blog_blogmodel DROP COLUMN {col}"))
        print("Dropped AI metric columns from blog_blogmodel")
        
    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
