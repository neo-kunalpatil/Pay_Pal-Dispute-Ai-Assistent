from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

connect_args = {}
pool_kwargs = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Neon PostgreSQL connection pooling optimizations
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_timeout": 30,
    }

engine = create_engine(
    settings.DATABASE_URL,
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

