from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=True) # "google", "yahoo", or None
    provider_user_id = Column(String(100), index=True, nullable=True) # Provider unique user ID (sub)
    is_provider_verified = Column(Boolean, default=False) # True if verified by Google or Yahoo
    google_sub = Column(String(100), unique=True, index=True, nullable=True) # Google OAuth permanent sub identifier (backwards-compatibility)
    name = Column(String(120), nullable=False) # Full Name
    email = Column(String(150), unique=True, index=True, nullable=False)
    verified_email = Column(String(150), nullable=True) # Authenticated provider verified email
    hashed_password = Column(String(255), nullable=True) # Nullable for OAuth users
    phone = Column(String(50), nullable=True) # Real mobile number
    whatsapp = Column(String(50), nullable=True)
    company = Column(String(150), nullable=True) # Optional company name
    role = Column(String(30), default="buyer", nullable=False) # ONLY: buyer, broker, admin
    is_verified = Column(Boolean, default=False) # True if verified via OAuth or OTP
    is_google_verified = Column(Boolean, default=False) # True if authenticated via Google
    verification_otp = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    profile_image = Column(String(255), nullable=True)
    business_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    machines = relationship("Machine", back_populates="broker", foreign_keys="Machine.broker_id")
    payments = relationship("Payment", back_populates="user")
    enquiries_sent = relationship("Enquiry", back_populates="buyer", foreign_keys="Enquiry.buyer_id")
    enquiries_received = relationship("Enquiry", back_populates="broker", foreign_keys="Enquiry.broker_id")
    contact_unlocks = relationship("ContactUnlock", back_populates="buyer", foreign_keys="ContactUnlock.buyer_id")
    saved_machines = relationship("SavedMachine", back_populates="user", cascade="all, delete-orphan")


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    broker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    listing_type = Column(String(30), nullable=False, index=True) # "new" or "second_hand"
    manufacturer = Column(String(100), nullable=False, index=True)
    model = Column(String(100), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    condition = Column(String(50), nullable=False, default="Excellent") # Excellent, Very Good, Good, Fair, Needs Maintenance, Brand New
    usage_hours = Column(Integer, default=0) # 0 for new
    price = Column(Float, nullable=False, index=True) # Price in INR (₹)
    negotiable = Column(Boolean, default=False)
    
    # Custom Contact Unlock Fee for this specific machine (if None, platform default fee applies)
    contact_unlock_fee = Column(Float, nullable=True)
    
    # Location
    country = Column(String(100), default="India")
    state = Column(String(100), default="Maharashtra")
    city = Column(String(100), default="Pune")
    address = Column(String(255), nullable=True)
    
    # Description & biography
    description = Column(Text, nullable=False)
    history = Column(Text, nullable=True)
    service_history = Column(Text, nullable=True)
    reason_for_selling = Column(Text, nullable=True)
    included_accessories = Column(Text, nullable=True)

    # Structured & Dynamic Specs (stored as JSON string)
    specifications = Column(Text, default="{}")
    
    # Image URLs (stored as JSON array string)
    images = Column(Text, default="[]") 
    
    availability = Column(String(50), default="In Stock")
    status = Column(String(50), default="approved", index=True) # draft, pending_approval, approved, rejected, sold, expired
    rejection_reason = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False, index=True)
    views_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    broker = relationship("User", back_populates="machines", foreign_keys=[broker_id])
    unlocks = relationship("ContactUnlock", back_populates="machine", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="machine", cascade="all, delete-orphan")
    saved_by = relationship("SavedMachine", back_populates="machine", cascade="all, delete-orphan")


class ContactUnlock(Base):
    __tablename__ = "contact_unlocks"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    broker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    amount = Column(Float, nullable=False) # Fee paid in INR
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="active") # active, revoked
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    buyer = relationship("User", back_populates="contact_unlocks", foreign_keys=[buyer_id])
    machine = relationship("Machine", back_populates="unlocks")
    payment = relationship("Payment")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    provider = Column(String(50), default="simulated")
    payment_method = Column(String(50), default="upi") # upi, credit_card, netbanking
    transaction_id = Column(String(120), unique=True, index=True)
    status = Column(String(30), default="pending", index=True) # pending, success, failed, cancelled
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="payments")


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    broker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    requirement = Column(String(200), nullable=True)
    quantity = Column(Integer, default=1)
    preferred_contact_method = Column(String(50), default="WhatsApp")
    status = Column(String(30), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    buyer = relationship("User", back_populates="enquiries_sent", foreign_keys=[buyer_id])
    broker = relationship("User", back_populates="enquiries_received", foreign_keys=[broker_id])
    machine = relationship("Machine", back_populates="enquiries")


class SavedMachine(Base):
    __tablename__ = "saved_machines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_machines")
    machine = relationship("Machine", back_populates="saved_by")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
