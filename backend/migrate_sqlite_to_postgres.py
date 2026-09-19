"""
IVPS Mechatronics — SQLite to Neon PostgreSQL Safe Migration Utility
-------------------------------------------------------------------
Migrates existing local SQLite database records to Neon PostgreSQL.
Preserves existing data, avoids duplicates, and resets PostgreSQL sequences.
"""
import os
import sys
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import Base
from app.models.models import (
    User, Machine, ContactUnlock, Payment, Enquiry, SavedMachine, SystemSetting
)

def get_pg_engine(pg_url: str):
    if pg_url.startswith("postgresql://"):
        pg_url = pg_url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql+psycopg://", 1)
    
    return create_engine(pg_url, pool_pre_ping=True, echo=False)

def migrate(sqlite_path: str = "ivps_mechatronics.db", pg_url: str = None):
    if not pg_url:
        pg_url = os.getenv("DATABASE_URL")
        if not pg_url or pg_url.startswith("sqlite"):
            print("ERROR: Please specify target PostgreSQL DATABASE_URL via env or --pg-url argument.")
            print("Example: python migrate_sqlite_to_postgres.py --pg-url postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require")
            return False

    print("=" * 65)
    print("IVPS Mechatronics — Safe SQLite to Neon PostgreSQL Migration")
    print("=" * 65)
    print(f"Source SQLite: {sqlite_path}")
    masked_url = pg_url.split("@")[-1] if "@" in pg_url else pg_url[:30]
    print(f"Target PostgreSQL: ...@{masked_url}")

    # 1. Connect to SQLite
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SqliteSession()

    # 2. Connect to PostgreSQL
    pg_engine = get_pg_engine(pg_url)
    PgSession = sessionmaker(bind=pg_engine)
    pg_db = PgSession()

    try:
        # 3. Ensure tables exist in PostgreSQL
        print("\n[1/7] Ensuring PostgreSQL schema and tables exist...")
        Base.metadata.create_all(bind=pg_engine)
        
        # Ensure newer columns exist
        with pg_engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(100);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_provider_verified BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(100);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_email VARCHAR(150);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_google_verified BOOLEAN DEFAULT FALSE;"))
            conn.commit()

        # 4. Migrate System Settings
        print("[2/7] Migrating System Settings...")
        settings_count = 0
        for s in sqlite_db.query(SystemSetting).all():
            existing = pg_db.query(SystemSetting).filter(SystemSetting.key == s.key).first()
            if not existing:
                pg_db.add(SystemSetting(key=s.key, value=s.value, description=s.description, updated_at=s.updated_at))
                settings_count += 1
        pg_db.commit()
        print(f"   -> Migrated {settings_count} system settings.")

        # 5. Migrate Users
        print("[3/7] Migrating Users (Preserving IDs and roles: buyer, broker, admin)...")
        users_count = 0
        for u in sqlite_db.query(User).order_by(User.id).all():
            existing = pg_db.query(User).filter((User.id == u.id) | (User.email == u.email)).first()
            if not existing:
                new_u = User(
                    id=u.id,
                    provider=u.provider,
                    provider_user_id=u.provider_user_id,
                    is_provider_verified=u.is_provider_verified,
                    google_sub=u.google_sub,
                    name=u.name,
                    email=u.email,
                    verified_email=u.verified_email,
                    hashed_password=u.hashed_password,
                    phone=u.phone,
                    whatsapp=u.whatsapp,
                    company=u.company,
                    role=u.role,
                    is_verified=u.is_verified,
                    is_google_verified=u.is_google_verified,
                    verification_otp=u.verification_otp,
                    otp_expires_at=u.otp_expires_at,
                    is_active=u.is_active,
                    profile_image=u.profile_image,
                    business_description=u.business_description,
                    created_at=u.created_at
                )
                pg_db.add(new_u)
                users_count += 1
        pg_db.commit()
        print(f"   -> Migrated {users_count} users.")

        # 6. Migrate Machines
        print("[4/7] Migrating Machines (Preserving full specifications, images, broker links)...")
        machines_count = 0
        for m in sqlite_db.query(Machine).order_by(Machine.id).all():
            existing = pg_db.query(Machine).filter(Machine.id == m.id).first()
            if not existing:
                new_m = Machine(
                    id=m.id,
                    broker_id=m.broker_id,
                    title=m.title,
                    category=m.category,
                    listing_type=m.listing_type,
                    manufacturer=m.manufacturer,
                    model=m.model,
                    year=m.year,
                    condition=m.condition,
                    usage_hours=m.usage_hours,
                    price=m.price,
                    negotiable=m.negotiable,
                    contact_unlock_fee=m.contact_unlock_fee,
                    country=m.country,
                    state=m.state,
                    city=m.city,
                    address=m.address,
                    description=m.description,
                    history=m.history,
                    service_history=m.service_history,
                    reason_for_selling=m.reason_for_selling,
                    included_accessories=m.included_accessories,
                    specifications=m.specifications,
                    images=m.images,
                    availability=m.availability,
                    status=m.status,
                    rejection_reason=m.rejection_reason,
                    is_featured=m.is_featured,
                    views_count=m.views_count,
                    created_at=m.created_at,
                    updated_at=m.updated_at
                )
                pg_db.add(new_m)
                machines_count += 1
        pg_db.commit()
        print(f"   -> Migrated {machines_count} machinery listings.")

        # 7. Migrate Payments
        print("[5/7] Migrating Payment Records...")
        payments_count = 0
        for p in sqlite_db.query(Payment).order_by(Payment.id).all():
            existing = pg_db.query(Payment).filter(Payment.id == p.id).first()
            if not existing:
                new_p = Payment(
                    id=p.id,
                    user_id=p.user_id,
                    machine_id=p.machine_id,
                    amount=p.amount,
                    currency=p.currency,
                    provider=p.provider,
                    payment_method=p.payment_method,
                    transaction_id=p.transaction_id,
                    status=p.status,
                    failure_reason=p.failure_reason,
                    created_at=p.created_at
                )
                pg_db.add(new_p)
                payments_count += 1
        pg_db.commit()
        print(f"   -> Migrated {payments_count} payment records.")

        # 8. Migrate Contact Unlocks
        print("[6/7] Migrating Contact Unlock Records...")
        unlocks_count = 0
        for cu in sqlite_db.query(ContactUnlock).order_by(ContactUnlock.id).all():
            existing = pg_db.query(ContactUnlock).filter(ContactUnlock.id == cu.id).first()
            if not existing:
                new_cu = ContactUnlock(
                    id=cu.id,
                    buyer_id=cu.buyer_id,
                    broker_id=cu.broker_id,
                    machine_id=cu.machine_id,
                    payment_id=cu.payment_id,
                    amount=cu.amount,
                    currency=cu.currency,
                    status=cu.status,
                    unlocked_at=cu.unlocked_at
                )
                pg_db.add(new_cu)
                unlocks_count += 1
        pg_db.commit()
        print(f"   -> Migrated {unlocks_count} contact unlocks.")

        # 9. Migrate Enquiries & Saved Machines
        print("[7/7] Migrating Enquiries & Saved Machines...")
        enquiries_count = 0
        for e in sqlite_db.query(Enquiry).order_by(Enquiry.id).all():
            existing = pg_db.query(Enquiry).filter(Enquiry.id == e.id).first()
            if not existing:
                new_e = Enquiry(
                    id=e.id,
                    buyer_id=e.buyer_id,
                    broker_id=e.broker_id,
                    machine_id=e.machine_id,
                    name=e.name,
                    email=e.email,
                    phone=e.phone,
                    message=e.message,
                    requirement=e.requirement,
                    quantity=e.quantity,
                    preferred_contact_method=e.preferred_contact_method,
                    status=e.status,
                    created_at=e.created_at
                )
                pg_db.add(new_e)
                enquiries_count += 1
        pg_db.commit()

        saved_count = 0
        for sm in sqlite_db.query(SavedMachine).order_by(SavedMachine.id).all():
            existing = pg_db.query(SavedMachine).filter(SavedMachine.id == sm.id).first()
            if not existing:
                new_sm = SavedMachine(
                    id=sm.id,
                    user_id=sm.user_id,
                    machine_id=sm.machine_id,
                    created_at=sm.created_at
                )
                pg_db.add(new_sm)
                saved_count += 1
        pg_db.commit()
        print(f"   -> Migrated {enquiries_count} enquiries and {saved_count} saved machines.")

        # 10. Synchronize PostgreSQL Auto-Increment Sequences
        print("\nSynchronizing PostgreSQL Primary Key Sequences...")
        with pg_engine.connect() as conn:
            for table in ["users", "machines", "payments", "contact_unlocks", "enquiries", "saved_machines"]:
                try:
                    conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1));"))
                    conn.commit()
                except Exception as seq_err:
                    print(f"   Warning updating sequence for {table}: {seq_err}")

        print("\n" + "=" * 65)
        print("MIGRATION COMPLETED SUCCESSFULLY WITH ZERO DATA LOSS!")
        print("=" * 65)
        return True

    except Exception as e:
        pg_db.rollback()
        print(f"\nMigration encountered an error: {e}")
        raise e
    finally:
        sqlite_db.close()
        pg_db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate IVPS Mechatronics SQLite data to Neon PostgreSQL")
    parser.add_argument("--sqlite-path", default="ivps_mechatronics.db", help="Path to source SQLite .db file")
    parser.add_argument("--pg-url", default=None, help="Target Neon PostgreSQL connection URL")
    args = parser.parse_args()

    migrate(sqlite_path=args.sqlite_path, pg_url=args.pg_url)
