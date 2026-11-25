"""Departments router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_admin, get_current_user

router = APIRouter()


@router.get("/", response_model=list[schemas.DepartmentOut])
async def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).filter(models.Department.is_active == True).all()


@router.get("/{dept_id}/complaints", response_model=list[schemas.ComplaintOut])
async def dept_complaints(
    dept_id: int,
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if (
        current_user.role == models.UserRole.department
        and current_user.department_id != dept_id
    ):
        raise HTTPException(status_code=403, detail="Forbidden")

    q = db.query(models.Complaint).filter(models.Complaint.department_id == dept_id)
    if status:
        q = q.filter(models.Complaint.status == status)
    if priority:
        q = q.filter(models.Complaint.priority == priority)
    return q.order_by(models.Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{dept_id}/stats")
async def dept_stats(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Complaint).filter(models.Complaint.department_id == dept_id)
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
    }


@router.post("/", response_model=schemas.DepartmentOut)
async def create_department(
    dept: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin),
):
    existing = db.query(models.Department).filter(models.Department.code == dept.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")
    new_dept = models.Department(**dept.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept
