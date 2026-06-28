from database import engine
from sqlalchemy import text

def run_migration():
    with engine.begin() as conn:
        conn.execute(text("UPDATE blog_blogmodel SET \"strMediaUrl\" = '/golden_retriever_banner.jpg' WHERE id = 1005"))
        conn.execute(text("DELETE FROM blog_blogmodel WHERE id = 1006"))
        print("Data fixed.")

if __name__ == "__main__":
    run_migration()
