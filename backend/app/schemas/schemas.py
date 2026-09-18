from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field

# ----------------- User & Authentication Schemas -----------------
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full Name entered by user")
    email: EmailStr
    phone: str = Field(..., min_length=8, description="Real mobile number")
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    role: Literal["buyer", "broker"] = "buyer" # ONLY buyer or broker allowed at registration
    company: Optional[str] = None
    business_description: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class ResendOtpRequest(BaseModel):
    email: EmailStr

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    company: Optional[str] = None
    business_description: Optional[str] = None
    profile_image: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    verified_email: Optional[str] = None
    provider: Optional[str] = None
    provider_user_id: Optional[str] = None
    is_provider_verified: bool = False
    google_sub: Optional[str] = None
    is_google_verified: bool = False
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    company: Optional[str] = None
    role: str # buyer, broker, admin
    is_verified: bool
    is_active: bool
    profile_image: Optional[str] = None
    business_description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OAuthAuthorizeResponse(BaseModel):
    authorization_url: str
    state: str
    provider: str

class OAuthCallbackRequest(BaseModel):
    provider: Literal["google", "yahoo"]
    code: str
    state: str
    role: Optional[str] = None

class OAuthCompleteRegistrationRequest(BaseModel):
    provider: Literal["google", "yahoo"]
    provider_user_id: str
    email: EmailStr
    name: str
    role: Literal["buyer", "broker"] # Admin is never allowed in public registration
    phone: Optional[str] = None
    company: Optional[str] = None
    business_description: Optional[str] = None
    profile_image: Optional[str] = None

class OAuthAuthResponse(BaseModel):
    success: bool = True
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None
    needs_role_selection: bool = False
    provider: Optional[str] = None
    provider_user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    message: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    code: Optional[str] = None
    role: Optional[str] = None # 'buyer' or 'broker'
    phone: Optional[str] = None
    company: Optional[str] = None

class GoogleCompleteRegistrationRequest(BaseModel):
    google_sub: str
    email: EmailStr
    name: str
    role: Literal["buyer", "broker"] # Admin is never allowed in public registration
    phone: Optional[str] = None
    company: Optional[str] = None
    business_description: Optional[str] = None
    profile_image: Optional[str] = None

class GoogleAuthResponse(BaseModel):
    success: bool = True
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None
    needs_role_selection: bool = False
    google_sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    message: Optional[str] = None


# ----------------- Unlocked Broker Contact Schema -----------------
class UnlockedBrokerContact(BaseModel):
    broker_id: int
    broker_name: str
    company: Optional[str] = None
    phone: str # Real mobile number
    whatsapp: Optional[str] = None
    email: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    is_verified: bool = False
    unlocked_at: Optional[datetime] = None


# ----------------- Machine Schemas -----------------
class MachineBase(BaseModel):
    title: str
    category: str
    listing_type: str # "new" or "second_hand"
    manufacturer: str
    model: str
    year: int
    condition: str = "Excellent"
    usage_hours: int = 0
    price: float # Price in INR (₹)
    negotiable: bool = False
    country: str = "India"
    state: str = "Maharashtra"
    city: str = "Pune"
    address: Optional[str] = None
    description: str
    history: Optional[str] = None
    service_history: Optional[str] = None
    reason_for_selling: Optional[str] = None
    included_accessories: Optional[str] = None
    availability: str = "In Stock"

class MachineCreate(MachineBase):
    contact_unlock_fee: Optional[float] = None # Custom fee for this machine (₹) or None for default
    specifications: Dict[str, Any] = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)

class MachineUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    listing_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    condition: Optional[str] = None
    usage_hours: Optional[int] = None
    price: Optional[float] = None
    negotiable: Optional[bool] = None
    contact_unlock_fee: Optional[float] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    history: Optional[str] = None
    service_history: Optional[str] = None
    reason_for_selling: Optional[str] = None
    included_accessories: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = None
    availability: Optional[str] = None
    status: Optional[str] = None

class MachineCard(BaseModel):
    id: int
    title: str
    category: str
    listing_type: str
    manufacturer: str
    model: str
    year: int
    condition: str
    usage_hours: int
    price: float
    negotiable: bool
    city: str
    state: str
    country: str
    primary_image: Optional[str] = None
    is_featured: bool
    status: str
    broker_id: int
    broker_name: str
    broker_company: Optional[str] = None
    broker_verified: bool = False
    contact_unlock_fee: float # Dynamic fee in ₹
    views_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class MachineDetailResponse(MachineBase):
    id: int
    broker_id: int
    broker_name: str
    broker_company: Optional[str] = None
    broker_verified: bool = False
    specifications: Dict[str, Any]
    images: List[str]
    status: str
    is_featured: bool
    views_count: int
    created_at: datetime
    updated_at: datetime
    
    # Contact Protection & Fee fields
    contact_unlock_fee: float # Machine-specific or Platform default (₹)
    currency: str = "INR"
    is_contact_unlocked: bool = False
    unlocked_contact: Optional[UnlockedBrokerContact] = None

    class Config:
        from_attributes = True


# ----------------- Payment & Contact Unlock Schemas -----------------
class ContactUnlockOrderRequest(BaseModel):
    machine_id: int
    payment_method: str = "upi" # upi, credit_card, netbanking

class PaymentInitiateResponse(BaseModel):
    payment_id: int
    transaction_id: str
    amount: float # Fee in ₹
    currency: str = "INR"
    status: str
    machine_id: int
    machine_title: str
    broker_name: str
    provider: str

class PaymentVerifyRequest(BaseModel):
    payment_id: int
    simulate_status: str = "success" # success, failed, cancelled

class PaymentResponse(BaseModel):
    id: int
    amount: float
    currency: str
    provider: str
    payment_method: str
    transaction_id: str
    status: str
    failure_reason: Optional[str] = None
    created_at: datetime
    machine_id: Optional[int] = None
    machine_title: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------- Admin Fee Control Schemas -----------------
class PlatformFeeUpdate(BaseModel):
    default_fee: float = Field(..., gt=0, description="Platform default unlock fee in INR (₹)")

class MachineFeeUpdate(BaseModel):
    contact_unlock_fee: Optional[float] = Field(None, description="Custom fee for machine in INR (₹), or null to use default")


# ----------------- Enquiry Schemas -----------------
class EnquiryCreate(BaseModel):
    machine_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    requirement: Optional[str] = None
    quantity: int = 1
    preferred_contact_method: str = "WhatsApp"

class EnquiryResponse(BaseModel):
    id: int
    buyer_id: int
    broker_id: int
    machine_id: int
    machine_title: Optional[str] = None
    machine_image: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    requirement: Optional[str] = None
    quantity: int
    preferred_contact_method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Wishlist Schemas -----------------
class WishlistToggleRequest(BaseModel):
    machine_id: int


# ----------------- Moderation Schemas -----------------
class ModerationAction(BaseModel):
    status: str # approved, rejected
    rejection_reason: Optional[str] = None

class FeatureToggle(BaseModel):
    is_featured: bool
