@echo off
title ManiProject - Backend Server
color 0A
echo.
echo ========================================
echo   ManiProject Backend Server
echo ========================================
echo.
cd /d %~dp0

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Starting Backend Server...
echo ========================================
echo.
echo Database: MongoDB
echo Port: 5000
echo API URL: http://localhost:5000
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo Error: Server failed to start
    pause
    exit /b 1
)

pause






