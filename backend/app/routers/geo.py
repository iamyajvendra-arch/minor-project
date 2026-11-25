"""Geospatial router"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models

router = APIRouter()

# India's complete state data
INDIA_STATES = [
    {"name": "Andhra Pradesh", "code": "AP", "lat": 15.9129, "lng": 79.7400},
    {"name": "Arunachal Pradesh", "code": "AR", "lat": 28.2180, "lng": 94.7278},
    {"name": "Assam", "code": "AS", "lat": 26.2006, "lng": 92.9376},
    {"name": "Bihar", "code": "BR", "lat": 25.0961, "lng": 85.3131},
    {"name": "Chhattisgarh", "code": "CG", "lat": 21.2787, "lng": 81.8661},
    {"name": "Goa", "code": "GA", "lat": 15.2993, "lng": 74.1240},
    {"name": "Gujarat", "code": "GJ", "lat": 22.2587, "lng": 71.1924},
    {"name": "Haryana", "code": "HR", "lat": 29.0588, "lng": 76.0856},
    {"name": "Himachal Pradesh", "code": "HP", "lat": 31.1048, "lng": 77.1734},
    {"name": "Jharkhand", "code": "JH", "lat": 23.6102, "lng": 85.2799},
    {"name": "Karnataka", "code": "KA", "lat": 15.3173, "lng": 75.7139},
    {"name": "Kerala", "code": "KL", "lat": 10.8505, "lng": 76.2711},
    {"name": "Madhya Pradesh", "code": "MP", "lat": 22.9734, "lng": 78.6569},
    {"name": "Maharashtra", "code": "MH", "lat": 19.7515, "lng": 75.7139},
    {"name": "Manipur", "code": "MN", "lat": 24.6637, "lng": 93.9063},
    {"name": "Meghalaya", "code": "ML", "lat": 25.4670, "lng": 91.3662},
    {"name": "Mizoram", "code": "MZ", "lat": 23.1645, "lng": 92.9376},
    {"name": "Nagaland", "code": "NL", "lat": 26.1584, "lng": 94.5624},
    {"name": "Odisha", "code": "OD", "lat": 20.9517, "lng": 85.0985},
    {"name": "Punjab", "code": "PB", "lat": 31.1471, "lng": 75.3412},
    {"name": "Rajasthan", "code": "RJ", "lat": 27.0238, "lng": 74.2179},
    {"name": "Sikkim", "code": "SK", "lat": 27.5330, "lng": 88.5122},
    {"name": "Tamil Nadu", "code": "TN", "lat": 11.1271, "lng": 78.6569},
    {"name": "Telangana", "code": "TS", "lat": 18.1124, "lng": 79.0193},
    {"name": "Tripura", "code": "TR", "lat": 23.9408, "lng": 91.9882},
    {"name": "Uttar Pradesh", "code": "UP", "lat": 26.8467, "lng": 80.9462},
    {"name": "Uttarakhand", "code": "UK", "lat": 30.0668, "lng": 79.0193},
    {"name": "West Bengal", "code": "WB", "lat": 22.9868, "lng": 87.8550},
    # Union Territories
    {"name": "Andaman and Nicobar Islands", "code": "AN", "lat": 11.7401, "lng": 92.6586, "is_ut": True},
    {"name": "Chandigarh", "code": "CH", "lat": 30.7333, "lng": 76.7794, "is_ut": True},
    {"name": "Dadra and Nagar Haveli and Daman and Diu", "code": "DN", "lat": 20.1809, "lng": 73.0169, "is_ut": True},
    {"name": "Delhi", "code": "DL", "lat": 28.7041, "lng": 77.1025, "is_ut": True},
    {"name": "Jammu and Kashmir", "code": "JK", "lat": 33.7782, "lng": 76.5762, "is_ut": True},
    {"name": "Ladakh", "code": "LA", "lat": 34.1526, "lng": 77.5771, "is_ut": True},
    {"name": "Lakshadweep", "code": "LD", "lat": 10.5667, "lng": 72.6417, "is_ut": True},
    {"name": "Puducherry", "code": "PY", "lat": 11.9416, "lng": 79.8083, "is_ut": True},
]


@router.get("/states")
async def get_states():
    return INDIA_STATES


@router.get("/districts")
async def get_districts(state: str = Query(...), db: Session = Depends(get_db)):
    state_obj = db.query(models.IndianState).filter(
        models.IndianState.name == state
    ).first()
    if not state_obj:
        return []
    return [
        {"id": d.id, "name": d.name, "lat": d.latitude, "lng": d.longitude}
        for d in state_obj.districts
    ]


@router.get("/cities")
async def get_cities(district: str = Query(...), db: Session = Depends(get_db)):
    district_obj = db.query(models.District).filter(
        models.District.name == district
    ).first()
    if not district_obj:
        return []
    return [
        {"id": c.id, "name": c.name, "type": c.city_type, "lat": c.latitude, "lng": c.longitude}
        for c in district_obj.cities
    ]


@router.get("/search")
async def search_locations(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """Search cities and districts"""
    cities = db.query(models.City).filter(
        models.City.name.ilike(f"%{q}%")
    ).limit(10).all()
    districts = db.query(models.District).filter(
        models.District.name.ilike(f"%{q}%")
    ).limit(5).all()
    results = []
    for c in cities:
        district = c.district
        state = district.state if district else None
        results.append({
            "type": "city",
            "name": c.name,
            "district": district.name if district else None,
            "state": state.name if state else None,
            "lat": c.latitude,
            "lng": c.longitude,
        })
    for d in districts:
        state = d.state
        results.append({
            "type": "district",
            "name": d.name,
            "state": state.name if state else None,
            "lat": d.latitude,
            "lng": d.longitude,
        })
    return results
