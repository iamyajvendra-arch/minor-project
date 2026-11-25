"""
Complaints router - Core complaint management
"""
import os
import uuid
import shutil
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, get_current_citizen
from app.config import settings
from app.services.ai_categorizer import categorize_complaint
from app.services.severity import calculate_severity
from app.services.duplicate_detector import check_duplicate

router = APIRouter()

CATEGORY_DEPT_MAP = {
    "road_pothole": "ROAD",
    "garbage_sanitation": "SANIT",
    "water_supply": "WATER",
    "drainage_sewage": "DRAIN",
    "electricity_streetlight": "ELEC",
    "public_infrastructure": "INFRA",
    "other": "ADMIN",
}

PRIORITY_DEADLINES = {
    "critical": timedelta(hours=24),
    "high": timedelta(hours=48),
    "medium": timedelta(days=5),
    "low": timedelta(days=7),
}


def generate_complaint_id() -> str:
    return f"CS{datetime.now().strftime('%Y%m')}{str(uuid.uuid4().int)[:6].upper()}"


def assign_department(category: str, db: Session) -> Optional[models.Department]:
    dept_code = CATEGORY_DEPT_MAP.get(category, "ADMIN")
    return db.query(models.Department).filter(models.Department.code == dept_code).first()


@router.post("/", response_model=schemas.ComplaintOut)
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    ward: Optional[str] = Form(None),
    pincode: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # AI Categorization
    ai_result = categorize_complaint(title, description)
    
    # Severity scoring
    severity = calculate_severity(
        category=category,
        description=description,
        latitude=latitude,
        longitude=longitude,
    )

    # Map priority
    score = severity["score"]
    if score >= 80:
        priority = models.Priority.critical
    elif score >= 60:
        priority = models.Priority.high
    elif score >= 40:
        priority = models.Priority.medium
    else:
        priority = models.Priority.low

    # Set deadline
    deadline = datetime.now(timezone.utc) + PRIORITY_DEADLINES[priority.value]

    # Save images
    image_urls = []
    if images:
        for img in images:
            if img.filename and img.content_type and img.content_type.startswith("image/"):
                ext = img.filename.rsplit(".", 1)[-1] if "." in img.filename else "jpg"
                fname = f"{uuid.uuid4().hex}.{ext}"
                fpath = os.path.join(settings.UPLOAD_DIR, fname)
                with open(fpath, "wb") as f:
                    shutil.copyfileobj(img.file, f)
                image_urls.append(f"/uploads/{fname}")

    # Create complaint
    complaint = models.Complaint(
        complaint_id=generate_complaint_id(),
        title=title,
        description=description,
        category=models.ComplaintCategory(category),
        status=models.ComplaintStatus.submitted,
        priority=priority,
        ai_category=models.ComplaintCategory(ai_result["predicted_category"]),
        ai_confidence=ai_result["confidence"],
        severity_score=score,
        latitude=latitude,
        longitude=longitude,
        address=address,
        state=state,
        district=district,
        city=city,
        ward=ward,
        pincode=pincode,
        image_urls=image_urls,
        citizen_id=current_user.id,
        deadline=deadline,
    )

    # Assign department
    dept = assign_department(category, db)
    if dept:
        complaint.department_id = dept.id

    db.add(complaint)
    db.flush()  # get ID

    # Duplicate check
    all_complaints = db.query(models.Complaint).filter(
        models.Complaint.id != complaint.id,
        models.Complaint.category == complaint.category,
    ).all()

    dup_result = check_duplicate(complaint, all_complaints, db)
    if dup_result["is_duplicate"]:
        complaint.is_duplicate = dup_result["action"] == "auto_duplicate"
        if dup_result.get("group_id"):
            complaint.duplicate_group_id = dup_result["group_id"]
            group = db.query(models.DuplicateGroup).filter(
                models.DuplicateGroup.id == dup_result["group_id"]
            ).first()
            if group:
                group.complaint_count += 1

    db.commit()
    db.refresh(complaint)

    # Initial history entry
    history = models.ComplaintHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status=models.ComplaintStatus.submitted,
        note="Complaint submitted",
        updated_by_id=current_user.id,
    )
    db.add(history)

    # Notification for citizen
    notif = models.Notification(
        user_id=current_user.id,
        complaint_id=complaint.id,
        title="Complaint Submitted",
        message=f"Your complaint '{title}' has been submitted (ID: {complaint.complaint_id}). AI assigned it to: {ai_result['suggested_department']}.",
        notification_type="success",
    )
    db.add(notif)
    db.commit()
    db.refresh(complaint)

    return complaint


