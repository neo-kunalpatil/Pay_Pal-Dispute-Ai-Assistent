from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Clean channel_binding parameter for reliable psycopg driver negotiation
if "channel_binding=" in db_url:
    import re
    db_url = re.sub(r'[&?]channel_binding=[^&]*', '', db_url)
    if '?' not in db_url and '&' in db_url:
        db_url = db_url.replace('&', '?', 1)

connect_args = {}
pool_kwargs = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Neon PostgreSQL connection pooling optimizations
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_timeout": 30,
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,
    **pool_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

