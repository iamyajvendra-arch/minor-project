@echo off
echo Starting CIVIC-सेवा Full-Stack Platform...
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Vite React Frontend on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo CIVIC-सेवा is starting up!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo =======================================================
