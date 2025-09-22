@echo off
REM IoT Dashboard - Development Setup Script for Windows
echo 🚀 IoT Web Dashboard - Development Setup
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo ✅ npm found

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm run install-all

REM Copy environment files
echo.
echo ⚙️ Setting up environment files...

if not exist "app\.env" (
    copy "app\.env.example" "app\.env"
    echo ✅ Created app/.env from example
)

if not exist "server\.env" (
    copy "server\.env.example" "server\.env"
    echo ✅ Created server/.env from example
)

if not exist "firmware\secrets.h" (
    copy "firmware\secrets.h.template" "firmware\secrets.h"
    echo ✅ Created firmware/secrets.h from template
)

REM Run tests
echo.
echo 🧪 Running tests...
call npm test

echo.
echo 🎉 Setup complete!
echo.
echo Quick Start Commands:
echo   npm run dev          # Start development servers
echo   npm run dev:app      # Start only frontend
echo   npm run dev:server   # Start only backend
echo   npm run test         # Run all tests
echo   npm run build        # Build for production
echo.
echo 📖 Check README.md for detailed usage instructions
pause