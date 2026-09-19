from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings


# ============================================================
# DATABASE URL
# ============================================================

DATABASE_URL = settings.DATABASE_URL


# ============================================================
# PostgreSQL DRIVER
# ============================================================
# We installed psycopg[binary] (psycopg v3).
# SQLAlchemy may otherwise try to use psycopg2.
#
# So convert:
#   postgresql://
#
# into:
#   postgresql+psycopg://
# ============================================================

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+psycopg://",
        1
    )


# ============================================================
# CONNECTION SETTINGS
# ============================================================

connect_args = {}

# SQLite needs this for FastAPI
if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


# ============================================================
# SQLALCHEMY ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE SCHEMA CHECK
# ============================================================

def ensure_db_schema():
    """
    Ensures database table schemas have all required columns.
    - SQLite: Uses PRAGMA column inspection for local development.
    - PostgreSQL: Uses PostgreSQL-native 'ALTER TABLE ... ADD COLUMN IF NOT EXISTS'.
    Never executes SQLite PRAGMA statements against PostgreSQL.
    """
    if not DATABASE_URL.startswith("sqlite"):
        # PostgreSQL-safe migration (no PRAGMAs)
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50);"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(100);"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_provider_verified BOOLEAN DEFAULT FALSE;"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(100);"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_email VARCHAR(150);"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_google_verified BOOLEAN DEFAULT FALSE;"))
                conn.commit()
        except Exception:
            pass
        return

    try:
        with engine.connect() as conn:

            result = conn.execute(
                text("PRAGMA table_info(users)")
            )

            columns = [
                row[1]
                for row in result.fetchall()
            ]

            if columns:

                # Provider
                if "provider" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN provider VARCHAR(50)"
                        )
                    )

                # Provider user ID
                if "provider_user_id" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN provider_user_id VARCHAR(100)"
                        )
                    )

                # Provider verification
                if "is_provider_verified" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN is_provider_verified BOOLEAN DEFAULT 0"
                        )
                    )

                # Google subject
                if "google_sub" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN google_sub VARCHAR(100)"
                        )
                    )

                # Verified email
                if "verified_email" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN verified_email VARCHAR(150)"
                        )
                    )

                # Google verification
                if "is_google_verified" not in columns:
                    conn.execute(
                        text(
                            "ALTER TABLE users "
                            "ADD COLUMN is_google_verified BOOLEAN DEFAULT 0"
                        )
                    )

                conn.commit()

    except Exception:
        # Keep local SQLite startup tolerant.
        pass


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    """
    FastAPI database dependency.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()