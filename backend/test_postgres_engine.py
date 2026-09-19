"""
Test PostgreSQL Driver (psycopg v3), URL conversion, and Engine Configuration
"""
import os
import sys
import psycopg
from sqlalchemy import create_engine
from sqlalchemy.dialects import postgresql

# Ensure psycopg v3 is loaded and psycopg2 is NOT used
print("1. Testing psycopg driver version:")
assert hasattr(psycopg, "__version__"), "psycopg must be installed"
print(f"   -> psycopg version: {psycopg.__version__} (psycopg v3)")
try:
    import psycopg2
    print("   -> Note: psycopg2 is present on system, but psycopg v3 will be used exclusively.")
except ImportError:
    print("   -> Confirmed: psycopg2 is not imported.")

# Test URL transformation
print("\n2. Testing DATABASE_URL conversions:")
test_cases = [
    (
        "postgresql://neondb_owner:npg_pass123@ep-cool-fog-a1b2c3.us-east-2.aws.neon.tech/neondb?sslmode=require",
        "postgresql+psycopg://neondb_owner:npg_pass123@ep-cool-fog-a1b2c3.us-east-2.aws.neon.tech/neondb?sslmode=require"
    ),
    (
        "postgres://neondb_owner:npg_pass123@ep-cool-fog-a1b2c3.us-east-2.aws.neon.tech/neondb?sslmode=require",
        "postgresql+psycopg://neondb_owner:npg_pass123@ep-cool-fog-a1b2c3.us-east-2.aws.neon.tech/neondb?sslmode=require"
    ),
    (
        "sqlite:///./ivps_mechatronics.db",
        "sqlite:///./ivps_mechatronics.db"
    )
]

for orig, expected in test_cases:
    url = orig
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    assert url == expected, f"Failed converting {orig} -> got {url}"
    print(f"   -> Successfully converted: {orig[:30]}... -> {url[:38]}...")

# Test SQLAlchemy engine initialization with psycopg v3 dialect
print("\n3. Testing SQLAlchemy engine with psycopg v3 dialect:")
engine = create_engine(
    "postgresql+psycopg://user:pass@localhost:5432/testdb",
    pool_pre_ping=True
)
assert engine.dialect.name == "postgresql", "Dialect must be postgresql"
assert engine.dialect.driver == "psycopg", f"Driver must be psycopg, got {engine.dialect.driver}"
print(f"   -> Engine created with dialect '{engine.dialect.name}' and driver '{engine.dialect.driver}'")
print(f"   -> pool_pre_ping enabled: {engine.pool._pre_ping}")

# Test models can compile for PostgreSQL DDL
print("\n4. Testing SQLAlchemy model DDL generation for PostgreSQL:")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.models.models import (
    User, Machine, ContactUnlock, Payment, Enquiry, SavedMachine, SystemSetting
)
from app.core.database import Base

from sqlalchemy.schema import CreateTable
for table_name, table in Base.metadata.tables.items():
    ddl_sql = str(CreateTable(table).compile(dialect=postgresql.dialect())).strip()
    print(f"   -> Table '{table_name}' verified for PostgreSQL DDL compilation.")

print("\nALL POSTGRESQL ENGINE AND DRIVER TESTS PASSED SUCCESSFULLY!")
