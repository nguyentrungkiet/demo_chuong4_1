@echo off
REM IoT Dashboard - Final Setup Validation Script for Windows
echo 🔍 IoT Dashboard - Final Setup Validation
echo ==========================================

set validation_passed=true

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found - Please install Node.js 18+
    set validation_passed=false
) else (
    echo ✅ Node.js found
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found
    set validation_passed=false
) else (
    echo ✅ npm found
)

REM Check project structure
echo.
echo 📁 Checking project structure...

if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json missing & set validation_passed=false)
if exist "app\package.json" (echo ✅ app\package.json) else (echo ❌ app\package.json missing & set validation_passed=false)
if exist "server\package.json" (echo ✅ server\package.json) else (echo ❌ server\package.json missing & set validation_passed=false)
if exist "firmware\main.ino" (echo ✅ firmware\main.ino) else (echo ❌ firmware\main.ino missing & set validation_passed=false)
if exist "docker-compose.yml" (echo ✅ docker-compose.yml) else (echo ❌ docker-compose.yml missing & set validation_passed=false)
if exist "QUICK_START.md" (echo ✅ QUICK_START.md) else (echo ❌ QUICK_START.md missing & set validation_passed=false)
if exist "scripts\setup-dev.bat" (echo ✅ scripts\setup-dev.bat) else (echo ❌ scripts\setup-dev.bat missing & set validation_passed=false)
if exist "app\src\hooks\useAlertSystem.ts" (echo ✅ app\src\hooks\useAlertSystem.ts) else (echo ❌ useAlertSystem.ts missing & set validation_passed=false)
if exist "app\src\__tests__\useAlertSystem.test.ts" (echo ✅ app\src\__tests__\useAlertSystem.test.ts) else (echo ❌ test file missing & set validation_passed=false)
if exist "server\src\index.ts" (echo ✅ server\src\index.ts) else (echo ❌ server\src\index.ts missing & set validation_passed=false)

REM Check dependencies
echo.
echo 📦 Checking dependencies...

if exist "node_modules" (echo ✅ Root dependencies installed) else (echo ⚠️ Root dependencies not installed - run: npm install)
if exist "app\node_modules" (echo ✅ App dependencies installed) else (echo ⚠️ App dependencies not installed - run: npm install --workspace=app)
if exist "server\node_modules" (echo ✅ Server dependencies installed) else (echo ⚠️ Server dependencies not installed - run: npm install --workspace=server)

REM Check environment files
echo.
echo ⚙️ Checking environment configuration...

if exist "app\.env.example" (echo ✅ app\.env.example) else (echo ❌ app\.env.example missing & set validation_passed=false)
if exist "server\.env.example" (echo ✅ server\.env.example) else (echo ❌ server\.env.example missing & set validation_passed=false)
if exist "firmware\secrets.h.template" (echo ✅ firmware\secrets.h.template) else (echo ❌ firmware\secrets.h.template missing & set validation_passed=false)

if exist "app\.env" (echo ✅ app\.env configured) else (echo ⚠️ app\.env not found - copy from app\.env.example)
if exist "server\.env" (echo ✅ server\.env configured) else (echo ⚠️ server\.env not found - copy from server\.env.example)
if exist "firmware\secrets.h" (echo ✅ firmware\secrets.h configured) else (echo ⚠️ firmware\secrets.h not found - copy from firmware\secrets.h.template)

REM Test TypeScript compilation
echo.
echo 🔨 Testing TypeScript compilation...

cd app
call npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ App TypeScript compilation successful
) else (
    echo ❌ App TypeScript compilation failed
    set validation_passed=false
)

cd ..\server
call npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server TypeScript compilation successful
) else (
    echo ❌ Server TypeScript compilation failed
    set validation_passed=false
)

cd ..

REM Test suite validation
echo.
echo 🧪 Validating test suite...

cd app
call npm test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ All tests passing ^(21/21^)
) else (
    echo ❌ Some tests failing - check with: npm test
    set validation_passed=false
)

cd ..

REM Final validation result
echo.
echo 📋 Validation Summary
echo ====================

if "%validation_passed%"=="true" (
    echo 🎉 All validation checks passed!
    echo.
    echo 🚀 Your IoT Dashboard is ready!
    echo.
    echo Next steps:
    echo 1. npm run dev          # Start development
    echo 2. Open http://localhost:3000
    echo 3. Check QUICK_START.md for more options
    echo.
    echo Hardware setup:
    echo 1. Configure firmware/secrets.h
    echo 2. Flash firmware to ESP32
    echo 3. Check firmware/README.md for wiring
) else (
    echo ❌ Some validation checks failed
    echo.
    echo Please fix the issues above and run validation again.
    echo.
    echo Quick fixes:
    echo - npm run install-all    # Install all dependencies
    echo - Copy .env.example files to .env
    echo - Check README.md for detailed setup
)

pause