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

## 🔧 ESP32 Hardware Setup

### Required Components
- ESP32-C3/S3 development board
- DHT22 (AM2302) temperature/humidity sensor  
- Jumper wires (3 pieces)
- Breadboard (optional)
- USB cable for programming

### Step-by-Step Wiring

1. **Power Connections:**
   ```
   DHT22 Pin 1 (VCC) → ESP32 3.3V
   DHT22 Pin 4 (GND) → ESP32 GND
   ```

2. **Data Connection:**
   ```
   DHT22 Pin 2 (DATA) → ESP32 GPIO2
   ```

3. **Visual Guide:**
   ```
   ESP32-C3:              DHT22:
   ┌─────────┐           ┌─────────┐
   │   3.3V  ●●●●●●●●●●●●● VCC     │
   │   GND   ●●●●●●●●●●●●● GND     │
   │   GPIO2 ●●●●●●●●●●●●● DATA    │
   │         │           │   NC    │
   │   GPIO8 ● (LED)     └─────────┘
   └─────────┘
   ```

### Firmware Configuration

1. **Install Arduino IDE** (if not already installed)
   - Download from: https://www.arduino.cc/en/software

2. **Setup ESP32 Board:**
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Board Manager → Search "ESP32" → Install

3. **Install Required Libraries:**
   - Tools → Manage Libraries → Install:
     - `DHT sensor library` by Adafruit
     - `PubSubClient` by Nick O'Leary  
     - `ArduinoJson` by Benoit Blanchon

4. **Configure WiFi & MQTT:**
   ```cpp
   // Copy firmware/secrets.h.template to firmware/secrets.h
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define MQTT_BROKER "192.168.1.100"  // Your computer's IP
   ```

5. **Upload Firmware:**
   - Open `firmware/main.ino`
   - Select Board: ESP32C3 Dev Module
   - Select Port: (your ESP32 port)
   - Click Upload

### Verify Connection
Open Serial Monitor (115200 baud) and look for:
```
✅ WiFi connected!
📍 IP Address: 192.168.1.xxx
✅ MQTT connected!
📤 Telemetry sent: T=25.6°C, H=60.3%
```

## 🔧 ESP32 Configuration

1. Open `firmware/secrets.h`
2. Configure your WiFi and MQTT settings:
```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
#define MQTT_BROKER "192.168.1.100"  // Your computer's IP
```
3. Flash the firmware to your ESP32-C3/S3## 🧪 Testing

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

### ESP32 Issues:

#### WiFi Connection Failed:
- Ensure WiFi is 2.4GHz (not 5GHz)
- Check SSID and password in `secrets.h`
- Verify signal strength

#### MQTT Connection Failed:
- Check computer's IP address: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
- Ensure MQTT broker is running: `docker-compose ps`
- Test connectivity: `ping <your-computer-ip>`

#### No Sensor Data:
- Check DHT22 wiring connections
- Verify 3.3V power (not 5V)
- Try different GPIO pin
- Open Serial Monitor for debug info

## 📖 Next Steps

- Check the full [README.md](../README.md) for detailed documentation
- See [Hardware Setup Guide](firmware/README.md) for ESP32 wiring
- Review [API Documentation](server/README.md) for backend details

---

Need help? Check the troubleshooting section in the main README or create an issue on GitHub.

**Quick Start Guide for IoT Web Dashboard**

**Author:** Nguyễn Trung Kiệt - TDMU  
**Course:** IoT & Web Development  
**Institution:** Thủ Dầu Một University