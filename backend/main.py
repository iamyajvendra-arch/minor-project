"""
CIVIC-सेवा Backend - Main Application Entry Point
AI-Powered Smart Civic Complaint and Grievance Management System
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import auth, complaints, users, admin, departments, analytics, ai_services, geo, notifications
from app.config import settings
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Seed database with demo data if empty
    seed_database()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title="CIVIC-सेवा API",
    description="AI-Powered Smart Civic Complaint and Grievance Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ai_services.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(geo.router, prefix="/api/geo", tags=["Geospatial"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
async def root():
    return {
        "message": "CIVIC-सेवा API",
        "version": "1.0.0",
        "tagline": "Smarter Complaints. Faster Solutions. Better Cities.",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "civic-seva-api"}
