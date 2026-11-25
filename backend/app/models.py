"""
Database Models for CIVIC-सेवा
Complete normalized database schema
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# ─────────────────────── Enums ───────────────────────

class UserRole(str, enum.Enum):
    citizen = "citizen"
    admin = "admin"
    department = "department"


class ComplaintStatus(str, enum.Enum):
    submitted = "submitted"
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"
    escalated = "escalated"


class ComplaintCategory(str, enum.Enum):
    road_pothole = "road_pothole"
    garbage_sanitation = "garbage_sanitation"
    water_supply = "water_supply"
    drainage_sewage = "drainage_sewage"
    electricity_streetlight = "electricity_streetlight"
    public_infrastructure = "public_infrastructure"
    other = "other"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# ─────────────────────── Users ───────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # State, district, city
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="citizen", foreign_keys="Complaint.citizen_id")
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("Feedback", back_populates="citizen")
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="staff")


# ─────────────────────── Departments ───────────────────────

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    email = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    complaints = relationship("Complaint", back_populates="department")
    staff = relationship("User", back_populates="department")


# ─────────────────────── India Geography ───────────────────────

class IndianState(Base):
    __tablename__ = "indian_states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    is_union_territory = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    districts = relationship("District", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state_id = Column(Integer, ForeignKey("indian_states.id"))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    state = relationship("IndianState", back_populates="districts")
    cities = relationship("City", back_populates="district")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"))
    city_type = Column(String(50), nullable=True)  # municipal_corp, municipality, nagar_panchayat, etc.
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    population = Column(Integer, nullable=True)

    district = relationship("District", back_populates="cities")
    wards = relationship("Ward", back_populates="city")


class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    ward_number = Column(String(20), nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    city = relationship("City", back_populates="wards")


# ─────────────────────── Complaints ───────────────────────

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(20), unique=True, index=True, nullable=False)

    # Basic info
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ComplaintCategory), nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.submitted)
    priority = Column(Enum(Priority), default=Priority.medium)

    # AI computed fields
    ai_category = Column(Enum(ComplaintCategory), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    severity_score = Column(Float, nullable=True)  # 0-100
    is_demo = Column(Boolean, default=False)

    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    ward = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)

    # Media
    image_urls = Column(JSON, default=list)

    # Relationships
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    citizen = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="complaints")

    # Duplicate tracking
    duplicate_group_id = Column(Integer, ForeignKey("duplicate_groups.id"), nullable=True)
    duplicate_group = relationship("DuplicateGroup", back_populates="complaints")
    is_duplicate = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="complaint", uselist=False)
    escalations = relationship("EscalationRecord", back_populates="complaint")
    notifications = relationship("Notification", back_populates="complaint")


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    old_status = Column(Enum(ComplaintStatus), nullable=True)
    new_status = Column(Enum(ComplaintStatus), nullable=False)
    note = Column(Text, nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="history")
    updated_by = relationship("User")


# ─────────────────────── Duplicate Groups ───────────────────────

class DuplicateGroup(Base):
    __tablename__ = "duplicate_groups"

    id = Column(Integer, primary_key=True, index=True)
    primary_complaint_id = Column(Integer, nullable=True)
    complaint_count = Column(Integer, default=1)
    category = Column(Enum(ComplaintCategory), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    radius_meters = Column(Float, default=500.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    complaints = relationship("Complaint", back_populates="duplicate_group")


# ─────────────────────── Feedback ───────────────────────

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="feedback")
    citizen = relationship("User", back_populates="feedback")


# ─────────────────────── Notifications ───────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="info")  # info, success, warning, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
    complaint = relationship("Complaint", back_populates="notifications")


# ─────────────────────── Escalation Records ───────────────────────

class EscalationRecord(Base):
    __tablename__ = "escalation_records"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    escalation_level = Column(Integer, default=1)
    reason = Column(Text, nullable=True)
    escalated_to = Column(String(200), nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    complaint = relationship("Complaint", back_populates="escalations")


# ─────────────────────── Audit Logs ───────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(200), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
