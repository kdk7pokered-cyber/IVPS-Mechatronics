import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "IVPS Mechatronics"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ivps_mechatronics_industrial_super_secure_key_2026_x893")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite default out-of-the-box, fully switchable to PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ivps_mechatronics.db")
    
    # Default Platform Contact Unlock Fee in Indian Rupees (₹)
    DEFAULT_CONTACT_UNLOCK_FEE: float = float(os.getenv("DEFAULT_CONTACT_UNLOCK_FEE", "99.00"))
    CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    
    # OTP Expiration in minutes
    OTP_EXPIRE_MINUTES: int = 15
    
    # Google OAuth 2.0 / OpenID Connect Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")
    GOOGLE_AUTH_URL: str = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL: str = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL: str = "https://openidconnect.googleapis.com/v1/userinfo"
    
    # Yahoo OAuth 2.0 / OpenID Connect Configuration
    YAHOO_CLIENT_ID: str = os.getenv("YAHOO_CLIENT_ID", "")
    YAHOO_CLIENT_SECRET: str = os.getenv("YAHOO_CLIENT_SECRET", "")
    YAHOO_REDIRECT_URI: str = os.getenv("YAHOO_REDIRECT_URI", "http://localhost:8000/auth/callback")
    YAHOO_AUTH_URL: str = "https://api.login.yahoo.com/oauth2/request_auth"
    YAHOO_TOKEN_URL: str = "https://api.login.yahoo.com/oauth2/get_token"
    YAHOO_USERINFO_URL: str = "https://api.login.yahoo.com/openid/v1/userinfo"

    # Frontend base URL for redirect callbacks
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8000")
    
    # Uploads directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

settings = Settings()
