import dotenv from 'dotenv';
import { ServerConfig } from '../types';

// Load environment variables
dotenv.config();

export const config: ServerConfig = {
  port: parseInt(process.env.SERVER_PORT || '3001'),
  host: process.env.SERVER_HOST || 'localhost',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // MQTT Configuration
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  mqttWsUrl: process.env.MQTT_WS_URL || 'ws://localhost:9001',
  mqttClientId: process.env.MQTT_CLIENT_ID || 'iot-dashboard-server',
  
  // WebSocket Mock Configuration
  wsMockPort: parseInt(process.env.WS_MOCK_PORT || '3002'),
  wsMockHost: process.env.WS_MOCK_HOST || 'localhost',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Logging & Environment
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
};

// Validation
export function validateConfig(): void {
  const required = ['port', 'host', 'corsOrigin'];
  const missing: string[] = [];
  
  required.forEach(key => {
    if (!config[key as keyof ServerConfig]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  if (config.debug) {
    console.log('Server Configuration:', {
      ...config,
      // Don't log sensitive data in production
      mqttBrokerUrl: config.mqttBrokerUrl.replace(/\/\/.*@/, '//*****@'),
    });
  }
}