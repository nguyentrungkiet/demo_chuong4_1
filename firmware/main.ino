/*
 * IoT Dashboard - ESP32 Firmware
 * COPILOT_PRIMER.md Implementation - Arduino Code for ESP32-C3/S3
 * 
 * Hardware:
 * - ESP32-C3 or ESP32-S3
 * - DHT22 temperature/humidity sensor
 * - Built-in LED for control demonstration
 * 
 * MQTT Topics:
 * - Publish: iot/classroom/{DEVICE_ID}/telemetry
 * - Subscribe: iot/classroom/{DEVICE_ID}/control
 * - Publish: iot/classroom/{DEVICE_ID}/ack
 * 
 * Dependencies (install via Arduino Library Manager):
 * - PubSubClient by Nick O'Leary
 * - DHT sensor library by Adafruit
 * - ArduinoJson by Benoit Blanchon
 * - WiFi library (built-in for ESP32)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include "config.h"
#include "secrets.h"

// DHT22 Sensor Configuration
#define DHT_PIN 2          // GPIO2 for DHT22 data pin
#define DHT_TYPE DHT22     // DHT22 sensor type
DHT dht(DHT_PIN, DHT_TYPE);

// LED Configuration
#ifdef ESP32C3
  #define LED_PIN 8        // ESP32-C3 built-in LED (GPIO8)
#else
  #define LED_PIN 48       // ESP32-S3 built-in LED (GPIO48)
#endif

// WiFi and MQTT clients
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// Device state
bool ledState = false;
unsigned long lastTelemetryTime = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastMqttReconnect = 0;
int reconnectAttempts = 0;

// MQTT Topics
String telemetryTopic;
String controlTopic;
String ackTopic;

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("🚀 IoT Dashboard - ESP32 Firmware Starting...");
  Serial.printf("📱 Device ID: %s\n", DEVICE_ID);
  Serial.printf("🔧 Board: %s\n", BOARD_TYPE);
  
  // Initialize hardware
  initializeHardware();
  
  // Initialize WiFi
  initializeWiFi();
  
  // Initialize MQTT
  initializeMQTT();
  
  // Setup MQTT topics
  setupMQTTTopics();
  
  Serial.println("✅ Initialization complete!");
  Serial.println("📊 Starting telemetry transmission...");
}

void loop() {
  // Check WiFi connection
  if (!WiFi.isConnected()) {
    handleWiFiReconnection();
  }
  
  // Check MQTT connection
  if (!mqttClient.connected()) {
    handleMQTTReconnection();
  }
  
  // Process MQTT messages
  mqttClient.loop();
  
  // Send telemetry data
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    sendTelemetryData();
    lastTelemetryTime = millis();
  }
  
  // Small delay to prevent watchdog issues
  delay(100);
}

void initializeHardware() {
  Serial.println("🔧 Initializing hardware...");
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  ledState = false;
  Serial.printf("💡 LED initialized on GPIO%d\n", LED_PIN);
  
  // Initialize DHT22 sensor
  dht.begin();
  Serial.printf("🌡️  DHT22 sensor initialized on GPIO%d\n", DHT_PIN);
  
  // Test LED
  Serial.println("💡 Testing LED...");
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("✅ Hardware initialization complete");
}

void initializeWiFi() {
  Serial.println("📶 Connecting to WiFi...");
  Serial.printf("🌐 SSID: %s\n", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
    
    if (attempts % 10 == 0) {
      Serial.printf("\n⏳ WiFi connection attempt %d/30\n", attempts);
    }
  }
  
  if (WiFi.isConnected()) {
    Serial.println("\n✅ WiFi connected!");
    Serial.printf("📍 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("📶 Signal Strength: %d dBm\n", WiFi.RSSI());
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("🔄 Will retry in main loop...");
  }
}

void initializeMQTT() {
  Serial.println("📡 Initializing MQTT...");
  Serial.printf("🌐 Broker: %s:%d\n", MQTT_BROKER, MQTT_PORT);
  
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(30);
  
  Serial.println("✅ MQTT client initialized");
}

void setupMQTTTopics() {
  telemetryTopic = String("iot/classroom/") + DEVICE_ID + "/telemetry";
  controlTopic = String("iot/classroom/") + DEVICE_ID + "/control";
  ackTopic = String("iot/classroom/") + DEVICE_ID + "/ack";
  
  Serial.println("📋 MQTT Topics configured:");
  Serial.printf("📤 Telemetry: %s\n", telemetryTopic.c_str());
  Serial.printf("📥 Control: %s\n", controlTopic.c_str());
  Serial.printf("📤 ACK: %s\n", ackTopic.c_str());
}

void handleWiFiReconnection() {
  if (millis() - lastWiFiCheck >= 30000) { // Check every 30 seconds
    lastWiFiCheck = millis();
    
    Serial.println("🔄 WiFi disconnected, attempting reconnection...");
    WiFi.reconnect();
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
      delay(1000);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.isConnected()) {
      Serial.println("\n✅ WiFi reconnected!");
    } else {
      Serial.println("\n❌ WiFi reconnection failed");
    }
  }
}

void handleMQTTReconnection() {
  if (millis() - lastMqttReconnect >= 5000) { // Try every 5 seconds
    lastMqttReconnect = millis();
    reconnectAttempts++;
    
    Serial.printf("🔄 MQTT disconnected, reconnection attempt %d...\n", reconnectAttempts);
    
    if (connectToMQTT()) {
      reconnectAttempts = 0;
      Serial.println("✅ MQTT reconnected!");
    } else {
      Serial.printf("❌ MQTT reconnection failed (attempt %d)\n", reconnectAttempts);
      
      // Reset after 10 failed attempts
      if (reconnectAttempts >= 10) {
        Serial.println("🔄 Too many MQTT reconnection failures, restarting ESP32...");
        ESP.restart();
      }
    }
  }
}

bool connectToMQTT() {
  if (!WiFi.isConnected()) {
    Serial.println("❌ Cannot connect to MQTT: WiFi not connected");
    return false;
  }
  
  String clientId = String("ESP32_") + DEVICE_ID + "_" + String(random(0xffff), HEX);
  
  Serial.printf("📡 Connecting to MQTT broker as %s...\n", clientId.c_str());
  
  bool connected = false;
  
  // Try connecting with credentials if provided
  if (strlen(MQTT_USERNAME) > 0 && strlen(MQTT_PASSWORD) > 0) {
    connected = mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD);
  } else {
    connected = mqttClient.connect(clientId.c_str());
  }
  
  if (connected) {
    Serial.println("✅ MQTT connected!");
    
    // Subscribe to control topic
    if (mqttClient.subscribe(controlTopic.c_str(), 1)) {
      Serial.printf("📥 Subscribed to: %s\n", controlTopic.c_str());
    } else {
      Serial.printf("❌ Failed to subscribe to: %s\n", controlTopic.c_str());
    }
    
    // Send device online status
    sendDeviceStatus("online");
    
    return true;
  } else {
    Serial.printf("❌ MQTT connection failed, state: %d\n", mqttClient.state());
    return false;
  }
}

void sendTelemetryData() {
  if (!mqttClient.connected()) {
    Serial.println("⚠️  Cannot send telemetry: MQTT not connected");
    return;
  }
  
  // Read sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    return;
  }
  
  // Create telemetry JSON
  StaticJsonDocument<200> telemetryDoc;
  telemetryDoc["ts"] = millis();
  telemetryDoc["temperature"] = round(temperature * 10.0) / 10.0; // Round to 1 decimal
  telemetryDoc["humidity"] = round(humidity * 10.0) / 10.0;       // Round to 1 decimal
  telemetryDoc["led"] = ledState;
  telemetryDoc["deviceId"] = DEVICE_ID;
  
  String telemetryJson;
  serializeJson(telemetryDoc, telemetryJson);
  
  // Publish telemetry data
  if (mqttClient.publish(telemetryTopic.c_str(), telemetryJson.c_str(), true)) {
    Serial.printf("📤 Telemetry sent: T=%.1f°C, H=%.1f%%, LED=%s\n", 
                  temperature, humidity, ledState ? "ON" : "OFF");
  } else {
    Serial.println("❌ Failed to send telemetry data");
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.printf("📥 MQTT message received on %s: %s\n", topic, message.c_str());
  
  // Check if it's a control message
  if (String(topic) == controlTopic) {
    handleControlMessage(message);
  }
}

void handleControlMessage(String message) {
  // Parse JSON control message
  StaticJsonDocument<200> controlDoc;
  DeserializationError error = deserializeJson(controlDoc, message);
  
  if (error) {
    Serial.printf("❌ Failed to parse control message: %s\n", error.c_str());
    sendAckResponse("PARSE_ERROR", false, "Invalid JSON format");
    return;
  }
  
  String command = controlDoc["command"].as<String>();
  bool commandValue = controlDoc["value"].as<bool>();
  
  Serial.printf("🎮 Control command: %s (value: %s)\n", command.c_str(), commandValue ? "true" : "false");
  
  bool success = false;
  String responseMessage = "";
  
  // Execute command
  if (command == "LED_ON") {
    ledState = true;
    digitalWrite(LED_PIN, HIGH);
    success = true;
    responseMessage = "LED turned ON";
  } 
  else if (command == "LED_OFF") {
    ledState = false;
    digitalWrite(LED_PIN, LOW);
    success = true;
    responseMessage = "LED turned OFF";
  } 
  else if (command == "LED_TOGGLE") {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    success = true;
    responseMessage = String("LED toggled ") + (ledState ? "ON" : "OFF");
  } 
  else {
    success = false;
    responseMessage = "Unknown command: " + command;
  }
  
  // Send acknowledgment
  sendAckResponse(command, success, responseMessage);
  
  if (success) {
    Serial.printf("✅ Command executed: %s\n", responseMessage.c_str());
    
    // Send immediate telemetry update to reflect LED state change
    delay(100);
    sendTelemetryData();
  } else {
    Serial.printf("❌ Command failed: %s\n", responseMessage.c_str());
  }
}

void sendAckResponse(String command, bool success, String message) {
  if (!mqttClient.connected()) {
    Serial.println("⚠️  Cannot send ACK: MQTT not connected");
    return;
  }
  
  // Create ACK JSON
  StaticJsonDocument<300> ackDoc;
  ackDoc["command"] = command;
  ackDoc["success"] = success;
  ackDoc["ts"] = millis();
  ackDoc["message"] = message;
  
  String ackJson;
  serializeJson(ackDoc, ackJson);
  
  // Publish ACK
  if (mqttClient.publish(ackTopic.c_str(), ackJson.c_str())) {
    Serial.printf("📤 ACK sent: %s - %s\n", success ? "SUCCESS" : "FAILED", message.c_str());
  } else {
    Serial.println("❌ Failed to send ACK response");
  }
}

void sendDeviceStatus(String status) {
  if (!mqttClient.connected()) {
    return;
  }
  
  String statusTopic = String("iot/classroom/") + DEVICE_ID + "/status";
  
  StaticJsonDocument<200> statusDoc;
  statusDoc["deviceId"] = DEVICE_ID;
  statusDoc["status"] = status;
  statusDoc["ts"] = millis();
  statusDoc["ip"] = WiFi.localIP().toString();
  statusDoc["rssi"] = WiFi.RSSI();
  
  String statusJson;
  serializeJson(statusDoc, statusJson);
  
  mqttClient.publish(statusTopic.c_str(), statusJson.c_str(), true);
  Serial.printf("📤 Device status sent: %s\n", status.c_str());
}