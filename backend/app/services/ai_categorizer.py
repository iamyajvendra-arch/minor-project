"""
AI Complaint Categorization Service
Uses TF-IDF + Logistic Regression for text classification
Falls back to keyword-based classification if sklearn is unavailable
"""
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    import numpy as np
    SKLEARN_AVAILABLE = True
except (ImportError, OSError):
    SKLEARN_AVAILABLE = False

# ─────────── Training Data ───────────
TRAINING_DATA = [
    # Road & Pothole
    ("pothole on main road near market", "road_pothole"),
    ("big hole in the road causing accidents", "road_pothole"),
    ("road is broken and damaged after rain", "road_pothole"),
    ("my car tyre damaged due to pothole", "road_pothole"),
    ("road repair needed urgently on highway", "road_pothole"),
    ("crack in road surface spreading fast", "road_pothole"),
    ("speed breaker broken dangerous", "road_pothole"),
    ("road divider damaged needs repair", "road_pothole"),
    ("footpath broken people falling", "road_pothole"),
    ("road flooding every monsoon due to bad repair", "road_pothole"),
    # Garbage & Sanitation
    ("garbage not collected for two weeks", "garbage_sanitation"),
    ("stray animals eating garbage on streets", "garbage_sanitation"),
    ("open dump near residential area smells bad", "garbage_sanitation"),
    ("no dustbin in public park area", "garbage_sanitation"),
    ("waste burning near our locality", "garbage_sanitation"),
    ("garbage truck not coming regularly", "garbage_sanitation"),
    ("plastic waste littered on road", "garbage_sanitation"),
    ("trash overflowing from bins", "garbage_sanitation"),
    ("illegal dumping near school", "garbage_sanitation"),
    ("sanitation workers not working properly", "garbage_sanitation"),
    # Water Supply
    ("no water supply since morning", "water_supply"),
    ("water pipeline broken leaking road", "water_supply"),
    ("dirty water coming from tap smells bad", "water_supply"),
    ("water supply irregular need help", "water_supply"),
    ("contaminated water making people sick", "water_supply"),
    ("water meter not working", "water_supply"),
    ("no water pressure in flat", "water_supply"),
    ("water supply cut suddenly", "water_supply"),
    ("borewell pump not working", "water_supply"),
    ("tanker water supply delayed", "water_supply"),
    # Drainage & Sewage
    ("drain overflowing into our house", "drainage_sewage"),
    ("sewage pipe broken on road", "drainage_sewage"),
    ("blocked drain causing flooding", "drainage_sewage"),
    ("foul smell from open drain", "drainage_sewage"),
    ("manhole cover missing dangerous", "drainage_sewage"),
    ("sewage water on road disease risk", "drainage_sewage"),
    ("storm drain clogged after heavy rain", "drainage_sewage"),
    ("sewer line collapsed need urgent repair", "drainage_sewage"),
    ("dirty water stagnating mosquitoes breeding", "drainage_sewage"),
    ("gutter overflow near hospital", "drainage_sewage"),
    # Electricity & Streetlight
    ("streetlight not working since many days", "electricity_streetlight"),
    ("power outage in our area frequent", "electricity_streetlight"),
    ("transformer damaged no electricity", "electricity_streetlight"),
    ("exposed electric wire dangerous near playground", "electricity_streetlight"),
    ("sparking wires on road creating hazard", "electricity_streetlight"),
    ("electricity fluctuation damaging appliances", "electricity_streetlight"),
    ("streetlight broken road dark unsafe", "electricity_streetlight"),
    ("electricity bill too high demand correction", "electricity_streetlight"),
    ("illegal electricity connection nearby", "electricity_streetlight"),
    ("low voltage problem entire area", "electricity_streetlight"),
    # Public Infrastructure
    ("park bench broken need replacement", "public_infrastructure"),
    ("public toilet not clean and broken", "public_infrastructure"),
    ("footpath encroached by shop", "public_infrastructure"),
    ("bridge in bad condition needs repair", "public_infrastructure"),
    ("public building dilapidated unsafe", "public_infrastructure"),
    ("bus stop damaged no shelter from rain", "public_infrastructure"),
    ("tree fallen on road blocking traffic", "public_infrastructure"),
    ("wall collapsed near school", "public_infrastructure"),
    ("public garden not maintained overgrown", "public_infrastructure"),
    ("stray dogs menace in area", "public_infrastructure"),
    # Other
    ("noise pollution from factory at night", "other"),
    ("illegal construction blocking road", "other"),
    ("encroachment on government land", "other"),
    ("air pollution from construction site", "other"),
    ("neighbour dispute about property", "other"),
]

