import mqtt, { MqttClient } from 'mqtt';
import { config } from '../config';
import { TelemetryData, ControlCommand, AckResponse, Alert } from '../types';
import { addAlert } from '../routes/alerts';

export class MqttBridgeService {
  private client: MqttClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  async connect(): Promise<void> {
    try {
      console.log(`🔌 Connecting to MQTT broker: ${config.mqttBrokerUrl}`);
      
      this.client = mqtt.connect(config.mqttBrokerUrl, {
        clientId: config.mqttClientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: this.reconnectDelay,
        will: {
          topic: `iot/classroom/server/status`,
          payload: JSON.stringify({
            status: 'offline',
            timestamp: Date.now(),
          }),
          qos: 1,
          retain: true,
        },
      });

      return new Promise((resolve, reject) => {
        if (!this.client) {
          reject(new Error('Failed to create MQTT client'));
          return;
        }

        this.client.on('connect', () => {
          console.log('✅ Connected to MQTT broker');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Publish server online status
          this.publishServerStatus('online');
          
          // Subscribe to IoT topics
          this.subscribeToTopics();
          
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('❌ MQTT connection error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          } else {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          }
        });

        this.client.on('close', () => {
          console.log('🔌 MQTT connection closed');
          this.isConnected = false;
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize MQTT client:', error);
      throw error;
    }
  }

  private subscribeToTopics(): void {
    if (!this.client || !this.isConnected) {
      console.error('❌ Cannot subscribe: MQTT client not connected');
      return;
    }

    const topics = [
      'iot/classroom/+/telemetry',  // Device telemetry data
      'iot/classroom/+/ack',        // Device acknowledgments
    ];

    topics.forEach(topic => {
      this.client!.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          console.error(`❌ Failed to subscribe to ${topic}:`, error);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const messageStr = message.toString();
      console.log(`📨 Received MQTT message on ${topic}:`, messageStr);

      // Parse topic to extract device ID and message type
      const topicParts = topic.split('/');
      if (topicParts.length < 4 || topicParts[0] !== 'iot' || topicParts[1] !== 'classroom') {
        console.warn(`⚠️  Invalid topic format: ${topic}`);
        return;
      }

      const deviceId = topicParts[2];
      const messageType = topicParts[3];

      const data = JSON.parse(messageStr);

      switch (messageType) {
        case 'telemetry':
          this.handleTelemetryMessage(deviceId, data);
          break;
        case 'ack':
          this.handleAckMessage(deviceId, data);
          break;
        default:
          console.warn(`⚠️  Unknown message type: ${messageType}`);
      }
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  }

  private handleTelemetryMessage(deviceId: string, data: TelemetryData): void {
    console.log(`📊 Telemetry from ${deviceId}:`, data);
    
    // TODO: Store telemetry data in database
    // For now, we'll just log it
    
    // Check for threshold alerts
    this.checkThresholds(deviceId, data);
  }

  private handleAckMessage(deviceId: string, data: AckResponse): void {
    console.log(`✅ ACK from ${deviceId}:`, data);
    
    // TODO: Update command status in database
    // For now, we'll just log it
  }

  private checkThresholds(deviceId: string, telemetry: TelemetryData): void {
    // TODO: Get device thresholds from database
    // For demo purposes, using hardcoded thresholds
    const defaultThresholds = {
      temperatureMax: 30,
      temperatureMin: 10,
      humidityMax: 80,
      humidityMin: 20,
    };

    const alerts: Alert[] = [];

    // Check temperature thresholds
    if (telemetry.temperature > defaultThresholds.temperatureMax) {
      alerts.push({
        id: `${deviceId}-temp-high-${Date.now()}`,
        deviceId,
        type: 'temperature_high',
        value: telemetry.temperature,
        threshold: defaultThresholds.temperatureMax,
        timestamp: telemetry.ts,
        acknowledged: false,
        message: `Temperature ${telemetry.temperature}°C exceeds maximum threshold ${defaultThresholds.temperatureMax}°C`,
      });
    }

    if (telemetry.temperature < defaultThresholds.temperatureMin) {
      alerts.push({
        id: `${deviceId}-temp-low-${Date.now()}`,
        deviceId,
        type: 'temperature_low',
        value: telemetry.temperature,
        threshold: defaultThresholds.temperatureMin,
        timestamp: telemetry.ts,
        acknowledged: false,
        message: `Temperature ${telemetry.temperature}°C below minimum threshold ${defaultThresholds.temperatureMin}°C`,
      });
    }

    // Check humidity thresholds
    if (telemetry.humidity > defaultThresholds.humidityMax) {
      alerts.push({
        id: `${deviceId}-humid-high-${Date.now()}`,
        deviceId,
        type: 'humidity_high',
        value: telemetry.humidity,
        threshold: defaultThresholds.humidityMax,
        timestamp: telemetry.ts,
        acknowledged: false,
        message: `Humidity ${telemetry.humidity}% exceeds maximum threshold ${defaultThresholds.humidityMax}%`,
      });
    }

    if (telemetry.humidity < defaultThresholds.humidityMin) {
      alerts.push({
        id: `${deviceId}-humid-low-${Date.now()}`,
        deviceId,
        type: 'humidity_low',
        value: telemetry.humidity,
        threshold: defaultThresholds.humidityMin,
        timestamp: telemetry.ts,
        acknowledged: false,
        message: `Humidity ${telemetry.humidity}% below minimum threshold ${defaultThresholds.humidityMin}%`,
      });
    }

    // Add alerts to system
    alerts.forEach(alert => {
      addAlert(alert);
      console.log(`🚨 Alert created: ${alert.message}`);
    });
  }

  // Public methods for sending commands
  public sendControlCommand(deviceId: string, command: ControlCommand): boolean {
    if (!this.client || !this.isConnected) {
      console.error('❌ Cannot send command: MQTT client not connected');
      return false;
    }

    const topic = `iot/classroom/${deviceId}/control`;
    const payload = JSON.stringify(command);

    try {
      this.client.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error(`❌ Failed to send command to ${deviceId}:`, error);
        } else {
          console.log(`📤 Command sent to ${deviceId}:`, command);
        }
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending MQTT command:', error);
      return false;
    }
  }

  public publishServerStatus(status: 'online' | 'offline'): void {
    if (!this.client) {
      return;
    }

    const topic = 'iot/classroom/server/status';
    const payload = JSON.stringify({
      status,
      timestamp: Date.now(),
    });

    this.client.publish(topic, payload, { qos: 1, retain: true }, (error) => {
      if (error) {
        console.error('❌ Failed to publish server status:', error);
      } else {
        console.log(`📤 Server status published: ${status}`);
      }
    });
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    return new Promise((resolve) => {
      // Publish offline status
      this.publishServerStatus('offline');

      // Close connection
      this.client!.end(false, {}, () => {
        console.log('✅ MQTT client disconnected');
        this.isConnected = false;
        this.client = null;
        resolve();
      });
    });
  }
}