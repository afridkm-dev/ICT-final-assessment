@echo off
title ExpenSync - Personal Expense Tracker Launcher
echo ======================================================================
echo           ExpenSync - MERN Stack Personal Expense Tracker
echo ======================================================================
echo.

set PATH=C:\Users\Intel\AppData\Local\Programs\nodejs;%PATH%

echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not recognized in PATH.
    pause
    exit /b 1
)
echo Node.js is available.
echo.

echo [2/3] Installing dependencies if needed...
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)
echo Dependencies verified.
echo.

echo [3/3] Starting Backend and Frontend Servers...
echo Starting Backend (Port 5000)...
start "ExpenSync Backend (Port 5000)" cmd /k "set PATH=C:\Users\Intel\AppData\Local\Programs\nodejs;%PATH% && cd backend && npm start"

echo Starting Frontend (Port 5173)...
start "ExpenSync Frontend (Port 5173)" cmd /k "set PATH=C:\Users\Intel\AppData\Local\Programs\nodejs;%PATH% && cd frontend && npm run dev"

echo.
echo ======================================================================
echo   Both services are booting!
echo   - Backend API: http://localhost:5000/api/expenses
echo   - Frontend UI:  http://localhost:5173
echo ======================================================================
echo You can minimize this window.
pause
