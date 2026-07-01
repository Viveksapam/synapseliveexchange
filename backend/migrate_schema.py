from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            # 1. Add parent_comment_id to blog_blogcommentmodel
            print("Adding parent_comment_id to blog_blogcommentmodel...")
            conn.execute(text("""
                ALTER TABLE blog_blogcommentmodel
                ADD COLUMN parent_comment_id INTEGER REFERENCES blog_blogcommentmodel(id) ON DELETE CASCADE
            """))
            conn.commit()
            print("✓ Added parent_comment_id")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("✓ parent_comment_id already exists")
            else:
                print(f"✗ Error adding parent_comment_id: {e}")

        try:
            # 2. Create blog_commentanalysismodel table
            print("Creating blog_commentanalysismodel table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS blog_commentanalysismodel (
                    comment_id INTEGER PRIMARY KEY REFERENCES blog_blogcommentmodel(id) ON DELETE CASCADE,
                    sentiment VARCHAR(50),
                    relevance_score FLOAT DEFAULT 0.5,
                    ai_summary TEXT
                )
            """))
            conn.commit()
            print("✓ Created blog_commentanalysismodel")
        except Exception as e:
            conn.rollback()
            print(f"✗ Error creating blog_commentanalysismodel: {e}")

        try:
            # 3. Create blog_blogcontextmodel table
            print("Creating blog_blogcontextmodel table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS blog_blogcontextmodel (
                    id SERIAL PRIMARY KEY,
                    blog_id INTEGER NOT NULL REFERENCES blog_blogmodel(id) ON DELETE CASCADE,
                    "strTitle" VARCHAR(255) NOT NULL,
                    "strDescription" TEXT,
                    "dtCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT blog_blogcontextmodel_blog_id_idx UNIQUE (blog_id, id)
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS blog_blogcontextmodel_blog_id_idx ON blog_blogcontextmodel(blog_id)"))
            conn.commit()
            print("✓ Created blog_blogcontextmodel")
        except Exception as e:
            conn.rollback()
            print(f"✗ Error creating blog_blogcontextmodel: {e}")

        try:
            # 4. Update blog_blogsourcemodel to link to context instead of blog
            print("Updating blog_blogsourcemodel to use context_id...")

            # Check if context_id already exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogsourcemodel' AND column_name='context_id'"))
            if result.fetchone():
                print("✓ context_id already exists")
            else:
                # First add the context_id column
                conn.execute(text("""
                    ALTER TABLE blog_blogsourcemodel
                    ADD COLUMN context_id INTEGER REFERENCES blog_blogcontextmodel(id) ON DELETE CASCADE
                """))

                # Migrate existing data: if blog_id exists, create contexts and link sources
                print("Migrating existing sources to contexts...")
                conn.execute(text("""
                    INSERT INTO blog_blogcontextmodel (blog_id, "strTitle")
                    SELECT DISTINCT blog_id, 'Default Context'
                    FROM blog_blogsourcemodel
                    WHERE blog_id IS NOT NULL
                    ON CONFLICT DO NOTHING
                """))

                # Link sources to their blog's context
                conn.execute(text("""
                    UPDATE blog_blogsourcemodel s
                    SET context_id = c.id
                    FROM blog_blogcontextmodel c
                    WHERE s.blog_id = c.blog_id
                    AND s.context_id IS NULL
                """))

                # Now drop the blog_id column
                conn.execute(text("""
                    ALTER TABLE blog_blogsourcemodel
                    DROP COLUMN blog_id
                """))

                print("✓ Updated blog_blogsourcemodel")
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"✗ Error updating blog_blogsourcemodel: {e}")

        try:
            # 5. Create blog_auditcollectionmodel table
            print("Creating blog_auditcollectionmodel table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS blog_auditcollectionmodel (
                    id SERIAL PRIMARY KEY,
                    blog_id INTEGER NOT NULL REFERENCES blog_blogmodel(id) ON DELETE CASCADE,
                    comment_ids TEXT,
                    source_ids TEXT,
                    context_ids TEXT,
                    collected_data TEXT,
                    llm_response TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    error_message TEXT,
                    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS blog_auditcollectionmodel_blog_id_idx ON blog_auditcollectionmodel(blog_id)"))
            conn.commit()
            print("✓ Created blog_auditcollectionmodel")
        except Exception as e:
            conn.rollback()
            print(f"✗ Error creating blog_auditcollectionmodel: {e}")

        try:
            # 6. Add index to parent_comment_id if not exists
            print("Creating index for parent_comment_id...")
            conn.execute(text("CREATE INDEX IF NOT EXISTS blog_blogcommentmodel_parent_comment_id_idx ON blog_blogcommentmodel(parent_comment_id)"))
            conn.commit()
            print("✓ Created parent_comment_id index")
        except Exception as e:
            conn.rollback()
            print(f"✗ Error creating index: {e}")

        try:
            # 7. Add strDescription and review_status to blog_blogsourcemodel
            print("Adding strDescription to blog_blogsourcemodel...")
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogsourcemodel' AND column_name='strDescription'"))
            if result.fetchone():
                print("✓ strDescription already exists")
            else:
                conn.execute(text("""
                    ALTER TABLE blog_blogsourcemodel
                    ADD COLUMN "strDescription" TEXT
                """))
                print("✓ Added strDescription")
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"✗ Error adding strDescription: {e}")

        try:
            print("Adding review_status to blog_blogsourcemodel...")
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogsourcemodel' AND column_name='review_status'"))
            if result.fetchone():
                print("✓ review_status already exists")
            else:
                conn.execute(text("""
                    ALTER TABLE blog_blogsourcemodel
                    ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                """))
                print("✓ Added review_status")
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"✗ Error adding review_status: {e}")

        try:
            # 8. Add approved_by to blog_blogsourcemodel ('moderator' or 'ai', null while pending)
            print("Adding approved_by to blog_blogsourcemodel...")
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='blog_blogsourcemodel' AND column_name='approved_by'"))
            if result.fetchone():
                print("✓ approved_by already exists")
            else:
                conn.execute(text("""
                    ALTER TABLE blog_blogsourcemodel
                    ADD COLUMN approved_by VARCHAR(20)
                """))
                print("✓ Added approved_by")
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"✗ Error adding approved_by: {e}")

        print("\n✅ Migration finished (see ✗ lines above for any steps that failed).")

if __name__ == "__main__":
    migrate()
