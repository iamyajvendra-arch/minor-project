"""Admin router"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app import models, schemas
from app.auth import get_current_admin

router = APIRouter()


@router.get("/overview")
async def admin_overview(
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    q = db.query(models.Complaint)
    if state:
        q = q.filter(models.Complaint.state == state)
    if district:
        q = q.filter(models.Complaint.district == district)
    if city:
        q = q.filter(models.Complaint.city == city)

    total = q.count()
    pending = q.filter(models.Complaint.status.in_(["submitted", "pending"])).count()
    in_progress = q.filter(models.Complaint.status == "in_progress").count()
    resolved = q.filter(models.Complaint.status == "resolved").count()
    critical = q.filter(models.Complaint.priority == "critical").count()
    escalated = q.filter(models.Complaint.status == "escalated").count()
    duplicate_groups = db.query(models.DuplicateGroup).count()

    # Average resolution time
    resolved_complaints = db.query(models.Complaint).filter(
        models.Complaint.resolved_at.isnot(None),
        models.Complaint.created_at.isnot(None),
    ).all()
    avg_days = 0.0
    if resolved_complaints:
        total_days = sum(
            (c.resolved_at - c.created_at).total_seconds() / 86400
            for c in resolved_complaints
            if c.resolved_at and c.created_at
        )
        avg_days = total_days / len(resolved_complaints)

    return {
        "total_complaints": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical": critical,
        "escalated": escalated,
        "duplicate_groups": duplicate_groups,
        "avg_resolution_days": round(avg_days, 1),
    }


@router.get("/complaints", response_model=list[schemas.ComplaintOut])
async def admin_complaints(
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
    _: models.User = Depends(get_current_admin),
):
    q = db.query(models.Complaint)
    if status:
        q = q.filter(models.Complaint.status == status)
    if category:
        q = q.filter(models.Complaint.category == category)
    if priority:
        q = q.filter(models.Complaint.priority == priority)
    if state:
        q = q.filter(models.Complaint.state == state)
    if district:
        q = q.filter(models.Complaint.district == district)
    if city:
        q = q.filter(models.Complaint.city == city)
    if search:
        q = q.filter(
            models.Complaint.title.ilike(f"%{search}%") |
            models.Complaint.complaint_id.ilike(f"%{search}%")
        )
    return q.order_by(models.Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/duplicate-groups")
async def duplicate_groups(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    groups = db.query(models.DuplicateGroup).all()
    result = []
    for g in groups:
        complaints = db.query(models.Complaint).filter(
            models.Complaint.duplicate_group_id == g.id
        ).all()
        result.append({
            "id": g.id,
            "complaint_count": g.complaint_count,
            "category": g.category.value if g.category else None,
            "location_lat": g.location_lat,
            "location_lng": g.location_lng,
            "created_at": g.created_at,
            "complaints": [
                {
                    "id": c.id,
                    "complaint_id": c.complaint_id,
                    "title": c.title,
                    "status": c.status.value,
                }
                for c in complaints
            ],
        })
    return result


@router.get("/risk-heatmap")
async def risk_heatmap(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    """Calculate risk scores by area"""
    complaints = db.query(
        models.Complaint.state,
        models.Complaint.city,
        models.Complaint.district,
        func.count(models.Complaint.id).label("count"),
        func.avg(models.Complaint.severity_score).label("avg_severity"),
    ).filter(
        models.Complaint.state.isnot(None)
    ).group_by(
        models.Complaint.state,
        models.Complaint.city,
        models.Complaint.district,
    ).all()

    result = []
    for row in complaints:
        count = row.count or 0
        avg_sev = row.avg_severity or 0
        # Risk = weighted score
        risk_score = min(100, (count * 5 + avg_sev * 0.5))
        result.append({
            "state": row.state,
            "district": row.district,
            "city": row.city,
            "complaint_count": count,
            "avg_severity": round(avg_sev, 1),
            "risk_score": round(risk_score, 1),
            "risk_level": (
                "critical" if risk_score >= 80
                else "high" if risk_score >= 60
                else "medium" if risk_score >= 40
                else "low"
            ),
        })
    return sorted(result, key=lambda x: x["risk_score"], reverse=True)


@router.get("/heatmap-points")
async def heatmap_points(
    db: Session = Depends(get_db),
):
    """Get complaint lat/lng with severity for Leaflet heatmap"""
    complaints = db.query(
        models.Complaint.latitude,
        models.Complaint.longitude,
        models.Complaint.severity_score,
    ).filter(
        models.Complaint.latitude.isnot(None),
        models.Complaint.longitude.isnot(None),
    ).all()
    return [
        {"lat": c.latitude, "lng": c.longitude, "intensity": (c.severity_score or 50) / 100}
        for c in complaints
    ]


@router.get("/escalated")
async def escalated_complaints(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    return db.query(models.Complaint).filter(
        models.Complaint.status == "escalated"
    ).order_by(models.Complaint.created_at.desc()).all()


@router.get("/citizens")
async def list_citizens(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    return db.query(models.User).filter(
        models.User.role == models.UserRole.citizen
    ).offset(skip).limit(limit).all()


@router.patch("/citizens/{user_id}/toggle")
async def toggle_citizen(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}
