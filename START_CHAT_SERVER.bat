@echo off
echo ===================================================
echo   STARTING INDOMARKET CHAT SERVER
echo ===================================================
echo.
cd server

if not exist "node_modules" (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
)

echo [INFO] Starting Server...
echo [INFO] Connect to http://localhost:3000
echo.
node index.js
pause
