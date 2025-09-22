# IoT Dashboard Backend Server

Node.js + TypeScript backend server với MQTT bridge, WebSocket real-time communication, và comprehensive REST API cho IoT Device Management.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Hardware      │
│   React App     │◄──►│   Express API    │◄──►│   ESP32 + DHT22 │
│   Port: 3000    │    │   Port: 3001     │    │   MQTT Client   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────▼──────┐
                       │ MQTT Broker │
                       │ Port: 1883  │
                       └─────────────┘
```

## 🚀 Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📋 API Documentation

### Device Management

#### GET /api/devices
List all connected IoT devices
```bash
curl http://localhost:3001/api/devices
```

**Response:**
```json
[
  {
    "id": "ESP32_001",
    "name": "Device 001",
    "type": "ESP32-C3",
    "status": "online",
    "lastSeen": "2024-03-20T10:30:00Z",
    "location": "Room A",
    "telemetry": {
      "temperature": 25.6,
      "humidity": 60.3,
      "led": false
    }
  }
]
```

#### GET /api/devices/:id
Get specific device details
```bash
curl http://localhost:3001/api/devices/ESP32_001
```

#### GET /api/devices/:id/history
Get historical telemetry data
```bash
curl "http://localhost:3001/api/devices/ESP32_001/history?limit=100&from=2024-03-20T00:00:00Z"
```

### Alert Management

#### GET /api/alerts
List all active alerts
```bash
curl http://localhost:3001/api/alerts
```

**Response:**
```json
[
  {
    "id": "alert_1234567890",
    "deviceId": "ESP32_001",
    "type": "temperature_high",
    "message": "Temperature 28.5°C exceeds threshold 25.0°C",
    "value": 28.5,
    "threshold": 25.0,
    "timestamp": "2024-03-20T10:30:00Z",
    "acknowledged": false
  }
]
```

#### POST /api/alerts/:id/acknowledge
Acknowledge an alert
```bash
curl -X POST http://localhost:3001/api/alerts/alert_1234567890/acknowledge
```

### Threshold Configuration

#### GET /api/thresholds/:deviceId
Get device alert thresholds
```bash
curl http://localhost:3001/api/thresholds/ESP32_001
```

**Response:**
```json
{
  "deviceId": "ESP32_001",
  "temperature": {
    "min": 18.0,
    "max": 25.0,
    "enabled": true
  },
  "humidity": {
    "min": 40.0,
    "max": 70.0,
    "enabled": true
  }
}
```

#### PUT /api/thresholds/:deviceId
Update device thresholds
```bash
curl -X PUT http://localhost:3001/api/thresholds/ESP32_001 \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": {
      "min": 20.0,
      "max": 30.0,
      "enabled": true
    },
    "humidity": {
      "min": 30.0,
      "max": 80.0,
      "enabled": true
    }
  }'
```

#### GET /api/health
Server health check
```bash
curl http://localhost:3001/api/health
```

## 🌐 WebSocket Events

### Client → Server Events

#### led_control
Control device LED
```javascript
websocket.send(JSON.stringify({
  type: 'led_control',
  deviceId: 'ESP32_001',
  command: 'LED_TOGGLE',
  value: true
}));
```

### Server → Client Events

#### telemetry
Real-time sensor data
```javascript
{
  "type": "telemetry",
  "deviceId": "ESP32_001",
  "data": {
    "temperature": 25.6,
    "humidity": 60.3,
    "led": false,
    "timestamp": "2024-03-20T10:30:00Z"
  }
}
```

#### alert
New alert notification
```javascript
{
  "type": "alert",
  "alert": {
    "id": "alert_1234567890",
    "deviceId": "ESP32_001",
    "type": "temperature_high",
    "message": "Temperature exceeds threshold",
    "timestamp": "2024-03-20T10:30:00Z"
  }
}
```

#### device_status
Device online/offline status
```javascript
{
  "type": "device_status",
  "deviceId": "ESP32_001",
  "status": "online",
  "timestamp": "2024-03-20T10:30:00Z"
}
```

## 📡 MQTT Integration

### Topics Structure

```
iot/classroom/{deviceId}/telemetry  → Device sensor data
iot/classroom/{deviceId}/control    → Device LED commands
iot/classroom/{deviceId}/ack        → Command acknowledgments
iot/classroom/{deviceId}/status     → Device online/offline
```

### Message Formats

#### Telemetry (Device → Server)
```json
{
  "ts": 1695123456789,
  "temperature": 25.6,
  "humidity": 60.3,
  "led": false,
  "deviceId": "ESP32_001"
}
```

#### Control Command (Server → Device)
```json
{
  "command": "LED_TOGGLE",
  "value": true,
  "ts": 1695123456789
}
```

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js với TypeScript
- **MQTT Client:** mqtt.js
- **WebSocket:** ws library
- **HTTP Security:** helmet middleware
- **Logging:** morgan middleware
- **CORS:** cors middleware
- **Environment:** dotenv configuration

## ⚙️ Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=3001
MQTT_BROKER_URL=mqtt://localhost:1883
CORS_ORIGIN=http://localhost:3000
WS_PORT=3001
DEBUG=server:*
```

