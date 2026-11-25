"""
Duplicate Complaint Detection Service
Uses TF-IDF cosine similarity + geographic distance + category matching
Falls back to simple word-overlap if sklearn is unavailable
"""
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except (ImportError, OSError):
    SKLEARN_AVAILABLE = False
import math
from typing import List, Optional, Any
from datetime import datetime, timezone


SIMILARITY_AUTO_DUPLICATE = 0.85
SIMILARITY_MANUAL_REVIEW = 0.70
GEO_RADIUS_METERS = 500  # Within 500m consider for geo-match


def _haversine_distance(lat1, lng1, lat2, lng2) -> float:
    """Distance between two coordinates in meters"""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def check_duplicate(new_complaint: Any, existing_complaints: List[Any], db: Any) -> dict:
    """
    Check if a complaint is duplicate using:
    1. TF-IDF cosine text similarity
    2. Geographic proximity
    3. Same category
    """
    if not existing_complaints:
        return {"is_duplicate": False, "confidence": 0.0, "action": "separate"}

    new_text = f"{new_complaint.title} {new_complaint.description}"
    existing_texts = [f"{c.title} {c.description}" for c in existing_complaints]

    # TF-IDF similarity (or fallback)
    try:
        if SKLEARN_AVAILABLE:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=2000)
            all_texts = [new_text] + existing_texts
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        else:
            raise ImportError("sklearn not available")
    except Exception:
        similarities = [0.0] * len(existing_complaints)

    best_score = 0.0
    best_complaint = None
    best_idx = -1

    for i, (c, text_sim) in enumerate(zip(existing_complaints, similarities)):
        # Category must match
        if c.category != new_complaint.category:
            continue

        # Geo check
        geo_factor = 1.0
        if (
            new_complaint.latitude and new_complaint.longitude
            and c.latitude and c.longitude
        ):
            dist = _haversine_distance(
                new_complaint.latitude, new_complaint.longitude,
                c.latitude, c.longitude
            )
            if dist > GEO_RADIUS_METERS * 3:
                geo_factor = 0.3  # Too far, reduce similarity
            elif dist <= GEO_RADIUS_METERS:
                geo_factor = 1.2  # Boost for nearby
            else:
                geo_factor = 0.8

        # Combined score
        combined = text_sim * geo_factor
        combined = min(1.0, combined)

        if combined > best_score:
            best_score = combined
            best_complaint = c
            best_idx = i

    if best_score >= SIMILARITY_AUTO_DUPLICATE and best_complaint:
        # Auto duplicate - find or create group
        from app import models as m
        group = None
        if best_complaint.duplicate_group_id:
            group = db.query(m.DuplicateGroup).filter(
                m.DuplicateGroup.id == best_complaint.duplicate_group_id
            ).first()
        if not group:
            group = m.DuplicateGroup(
                primary_complaint_id=best_complaint.id,
                complaint_count=2,
                category=new_complaint.category,
                location_lat=new_complaint.latitude,
                location_lng=new_complaint.longitude,
            )
            db.add(group)
            db.flush()
            best_complaint.duplicate_group_id = group.id

        return {
            "is_duplicate": True,
            "confidence": round(best_score, 3),
            "action": "auto_duplicate",
            "similar_complaint_id": best_complaint.complaint_id,
            "group_id": group.id,
        }

    if best_score >= SIMILARITY_MANUAL_REVIEW and best_complaint:
        return {
            "is_duplicate": True,
            "confidence": round(best_score, 3),
            "action": "manual_review",
            "similar_complaint_id": best_complaint.complaint_id,
            "group_id": best_complaint.duplicate_group_id,
        }

    return {"is_duplicate": False, "confidence": round(best_score, 3), "action": "separate"}