CATEGORY_DEPT_MAP = {
    "road_pothole": "Road Maintenance",
    "garbage_sanitation": "Sanitation",
    "water_supply": "Water Supply",
    "drainage_sewage": "Drainage",
    "electricity_streetlight": "Electricity",
    "public_infrastructure": "Public Infrastructure",
    "other": "Administration",
}

# ─────────── Keyword-based fallback ───────────
KEYWORD_CATEGORIES = {
    "road_pothole": ["pothole", "road", "crack", "repair road", "broken road", "road damage", "speed breaker", "footpath broken"],
    "garbage_sanitation": ["garbage", "trash", "waste", "dump", "sanitation", "littered", "sweeping", "dustbin"],
    "water_supply": ["water", "pipe", "tap", "supply water", "borewell", "tanker", "drinking water", "pipeline"],
    "drainage_sewage": ["drain", "sewage", "overflow drain", "manhole", "sewer", "flooding drain", "blocked drain"],
    "electricity_streetlight": ["electricity", "streetlight", "light", "power", "electric", "voltage", "transformer", "outage"],
    "public_infrastructure": ["park", "bench", "toilet", "bridge", "tree fallen", "stray dog", "building", "bus stop"],
    "other": ["noise", "encroachment", "pollution", "construction illegal"],
}

def _keyword_categorize(text: str) -> tuple:
    text_lower = text.lower()
    scores = {}
    for cat, keywords in KEYWORD_CATEGORIES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[cat] = score / len(keywords)
    best = max(scores, key=scores.get)
    best_score = scores[best]
    if best_score == 0:
        best = "other"
        best_score = 0.4
    return best, min(best_score + 0.4, 0.9), scores


# Build and train sklearn pipeline if available
_pipeline = None
if SKLEARN_AVAILABLE:
    try:
        import numpy as np
        _texts = [t for t, _ in TRAINING_DATA]
        _labels = [l for _, l in TRAINING_DATA]
        _pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
            ("clf", LogisticRegression(max_iter=500, C=1.0, solver="lbfgs", multi_class="auto")),
        ])
        _pipeline.fit(_texts, _labels)
    except Exception:
        _pipeline = None
        SKLEARN_AVAILABLE = False


def categorize_complaint(title: str, description: str) -> dict:
    """Categorize complaint using TF-IDF + LR (or keyword fallback)"""
    text = f"{title} {description}"

    if _pipeline is not None and SKLEARN_AVAILABLE:
        try:
            import numpy as np
            proba = _pipeline.predict_proba([text])[0]
            classes = _pipeline.classes_
            top_idx = np.argmax(proba)
            predicted = classes[top_idx]
            confidence = float(proba[top_idx])
            all_scores = {cls: round(float(prob), 3) for cls, prob in zip(classes, proba)}
        except Exception:
            predicted, confidence, all_scores = _keyword_categorize(text)
    else:
        predicted, confidence, all_scores = _keyword_categorize(text)

    return {
        "predicted_category": predicted,
        "confidence": round(confidence, 3),
        "suggested_department": CATEGORY_DEPT_MAP.get(predicted, "Administration"),
        "all_scores": all_scores if isinstance(all_scores, dict) else {},
        "needs_review": confidence < 0.60,
        "method": "ml" if SKLEARN_AVAILABLE else "keyword",
    }
