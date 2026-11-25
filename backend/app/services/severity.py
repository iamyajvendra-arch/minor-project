"""
Complaint Severity Scoring Service
CSS = 100 × (0.35S + 0.25U + 0.20L + 0.20P)
"""
import re
from typing import Optional

# Severity keywords
CRITICAL_WORDS = ["accident", "collapsed", "fire", "death", "flood", "explosion", "injury", "emergency", "dangerous", "hazard", "electric shock"]
HIGH_WORDS = ["urgent", "broken", "overflow", "leaking", "exposed wire", "manhole", "sparking", "contaminated"]
MEDIUM_WORDS = ["not working", "damaged", "blocked", "irregular", "smelly", "pothole"]
LOW_WORDS = ["request", "suggest", "clean", "paint", "minor", "small"]

CATEGORY_BASE_SEVERITY = {
    "road_pothole": 0.5,
    "garbage_sanitation": 0.45,
    "water_supply": 0.65,
    "drainage_sewage": 0.60,
    "electricity_streetlight": 0.70,
    "public_infrastructure": 0.50,
    "other": 0.35,
}


def _text_severity(text: str) -> float:
    """Score 0-1 based on keyword analysis"""
    text_lower = text.lower()
    if any(w in text_lower for w in CRITICAL_WORDS):
        return 0.95
    if any(w in text_lower for w in HIGH_WORDS):
        return 0.75
    if any(w in text_lower for w in MEDIUM_WORDS):
        return 0.55
    if any(w in text_lower for w in LOW_WORDS):
        return 0.30
    return 0.45


def calculate_severity(
    category: str,
    description: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    manual_severity: Optional[int] = None,
    manual_urgency: Optional[int] = None,
    manual_population: Optional[int] = None,
) -> dict:
    """
    CSS = 100 × (0.35S + 0.25U + 0.20L + 0.20P)
    S = Problem severity (0-1)
    U = Urgency (0-1)
    L = Location risk (0-1)
    P = Affected population (0-1)
    """
    # S – Problem severity
    if manual_severity is not None:
        S = max(0.0, min(1.0, manual_severity / 10.0))
    else:
        base = CATEGORY_BASE_SEVERITY.get(category, 0.4)
        text_s = _text_severity(description)
        S = (base + text_s) / 2

    # U – Urgency (from text)
    if manual_urgency is not None:
        U = max(0.0, min(1.0, manual_urgency / 10.0))
    else:
        text_lower = description.lower()
        if any(w in text_lower for w in ["urgent", "immediately", "emergency", "danger"]):
            U = 0.90
        elif any(w in text_lower for w in ["asap", "soon", "quick", "fast"]):
            U = 0.70
        else:
            U = 0.45

    # L – Location risk (defaults to 0.5 if no coords)
    L = 0.5
    if latitude is not None and longitude is not None:
        # Simple: more populated cities get higher L
        # Major metro coordinates approximate check
        metros = [
            (28.6, 77.2),   # Delhi
            (19.0, 72.8),   # Mumbai
            (12.9, 77.6),   # Bangalore
            (22.6, 88.4),   # Kolkata
            (13.1, 80.3),   # Chennai
            (17.4, 78.5),   # Hyderabad
            (23.0, 72.6),   # Ahmedabad
            (18.5, 73.9),   # Pune
        ]
        min_dist = min(
            ((latitude - m[0]) ** 2 + (longitude - m[1]) ** 2) ** 0.5
            for m in metros
        )
        # Closer to metro = higher location risk
        L = max(0.3, min(0.9, 0.9 - min_dist * 0.05))

    # P – Affected population
    if manual_population is not None:
        P = max(0.0, min(1.0, manual_population / 10.0))
    else:
        text_lower = description.lower()
        if any(w in text_lower for w in ["entire area", "whole colony", "everyone", "all residents"]):
            P = 0.85
        elif any(w in text_lower for w in ["many", "multiple", "several"]):
            P = 0.65
        elif any(w in text_lower for w in ["few", "some"]):
            P = 0.45
        else:
            P = 0.35

    # Final CSS
    css = 100 * (0.35 * S + 0.25 * U + 0.20 * L + 0.20 * P)
    css = max(0, min(100, css))

    if css >= 80:
        priority = "critical"
    elif css >= 60:
        priority = "high"
    elif css >= 40:
        priority = "medium"
    else:
        priority = "low"

    return {
        "score": round(css, 1),
        "priority": priority,
        "factors": {
            "severity": round(S, 2),
            "urgency": round(U, 2),
            "location_risk": round(L, 2),
            "population_impact": round(P, 2),
        },
    }
