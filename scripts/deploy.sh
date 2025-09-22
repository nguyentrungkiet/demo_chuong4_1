#!/bin/bash

# IoT Dashboard - Production Deployment Script
echo "🚀 IoT Web Dashboard - Production Deployment"
echo "============================================"

set -e  # Exit on any error

# Build and deploy
echo "🏗️  Building applications..."
npm run deploy:build

echo "🐳 Starting Docker containers..."
npm run deploy:docker

echo "⏳ Waiting for services to start..."
sleep 10

# Health checks
echo "🔍 Running health checks..."

# Check frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check backend
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check MQTT broker
if nc -z localhost 1883 >/dev/null 2>&1; then
    echo "✅ MQTT broker is running on port 1883"
else
    echo "❌ MQTT broker health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "Services:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  MQTT Broker: mqtt://localhost:1883"
echo ""
echo "To stop all services: npm run deploy:docker:down"