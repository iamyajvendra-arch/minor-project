"""
Pydantic Schemas for CIVIC-सेवा API
Request/Response models with validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from app.models import UserRole, ComplaintStatus, ComplaintCategory, Priority


# ─────────────────────── Auth ───────────────────────

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    department_id: Optional[int] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None


# ─────────────────────── Complaints ───────────────────────

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10)
    category: ComplaintCategory
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    pincode: Optional[str] = None


class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    priority: Optional[Priority] = None
    department_id: Optional[int] = None
    note: Optional[str] = None


class ComplaintHistoryOut(BaseModel):
    id: int
    old_status: Optional[str] = None
    new_status: str
    note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_by: Optional[UserOut] = None

    class Config:
        from_attributes = True


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class DuplicateGroupOut(BaseModel):
    id: int
    complaint_count: int

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id: int
    complaint_id: str
    title: str
    description: str
    category: ComplaintCategory
    status: ComplaintStatus
    priority: Priority
    ai_category: Optional[ComplaintCategory] = None
    ai_confidence: Optional[float] = None
    severity_score: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    image_urls: Optional[List[str]] = []
    is_duplicate: bool = False
    is_demo: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    deadline: Optional[datetime] = None
    citizen: Optional[UserOut] = None
    department: Optional[DepartmentOut] = None
    history: Optional[List[ComplaintHistoryOut]] = []
    duplicate_group: Optional[DuplicateGroupOut] = None

    class Config:
        from_attributes = True


# ─────────────────────── Departments ───────────────────────

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


# ─────────────────────── Notifications ───────────────────────

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: Optional[datetime] = None
    complaint_id: Optional[int] = None

    class Config:
        from_attributes = True


# ─────────────────────── Feedback ───────────────────────

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class FeedbackOut(BaseModel):
    id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────────── AI ───────────────────────

class AICategorizationResult(BaseModel):
    predicted_category: str
    confidence: float
    suggested_department: str
    all_scores: dict


class SeverityResult(BaseModel):
    score: float
    priority: str
    factors: dict


class DuplicateCheckResult(BaseModel):
    is_duplicate: bool
    confidence: float
    similar_complaint_id: Optional[str] = None
    action: str  # auto_duplicate, manual_review, separate


# ─────────────────────── Analytics ───────────────────────

class AnalyticsOverview(BaseModel):
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    critical: int
    duplicate_groups: int
    avg_resolution_days: float
    escalated: int


class GeoBoundary(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None


# Fix forward reference
Token.model_rebuild()
