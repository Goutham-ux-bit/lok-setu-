@echo off
title LOK SETU - Server
echo ========================================================
echo               Starting LOK SETU Platform
echo ========================================================
echo.
cd /d "%~dp0backend"
if not exist .env (
    copy .env.example .env
)
echo Starting server on http://localhost:3000 ...
start http://localhost:3000/user.html
node server.js
pause
