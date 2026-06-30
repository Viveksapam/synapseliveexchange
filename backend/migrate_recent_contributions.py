from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            # Create blog_recentcontributionmodel table
            print("Creating blog_recentcontributionmodel table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS blog_recentcontributionmodel (
                    id SERIAL PRIMARY KEY,
                    featured_blog_id INTEGER NOT NULL UNIQUE REFERENCES blog_featuredblogmodel(blog_id) ON DELETE CASCADE,
                    position INTEGER NOT NULL UNIQUE,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    added_by_id BIGINT REFERENCES user_usermodel(id) ON DELETE SET NULL
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS blog_recentcontributionmodel_position_idx ON blog_recentcontributionmodel(position)"))
            print("✓ Created blog_recentcontributionmodel")
        except Exception as e:
            print(f"✗ Error creating table: {e}")

        conn.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
