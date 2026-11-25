"""AI Services router"""
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app import models
from app.services.ai_categorizer import categorize_complaint
from app.services.severity import calculate_severity
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class CategorizationRequest(BaseModel):
    title: str
    description: str


class SeverityRequest(BaseModel):
    category: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    manual_severity: Optional[int] = None
    manual_urgency: Optional[int] = None
    manual_population: Optional[int] = None


@router.post("/categorize")
async def ai_categorize(
    req: CategorizationRequest,
    current_user: models.User = Depends(get_current_user),
):
    result = categorize_complaint(req.title, req.description)
    return result


@router.post("/severity")
async def ai_severity(
    req: SeverityRequest,
    current_user: models.User = Depends(get_current_user),
):
    result = calculate_severity(
        category=req.category,
        description=req.description,
        latitude=req.latitude,
        longitude=req.longitude,
        manual_severity=req.manual_severity,
        manual_urgency=req.manual_urgency,
        manual_population=req.manual_population,
    )
    return result
