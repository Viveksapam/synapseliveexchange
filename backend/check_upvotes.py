import sqlalchemy as sa
engine = sa.create_engine('postgresql://neondb_owner:npg_Gbimdncpv7H4@ep-old-mountain-aopmrcpu-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
with engine.connect() as conn:
    print(conn.execute(sa.text('SELECT id, "numUpvotes", comments_count FROM blog_blogmodel')).fetchall())
