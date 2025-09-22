# 🚀 Quick Start Guide

Get the IoT Dashboard running in under 5 minutes!

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Docker** (optional, for full deployment)

## 🎯 Option 1: Development Mode (Recommended for testing)

### Windows:
```cmd
# Run the setup script
scripts\setup-dev.bat

# Start development servers
npm run dev
```

### Linux/Mac:
```bash
# Make script executable and run
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Start development servers
npm run dev
```

### Manual Setup:
```bash
# 1. Install dependencies
npm run install-all

# 2. Copy environment files
cp app/.env.example app/.env
cp server/.env.example server/.env
cp firmware/secrets.h.template firmware/secrets.h

# 3. Start development
npm run dev
```

## 🐳 Option 2: Production Deployment (Docker)

```bash
# Build and deploy with Docker
npm run deploy:docker

# Check status
docker-compose ps

# Stop services
npm run deploy:docker:down
```

## 📱 Access the Dashboard

Once running, access:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MQTT Broker**: mqtt://localhost:1883

## 🔧 ESP32 Configuration

1. Open `firmware/secrets.h` 
2. Configure your WiFi and MQTT settings:
   ```cpp
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define MQTT_BROKER "192.168.1.100"  // Your computer's IP
   ```
3. Flash the firmware to your ESP32-C3/S3

## 🧪 Testing

```bash
# Run all tests
npm test

# Run only frontend tests
npm run test:app

# Watch mode for development
npm run test:watch
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build for production |
| `npm run test` | Run all tests |
| `npm run lint` | Check code quality |
| `npm run deploy:docker` | Deploy with Docker |

## 🆘 Troubleshooting

### Port conflicts:
- Frontend (3000), Backend (3001), MQTT (1883)
- Change ports in `.env` files if needed

### Dependencies issues:
```bash
# Clean and reinstall
npm run clean:node-modules
npm run install-all
```

### Docker issues:
```bash
# Reset Docker environment
npm run deploy:docker:down
docker system prune -f
npm run deploy:docker
```

## 📖 Next Steps

- Check the full [README.md](../README.md) for detailed documentation
- See [Hardware Setup Guide](firmware/README.md) for ESP32 wiring
- Review [API Documentation](server/README.md) for backend details

---

Need help? Check the troubleshooting section in the main README or create an issue on GitHub.