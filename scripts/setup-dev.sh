#!/bin/bash

# IoT Dashboard - Development Setup Script
echo "🚀 IoT Web Dashboard - Development Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install-all

# Copy environment files
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f "app/.env" ]; then
    cp app/.env.example app/.env
    echo "✅ Created app/.env from example"
fi

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env from example"
fi

if [ ! -f "firmware/secrets.h" ]; then
    cp firmware/secrets.h.template firmware/secrets.h
    echo "✅ Created firmware/secrets.h from template"
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Quick Start Commands:"
echo "  npm run dev          # Start development servers"
echo "  npm run dev:app      # Start only frontend"
echo "  npm run dev:server   # Start only backend"  
echo "  npm run test         # Run all tests"
echo "  npm run build        # Build for production"
echo ""
echo "📖 Check README.md for detailed usage instructions"