from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Handle SQLite connect_args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_db_schema():
    """Ensure newly introduced OAuth columns (Google & Yahoo) exist in SQLite without losing data."""
    try:
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
            if cols:
                if "provider" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR(50)"))
                if "provider_user_id" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN provider_user_id VARCHAR(100)"))
                if "is_provider_verified" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_provider_verified BOOLEAN DEFAULT 0"))
                if "google_sub" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_sub VARCHAR(100)"))
                if "verified_email" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verified_email VARCHAR(150)"))
                if "is_google_verified" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_google_verified BOOLEAN DEFAULT 0"))
                conn.commit()
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
