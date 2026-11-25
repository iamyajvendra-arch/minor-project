"""Analytics router"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()


@router.get("/overview")
async def analytics_overview(
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Complaint)
    if state:
        q = q.filter(models.Complaint.state == state)

    total = q.count()
    pending = q.filter(models.Complaint.status.in_(["submitted", "pending"])).count()
    in_progress = q.filter(models.Complaint.status == "in_progress").count()
    resolved = q.filter(models.Complaint.status == "resolved").count()
    critical = q.filter(models.Complaint.priority == "critical").count()

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical": critical,
        "open": total - resolved,
    }


@router.get("/by-category")
async def by_category(
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(
        models.Complaint.category,
        func.count(models.Complaint.id).label("count")
    )
    if state:
        q = q.filter(models.Complaint.state == state)
    rows = q.group_by(models.Complaint.category).all()
    return [{"category": r.category.value if r.category else "unknown", "count": r.count} for r in rows]


@router.get("/by-status")
async def by_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.query(
        models.Complaint.status,
        func.count(models.Complaint.id).label("count")
    ).group_by(models.Complaint.status).all()
    return [{"status": r.status.value if r.status else "unknown", "count": r.count} for r in rows]


@router.get("/by-priority")
async def by_priority(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.query(
        models.Complaint.priority,
        func.count(models.Complaint.id).label("count")
    ).group_by(models.Complaint.priority).all()
    return [{"priority": r.priority.value if r.priority else "unknown", "count": r.count} for r in rows]


@router.get("/by-state")
async def by_state(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.query(
        models.Complaint.state,
        func.count(models.Complaint.id).label("count"),
        func.avg(models.Complaint.severity_score).label("avg_severity"),
    ).filter(
        models.Complaint.state.isnot(None)
    ).group_by(models.Complaint.state).all()
    return [
        {"state": r.state, "count": r.count, "avg_severity": round(r.avg_severity or 0, 1)}
        for r in rows
    ]


@router.get("/monthly-trend")
async def monthly_trend(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    start = datetime.now() - timedelta(days=months * 30)
    complaints = db.query(models.Complaint).filter(
        models.Complaint.created_at >= start
    ).all()

    monthly: dict = {}
    for c in complaints:
        if c.created_at:
            key = c.created_at.strftime("%Y-%m")
            if key not in monthly:
                monthly[key] = {"month": key, "total": 0, "resolved": 0}
            monthly[key]["total"] += 1
            if c.status == models.ComplaintStatus.resolved:
                monthly[key]["resolved"] += 1

    return sorted(monthly.values(), key=lambda x: x["month"])


@router.get("/department-performance")
async def department_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    depts = db.query(models.Department).all()
    result = []
    for d in depts:
        q = db.query(models.Complaint).filter(models.Complaint.department_id == d.id)
        total = q.count()
        resolved = q.filter(models.Complaint.status == "resolved").count()
        pending = q.filter(models.Complaint.status.in_(["submitted", "pending"])).count()
        result.append({
            "department": d.name,
            "code": d.code,
            "total": total,
            "resolved": resolved,
            "pending": pending,
            "resolution_rate": round(resolved / total * 100, 1) if total else 0,
        })
    return result


@router.get("/hotspot-prediction")
async def hotspot_prediction(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Simple rolling average trend analysis for hotspot prediction"""
    from sqlalchemy import text
    # Get areas with increasing complaint frequency
    complaints = db.query(
        models.Complaint.state,
        models.Complaint.city,
        models.Complaint.district,
        func.count(models.Complaint.id).label("count"),
        func.avg(models.Complaint.severity_score).label("avg_severity"),
    ).filter(
        models.Complaint.state.isnot(None),
        models.Complaint.status.in_(["submitted", "pending", "in_progress", "escalated"]),
    ).group_by(
        models.Complaint.state,
        models.Complaint.city,
        models.Complaint.district,
    ).having(func.count(models.Complaint.id) >= 2).all()

    hotspots = []
    for row in complaints:
        risk = min(100, (row.count * 8 + (row.avg_severity or 0) * 0.4))
        hotspots.append({
            "state": row.state,
            "district": row.district,
            "city": row.city,
            "unresolved_count": row.count,
            "avg_severity": round(row.avg_severity or 0, 1),
            "predicted_risk": round(risk, 1),
            "prediction_label": (
                "Critical Hotspot" if risk >= 80
                else "High Risk" if risk >= 60
                else "Moderate Risk"
            ),
        })
    return sorted(hotspots, key=lambda x: x["predicted_risk"], reverse=True)[:20]
