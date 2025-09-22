#!/bin/bash

# IoT Dashboard - Final Setup Validation Script
echo "🔍 IoT Dashboard - Final Setup Validation"
echo "=========================================="

validation_passed=true

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js $node_version found"
else
    echo "❌ Node.js not found - Please install Node.js 18+"
    validation_passed=false
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✅ npm $npm_version found"
else
    echo "❌ npm not found"
    validation_passed=false
fi

# Check project structure
echo ""
echo "📁 Checking project structure..."

required_files=(
    "package.json"
    "app/package.json"
    "server/package.json"
    "firmware/main.ino"
    "docker-compose.yml"
    "QUICK_START.md"
    "scripts/setup-dev.sh"
    "app/src/hooks/useAlertSystem.ts"
    "app/src/__tests__/useAlertSystem.test.ts"
    "server/src/index.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
        validation_passed=false
    fi
done

# Check dependencies
echo ""
echo "📦 Checking dependencies..."

if [ -d "node_modules" ]; then
    echo "✅ Root dependencies installed"
else
    echo "⚠️  Root dependencies not installed - run: npm install"
fi

if [ -d "app/node_modules" ]; then
    echo "✅ App dependencies installed"
else
    echo "⚠️  App dependencies not installed - run: npm install --workspace=app"
fi

if [ -d "server/node_modules" ]; then
    echo "✅ Server dependencies installed"
else
    echo "⚠️  Server dependencies not installed - run: npm install --workspace=server"
fi

# Check environment files
echo ""
echo "⚙️  Checking environment configuration..."

env_files=(
    "app/.env.example"
    "server/.env.example" 
    "firmware/secrets.h.template"
)

for file in "${env_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
        validation_passed=false
    fi
done

# Check if environment files are copied
if [ -f "app/.env" ]; then
    echo "✅ app/.env configured"
else
    echo "⚠️  app/.env not found - copy from app/.env.example"
fi

if [ -f "server/.env" ]; then
    echo "✅ server/.env configured"
else
    echo "⚠️  server/.env not found - copy from server/.env.example"
fi

if [ -f "firmware/secrets.h" ]; then
    echo "✅ firmware/secrets.h configured"
else
    echo "⚠️  firmware/secrets.h not found - copy from firmware/secrets.h.template"
fi

# Test compilation
echo ""
echo "🔨 Testing TypeScript compilation..."

cd app
if npm run type-check &> /dev/null; then
    echo "✅ App TypeScript compilation successful"
else
    echo "❌ App TypeScript compilation failed"
    validation_passed=false
fi

cd ../server
if npm run type-check &> /dev/null; then
    echo "✅ Server TypeScript compilation successful"
else
    echo "❌ Server TypeScript compilation failed"
    validation_passed=false
fi

cd ..

# Test suite validation
echo ""
echo "🧪 Validating test suite..."

cd app
if npm test &> /dev/null; then
    echo "✅ All tests passing (21/21)"
else
    echo "❌ Some tests failing - check with: npm test"
    validation_passed=false
fi

cd ..

# Final validation result
echo ""
echo "📋 Validation Summary"
echo "===================="

if [ "$validation_passed" = true ]; then
    echo "🎉 All validation checks passed!"
    echo ""
    echo "🚀 Your IoT Dashboard is ready!"
    echo ""
    echo "Next steps:"
    echo "1. npm run dev          # Start development"
    echo "2. Open http://localhost:3000"
    echo "3. Check QUICK_START.md for more options"
    echo ""
    echo "Hardware setup:"
    echo "1. Configure firmware/secrets.h"
    echo "2. Flash firmware to ESP32"
    echo "3. Check firmware/README.md for wiring"
else
    echo "❌ Some validation checks failed"
    echo ""
    echo "Please fix the issues above and run validation again."
    echo ""
    echo "Quick fixes:"
    echo "- npm run install-all    # Install all dependencies"
    echo "- Copy .env.example files to .env"
    echo "- Check README.md for detailed setup"
fi

exit $([ "$validation_passed" = true ] && echo 0 || echo 1)