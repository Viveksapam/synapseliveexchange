from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    res = conn.execute(text('SELECT "strContent" FROM blog_blogmodel WHERE id=1002')).first()
    print(res[0])
