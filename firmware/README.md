# ESP32 IoT Dashboard Firmware

Arduino firmware for ESP32-C3/S3 devices with DHT22 temperature/humidity sensor and MQTT connectivity.

## Hardware Requirements

### Supported Boards
- **ESP32-C3** (recommended for new projects)
- **ESP32-S3** (for advanced features)
- **ESP32** (classic, also supported)

### Components
- DHT22 (AM2302) temperature and humidity sensor
- Jumper wires
- Breadboard (optional)

### Wiring Diagram

```
DHT22 Sensor Connection:
├── VCC → 3.3V (ESP32)
├── GND → GND (ESP32)  
├── DATA → GPIO2 (ESP32)
└── (No connection to 4th pin)

Built-in LED:
├── ESP32-C3: GPIO8
└── ESP32-S3: GPIO48
```

## Software Requirements

### Arduino IDE Setup
1. Install Arduino IDE 2.x
2. Add ESP32 board package:
   - Go to File > Preferences
   - Add to Additional Board Manager URLs:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Install "esp32" package in Board Manager

### Required Libraries
Install these libraries via Arduino Library Manager:

```
1. PubSubClient by Nick O'Leary (v2.8.0+)
2. DHT sensor library by Adafruit (v1.4.4+)
3. ArduinoJson by Benoit Blanchon (v6.21.0+)
4. Adafruit Unified Sensor (dependency)
```

## Configuration

### 1. WiFi & MQTT Credentials
1. Copy `secrets.h.template` to `secrets.h`
2. Edit `secrets.h` with your credentials:

```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
#define MQTT_USERNAME ""  // Leave empty if no auth
#define MQTT_PASSWORD ""  // Leave empty if no auth
```

### 2. Device Configuration
Edit `config.h` to customize:

```cpp
#define DEVICE_ID "ESP32_001"          // Unique device ID
#define MQTT_BROKER "localhost"        // MQTT broker address
#define MQTT_PORT 1883                 // MQTT broker port
#define TELEMETRY_INTERVAL 2000        // Send data every 2 seconds
```

### 3. Board Selection
In Arduino IDE:
- **ESP32-C3**: Select "ESP32C3 Dev Module"
- **ESP32-S3**: Select "ESP32S3 Dev Module"  
- **ESP32**: Select "ESP32 Dev Module"

## MQTT Communication Protocol

### Topics Structure
```
iot/classroom/{DEVICE_ID}/telemetry  → Device sends sensor data
iot/classroom/{DEVICE_ID}/control    → Server sends LED commands  
iot/classroom/{DEVICE_ID}/ack        → Device sends command acknowledgments
iot/classroom/{DEVICE_ID}/status     → Device online/offline status
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

Available commands:
- `LED_ON` - Turn LED on
- `LED_OFF` - Turn LED off  
- `LED_TOGGLE` - Toggle LED state

#### Acknowledgment (Device → Server)
```json
{
  "command": "LED_TOGGLE",
  "success": true,
  "ts": 1695123456789,
  "message": "LED toggled ON"
}
```

## Installation & Upload

### 1. Prepare Hardware
1. Connect DHT22 sensor to ESP32 as per wiring diagram
2. Connect ESP32 to computer via USB cable

### 2. Configure Arduino IDE
1. Select correct board and port
2. Set these compilation options:
   - Upload Speed: 921600
   - CPU Frequency: 160MHz
   - Flash Size: 4MB
   - Partition Scheme: Default

### 3. Upload Firmware
1. Open `main.ino` in Arduino IDE
2. Verify code compiles without errors
3. Upload to ESP32
4. Open Serial Monitor (115200 baud) to see status

## Monitoring & Debugging

### Serial Output
Connect to Serial Monitor at 115200 baud to see:
- WiFi connection status
- MQTT connection status  
- Sensor readings
- Command execution logs
- Error messages and diagnostics

### Expected Serial Output
```
🚀 IoT Dashboard - ESP32 Firmware Starting...
📱 Device ID: ESP32_001
🔧 Board: ESP32-C3
🔧 Initializing hardware...
💡 LED initialized on GPIO8
🌡️  DHT22 sensor initialized on GPIO2
📶 Connecting to WiFi...
✅ WiFi connected!
📍 IP Address: 192.168.1.100
📡 Connecting to MQTT broker...
✅ MQTT connected!
📥 Subscribed to: iot/classroom/ESP32_001/control
📤 Telemetry sent: T=25.6°C, H=60.3%, LED=OFF
```

## Troubleshooting

### Common Issues

#### WiFi Connection Failed
- Check SSID and password in `secrets.h`
- Ensure WiFi network is 2.4GHz (ESP32 doesn't support 5GHz)
- Check signal strength and range

#### MQTT Connection Failed  
- Verify MQTT broker is running and accessible
- Check broker address and port in `config.h`
- Test broker connectivity from computer first

#### Sensor Reading Errors
- Check DHT22 wiring connections
- Verify 3.3V power supply is stable
- Try different GPIO pin if readings fail
- Ensure DHT22 is genuine (many clones have issues)

#### Upload/Compilation Errors
- Check all required libraries are installed
- Verify board selection matches your hardware
- Ensure `secrets.h` file exists and is configured
- Try different USB cable or port

### Advanced Debugging

#### Enable Verbose Logging
Set `DEBUG_OUTPUT true` in `config.h` for detailed logs.

#### MQTT Testing
Use tools like MQTT Explorer or mosquitto_sub to monitor topics:
```bash
mosquitto_sub -h localhost -t "iot/classroom/+/+"
```

#### Network Analysis
Check ESP32 IP and connectivity:
```bash
ping 192.168.1.100  # Replace with ESP32 IP
```

## Security Considerations

1. **WiFi Security**: Use WPA2/WPA3 encryption
2. **MQTT Authentication**: Enable username/password if possible
3. **Network Segmentation**: Consider IoT VLAN
4. **Firmware Updates**: Keep ESP32 Arduino core updated
5. **Credential Management**: Never commit `secrets.h` to version control

## Performance Tips

1. **Telemetry Interval**: Adjust based on use case (default: 2 seconds)
2. **WiFi Power Management**: Consider deep sleep for battery projects
3. **Memory Usage**: Monitor free heap in Serial output
4. **QoS Settings**: Use MQTT QoS 1 for important messages

## Support

For issues and questions:
1. Check Serial Monitor output first
2. Verify hardware connections
3. Test MQTT broker independently
4. Review this documentation
5. Check ESP32 Arduino core documentation