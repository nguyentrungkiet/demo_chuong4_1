#!/bin/bash

# IoT Dashboard - Cleanup Script
echo "🧹 IoT Dashboard - Cleanup"
echo "=========================="

# Clean build artifacts
echo "🗑️  Cleaning build artifacts..."
npm run clean

# Clean node_modules (optional)
read -p "Remove node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing node_modules..."
    npm run clean:node-modules
fi

# Clean Docker containers and images (optional)
read -p "Clean Docker containers and images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐳 Stopping Docker containers..."
    npm run deploy:docker:down
    
    echo "🗑️  Removing Docker containers and images..."
    docker system prune -f
    docker volume prune -f
fi

echo "✅ Cleanup complete!"