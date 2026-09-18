from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings


DATABASE_URL = settings.DATABASE_URL

connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def ensure_db_schema():
    """
    SQLite-only compatibility migration for older local databases.
    PostgreSQL schema should be created using SQLAlchemy metadata/migrations.
    """
    if not DATABASE_URL.startswith("sqlite"):
        return

    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in result.fetchall()]

            if cols:
                if "provider" not in cols:
                    conn.execute(
                        text("ALTER TABLE users ADD COLUMN provider VARCHAR(50)")
                    )

                if "provider_user_id" not in cols:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN provider_user_id VARCHAR(100)"
                        )
                    )

                if "is_provider_verified" not in cols:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN is_provider_verified BOOLEAN DEFAULT 0"
                        )
                    )

                if "google_sub" not in cols:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN google_sub VARCHAR(100)"
                        )
                    )

                if "verified_email" not in cols:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN verified_email VARCHAR(150)"
                        )
                    )

                if "is_google_verified" not in cols:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN is_google_verified BOOLEAN DEFAULT 0"
                        )
                    )

                conn.commit()

    except Exception:
        # Keep local startup tolerant of legacy SQLite databases.
        pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()