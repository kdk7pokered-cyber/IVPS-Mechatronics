import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base, ensure_db_schema
from app.seed_data import seed
from app.routers import (
    auth, machines, contact_unlock, payments, enquiries, wishlist, admin, dashboard
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    ensure_db_schema()
    # Auto-seed initial data
    try:
        seed()
    except Exception as e:
        print(f"Auto-seed notification: {e}")
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production B2B Industrial Machinery Marketplace API for IVPS Mechatronics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers under API V1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(machines.router, prefix=settings.API_V1_STR)
app.include_router(contact_unlock.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(enquiries.router, prefix=settings.API_V1_STR)
app.include_router(wishlist.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "IVPS Mechatronics Platform API",
        "version": "1.0.0"
    }

# Frontend static build serving (Single production server capability)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "brand": "IVPS Mechatronics",
            "message": "Welcome to IVPS Mechatronics B2B Heavy Machinery Marketplace API",
            "docs": "/docs"
        }