@router.get("/", response_model=list[schemas.ComplaintOut])
async def list_complaints(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Complaint)

    # Citizens see only their own
    if current_user.role == models.UserRole.citizen:
        query = query.filter(models.Complaint.citizen_id == current_user.id)
    elif current_user.role == models.UserRole.department:
        query = query.filter(models.Complaint.department_id == current_user.department_id)

    if status:
        query = query.filter(models.Complaint.status == status)
    if category:
        query = query.filter(models.Complaint.category == category)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
    if state:
        query = query.filter(models.Complaint.state == state)
    if district:
        query = query.filter(models.Complaint.district == district)
    if city:
        query = query.filter(models.Complaint.city == city)
    if search:
        query = query.filter(
            or_(
                models.Complaint.title.ilike(f"%{search}%"),
                models.Complaint.description.ilike(f"%{search}%"),
                models.Complaint.complaint_id.ilike(f"%{search}%"),
            )
        )

    return query.order_by(models.Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/map-data")
async def get_map_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 500,
    db: Session = Depends(get_db),
):
    """Get complaint locations for map visualization"""
    query = db.query(
        models.Complaint.id,
        models.Complaint.complaint_id,
        models.Complaint.title,
        models.Complaint.category,
        models.Complaint.priority,
        models.Complaint.status,
        models.Complaint.latitude,
        models.Complaint.longitude,
        models.Complaint.city,
        models.Complaint.state,
        models.Complaint.severity_score,
    ).filter(
        models.Complaint.latitude.isnot(None),
        models.Complaint.longitude.isnot(None),
    )

    if state:
        query = query.filter(models.Complaint.state == state)
    if district:
        query = query.filter(models.Complaint.district == district)
    if city:
        query = query.filter(models.Complaint.city == city)
    if category:
        query = query.filter(models.Complaint.category == category)
    if priority:
        query = query.filter(models.Complaint.priority == priority)

    complaints = query.limit(limit).all()
    return [
        {
            "id": c.id,
            "complaint_id": c.complaint_id,
            "title": c.title,
            "category": c.category.value if c.category else None,
            "priority": c.priority.value if c.priority else None,
            "status": c.status.value if c.status else None,
            "lat": c.latitude,
            "lng": c.longitude,
            "city": c.city,
            "state": c.state,
            "severity_score": c.severity_score,
        }
        for c in complaints
    ]


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
async def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Try numeric ID first, then complaint_id string
    complaint = None
    if complaint_id.isdigit():
        complaint = db.query(models.Complaint).filter(
            models.Complaint.id == int(complaint_id)
        ).first()
    if not complaint:
        complaint = db.query(models.Complaint).filter(
            models.Complaint.complaint_id == complaint_id
        ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Access control
    if (
        current_user.role == models.UserRole.citizen
        and complaint.citizen_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Access denied")
    if (
        current_user.role == models.UserRole.department
        and complaint.department_id != current_user.department_id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return complaint


@router.patch("/{complaint_id}", response_model=schemas.ComplaintOut)
async def update_complaint(
    complaint_id: str,
    update: schemas.ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    complaint = db.query(models.Complaint).filter(
        or_(
            models.Complaint.id == int(complaint_id) if complaint_id.isdigit() else False,
            models.Complaint.complaint_id == complaint_id,
        )
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if current_user.role == models.UserRole.citizen:
        raise HTTPException(status_code=403, detail="Citizens cannot update complaint status")

    old_status = complaint.status

    if update.status:
        complaint.status = update.status
        if update.status == models.ComplaintStatus.resolved:
            complaint.resolved_at = datetime.now(timezone.utc)
    if update.priority:
        complaint.priority = update.priority
    if update.department_id:
        complaint.department_id = update.department_id

    # History
    history = models.ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=update.status or complaint.status,
        note=update.note,
        updated_by_id=current_user.id,
    )
    db.add(history)

    # Notify citizen
    if update.status and complaint.citizen_id:
        notif = models.Notification(
            user_id=complaint.citizen_id,
            complaint_id=complaint.id,
            title="Complaint Status Updated",
            message=f"Your complaint {complaint.complaint_id} status changed to: {update.status.value.replace('_', ' ').title()}",
            notification_type="info",
        )
        db.add(notif)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/feedback", response_model=schemas.FeedbackOut)
async def add_feedback(
    complaint_id: str,
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    complaint = db.query(models.Complaint).filter(
        models.Complaint.complaint_id == complaint_id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    fb = models.Feedback(
        complaint_id=complaint.id,
        citizen_id=current_user.id,
        rating=feedback.rating,
        comment=feedback.comment,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
