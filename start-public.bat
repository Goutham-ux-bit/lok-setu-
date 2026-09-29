@echo off
title LOK SETU - Server + Public URL
echo ========================================================
echo         Starting LOK SETU Platform (Public Web)
echo ========================================================
echo.
cd /d "%~dp0backend"
if not exist .env (
    copy .env.example .env
)
echo [1/2] Starting backend server on port 3000...
start /b node server.js
timeout /t 2 /nobreak >nul
echo [2/2] Launching Cloudflare Tunnel for secure public HTTPS URL...
echo.
cd /d "%~dp0"
if exist cloudflared.exe (
    cloudflared.exe tunnel --url http://localhost:3000
) else (
    echo cloudflared.exe not found. Running only locally on http://localhost:3000
    pause
)