### Production (.env)
```env
NODE_ENV=production
PORT=3001
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
CORS_ORIGIN=https://your-frontend-domain.com
WS_PORT=3001
# Remove DEBUG in production
```

## 📁 Project Structure

```
server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── config/
│   │   └── index.ts          # Environment configuration
│   ├── routes/
│   │   ├── devices.ts        # Device management endpoints
│   │   ├── alerts.ts         # Alert management endpoints
│   │   ├── history.ts        # Historical data endpoints
│   │   └── thresholds.ts     # Threshold configuration endpoints
│   ├── services/
│   │   ├── mqttBridge.ts     # MQTT broker integration
│   │   └── webSocketMock.ts  # WebSocket mock data service
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── Dockerfile                # Production container
├── package.json              # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server với hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## 🐳 Docker Deployment

### Build Container
```bash
# Build production image
docker build -t iot-dashboard-server .

# Run container
docker run -p 3001:3001 --env-file .env iot-dashboard-server
```

### Docker Compose (with MQTT)
```yaml
version: '3.8'
services:
  server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MQTT_BROKER_URL=mqtt://mosquitto:1883
    depends_on:
      - mosquitto
      
  mosquitto:
    image: eclipse-mosquitto:2.0
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf
```

## 🔍 Monitoring & Debugging

### Health Check
```bash
# Check server status
curl http://localhost:3001/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-03-20T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### MQTT Testing
```bash
# Subscribe to all device topics
mosquitto_sub -h localhost -t "iot/classroom/+/+"

# Publish test data
mosquitto_pub -h localhost -t "iot/classroom/ESP32_001/telemetry" \
  -m '{"ts":1695123456789,"temperature":25.6,"humidity":60.3,"led":false,"deviceId":"ESP32_001"}'
```

### WebSocket Testing
```javascript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Send LED control command
  ws.send(JSON.stringify({
    type: 'led_control',
    deviceId: 'ESP32_001',
    command: 'LED_TOGGLE',
    value: true
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Linux/Mac)
kill -9 <process_id>
```

#### MQTT Connection Failed
```bash
# Test MQTT broker connectivity
mosquitto_pub -h localhost -p 1883 -t test -m "hello"

# Check if broker is running
docker ps | grep mosquitto

# Start MQTT broker
docker-compose up mosquitto
```

#### TypeScript Errors
```bash
# Check type errors
npm run type-check

# Restart TypeScript server (VS Code)
# Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Debug Logging
Enable verbose logging:
```env
DEBUG=server:*,mqtt:*,websocket:*
NODE_ENV=development
```

View logs:
```bash
# Development
npm run dev

# Production with PM2
pm2 logs iot-dashboard-server

# Docker logs
docker-compose logs -f server
```

## 📊 Performance Optimization

### Production Settings
```env
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"
UV_THREADPOOL_SIZE=16
```

### Scaling with PM2
```bash
# Install PM2
npm install -g pm2

# Start with cluster mode
pm2 start ecosystem.config.js

# Monitor performance
pm2 monit
```

### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'iot-dashboard-server',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## 🔒 Security Considerations

1. **CORS Configuration:** Restrict origins in production
2. **Rate Limiting:** Implement request rate limiting
3. **Input Validation:** Validate all API inputs
4. **MQTT Security:** Use authentication và encryption
5. **Environment Variables:** Secure credential management
6. **HTTPS:** Use TLS in production

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/nguyentrungkiet/demo_chuong4_1/issues)
- **Documentation:** Check main [README.md](../README.md)
- **Hardware Setup:** See [firmware/README.md](../firmware/README.md)
- **Frontend Guide:** See [app/README.md](../app/README.md)

---

**Built with ❤️ for IoT developers**

**Author:** Nguyễn Trung Kiệt - TDMU  
**Course:** IoT & Web Development  
**Institution:** Thủ Dầu Một University