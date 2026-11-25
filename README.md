# CIVIC-सेवा

> **AI-Powered Smart Civic Complaint and Grievance Management System Using Geospatial Analytics**
> *Smarter Complaints. Faster Solutions. Better Cities.*

---

## 🇮🇳 Project Overview

CIVIC-सेवा is a full-stack, India-wide civic grievance and municipal operations platform. It enables citizens across all 28 Indian States and 8 Union Territories to report infrastructure defects, track real-time resolution timelines, and empowers municipal administrators and department engineers with AI categorization, severity scoring, duplicate detection, and geospatial risk heatmaps.

### Key Highlights
- **Human-Centric Visual Design**: Recreated faithfully with a warm off-white surface (`#FAF8F8`), crisp white cards (`#FFFFFF`), selective hot-pink brand accents (`#EC1478`), soft pink tints (`#FCE7F0`), and clear typography.
- **Interactive OpenStreetMap Integration**: Real Leaflet maps powered by public OSM tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). **Zero paid API keys required**.
- **AI Categorization & Department Auto-Routing**: Natural Language processing classifier matching grievances to responsible municipal departments.
- **Civic Severity Scoring (CSS Formula)**: `CSS = 100 × (0.35S + 0.25U + 0.20L + 0.20P)`.
- **Geospatial & TF-IDF Duplicate Detection**: Clusters overlapping citizen complaints within 500m to eliminate redundant dispatch.
- **SLA Deadline Auto-Escalations**: Automatic escalation tracking for overdue complaints (24h Critical, 48h High).
- **Haptic Vibration Feedback**: Integrated with modern browser Vibration API.

---

## 🏗️ Technology Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet, React-Leaflet, Recharts, Lucide Icons, React Router |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2, Uvicorn, Passlib (Bcrypt), Python-JOSE (JWT) |
| **Database** | SQLite (Default, immediate zero-config Windows execution), MySQL (configurable via `.env`) |
| **AI/ML Engine** | Scikit-learn, TF-IDF Text Vectorization, Logistic Regression, Cosine Proximity Similarity |
| **Geospatial** | Leaflet, OpenStreetMap, India States/Districts Administrative Hierarchy |

---

## 🚀 Quick Start on Windows

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (v20+ recommended)

### 2. Backend Setup
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The database automatically creates tables and seeds 50+ India-wide demo grievances on startup.*

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@civicseva.in` | `Admin@123` |
| **Citizen** | `priya@example.com` | `Citizen@123` |
| **Road Department** | `road@civicseva.in` | `Dept@123` |
| **Sanitation Dept** | `sanitation@civicseva.in` | `Dept@123` |
