import WebSocket from 'ws';
import { config } from '../config';
import { TelemetryData, ControlCommand, AckResponse, WSMessage } from '../types';

export class WebSocketMockService {
  private wss: WebSocket.Server | null = null;
  private port: number;
  private isRunning = false;
  private mockDevices: Map<string, any> = new Map();
  private telemetryInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    this.port = port;
    this.initializeMockDevices();
  }

  private initializeMockDevices(): void {
    // Initialize 3 mock devices as per COPILOT_PRIMER.md
    const devices = [
      { id: 'ESP32_001', name: 'Classroom Sensor 1', temperature: 25, humidity: 60, led: false },
      { id: 'ESP32_002', name: 'Classroom Sensor 2', temperature: 23, humidity: 55, led: false },
      { id: 'ESP32_003', name: 'Classroom Sensor 3', temperature: 27, humidity: 65, led: true },
    ];

    devices.forEach(device => {
      this.mockDevices.set(device.id, device);
    });

    console.log(`🎭 Mock devices initialized: ${Array.from(this.mockDevices.keys()).join(', ')}`);
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocket.Server({
          port: this.port,
          host: config.wsMockHost,
        });

        this.wss.on('listening', () => {
          console.log(`✅ WebSocket Mock Server listening on ${config.wsMockHost}:${this.port}`);
          this.isRunning = true;
          this.startTelemetryBroadcast();
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket) => {
          console.log('🔌 New WebSocket connection established');
          
          // Send initial device list
          this.sendDeviceList(ws);

          ws.on('message', (data: WebSocket.RawData) => {
            try {
              const message = JSON.parse(data.toString()) as WSMessage;
              this.handleMessage(ws, message);
            } catch (error) {
              console.error('❌ Error parsing WebSocket message:', error);
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid message format',
              }));
            }
          });

          ws.on('close', () => {
            console.log('🔌 WebSocket connection closed');
          });

          ws.on('error', (error: Error) => {
            console.error('❌ WebSocket connection error:', error);
          });
        });

        this.wss.on('error', (error: Error) => {
          console.error('❌ WebSocket Server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Failed to start WebSocket Mock Server:', error);
        reject(error);
      }
    });
  }

  private handleMessage(ws: WebSocket, message: WSMessage): void {
    console.log('📨 Received WebSocket message:', message);

    switch (message.type) {
      case 'get_devices':
        this.sendDeviceList(ws);
        break;

      case 'control':
        this.handleControlCommand(ws, message);
        break;

      default:
        console.warn(`⚠️  Unknown message type: ${message.type}`);
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${message.type}`,
        }));
    }
  }

  private sendDeviceList(ws: WebSocket): void {
    const deviceList = Array.from(this.mockDevices.entries()).map(([id, device]) => ({
      id,
      name: device.name,
      status: 'online',
      lastSeen: Date.now(),
      currentData: {
        ts: Date.now(),
        temperature: device.temperature,
        humidity: device.humidity,
        led: device.led,
        deviceId: id,
      },
    }));

    ws.send(JSON.stringify({
      type: 'device_list',
      data: deviceList,
    }));
  }

  private handleControlCommand(ws: WebSocket, message: WSMessage): void {
    const { deviceId, data } = message;
    
    if (!deviceId || !data) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Missing deviceId or data in control message',
      }));
      return;
    }

    const device = this.mockDevices.get(deviceId);
    if (!device) {
      ws.send(JSON.stringify({
        type: 'error',
        error: `Device ${deviceId} not found`,
      }));
      return;
    }

    const command = data as ControlCommand;
    console.log(`🎮 Control command for ${deviceId}:`, command);

    // Update device state
    switch (command.command) {
      case 'LED_ON':
        device.led = true;
        break;
      case 'LED_OFF':
        device.led = false;
        break;
      case 'LED_TOGGLE':
        device.led = !device.led;
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown command: ${command.command}`,
        }));
        return;
    }

    // Send acknowledgment
    const ackResponse: AckResponse = {
      command: command.command,
      success: true,
      ts: Date.now(),
      message: `Command ${command.command} executed successfully`,
    };

    ws.send(JSON.stringify({
      type: 'ack',
      deviceId,
      data: ackResponse,
    }));

    // Broadcast updated telemetry to all clients
    this.broadcastTelemetry(deviceId);
  }

  private startTelemetryBroadcast(): void {
    // Send telemetry data every 2 seconds
    this.telemetryInterval = setInterval(() => {
      this.mockDevices.forEach((device, deviceId) => {
        // Simulate temperature and humidity fluctuations
        device.temperature += (Math.random() - 0.5) * 2; // ±1°C
        device.humidity += (Math.random() - 0.5) * 4; // ±2%
        
        // Keep values within realistic ranges
        device.temperature = Math.max(15, Math.min(35, device.temperature));
        device.humidity = Math.max(30, Math.min(90, device.humidity));
        
        this.broadcastTelemetry(deviceId);
      });
    }, 2000);
  }

  private broadcastTelemetry(deviceId: string): void {
    const device = this.mockDevices.get(deviceId);
    if (!device || !this.wss) {
      return;
    }

    const telemetryData: TelemetryData = {
      ts: Date.now(),
      temperature: Math.round(device.temperature * 10) / 10, // Round to 1 decimal
      humidity: Math.round(device.humidity * 10) / 10, // Round to 1 decimal
      led: device.led,
      deviceId,
    };

    const message = JSON.stringify({
      type: 'telemetry',
      deviceId,
      data: telemetryData,
    });

    // Broadcast to all connected clients
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🛑 Stopping WebSocket Mock Server...');
      
      // Stop telemetry broadcast
      if (this.telemetryInterval) {
        clearInterval(this.telemetryInterval);
        this.telemetryInterval = null;
      }

      if (!this.wss) {
        this.isRunning = false;
        resolve();
        return;
      }

      // Close all client connections
      this.wss.clients.forEach((client: WebSocket) => {
        client.close();
      });

      // Close the server
      this.wss.close(() => {
        console.log('✅ WebSocket Mock Server stopped');
        this.isRunning = false;
        this.wss = null;
        resolve();
      });
    });
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }

  // Get mock device data for API endpoints
  public getMockDevices(): Array<{ id: string; name: string; status: string; lastSeen: number; currentData: TelemetryData }> {
    return Array.from(this.mockDevices.entries()).map(([id, device]) => ({
      id,
      name: device.name,
      status: 'online',
      lastSeen: Date.now(),
      currentData: {
        ts: Date.now(),
        temperature: device.temperature,
        humidity: device.humidity,
        led: device.led,
        deviceId: id,
      },
    }));
  }
}