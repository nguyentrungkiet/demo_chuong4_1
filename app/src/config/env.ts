// Environment variables with VITE_ prefix for frontend
export const env = {
  // Connection settings
  CONNECTION_MODE: import.meta.env.VITE_CONNECTION_MODE || 'websocket',
  
  // MQTT settings
  MQTT_BROKER_URL: import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001',
  MQTT_CLIENT_ID: import.meta.env.VITE_MQTT_CLIENT_ID || 'iot-dashboard',
  
  // WebSocket mock settings
  WS_MOCK_URL: import.meta.env.VITE_WS_MOCK_URL || 'ws://localhost:3002',
  
  // API settings
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // Device settings
  DEFAULT_DEVICE_ID: import.meta.env.VITE_DEFAULT_DEVICE_ID || 'c3-01',
  MAX_DATA_POINTS: parseInt(import.meta.env.VITE_MAX_DATA_POINTS || '500'),
  
  // Alert settings
  OFFLINE_TIMEOUT: parseInt(import.meta.env.VITE_OFFLINE_TIMEOUT || '5000'),
  DEFAULT_TEMP_MAX: parseFloat(import.meta.env.VITE_DEFAULT_TEMP_MAX || '35.0'),
  DEFAULT_TEMP_MIN: parseFloat(import.meta.env.VITE_DEFAULT_TEMP_MIN || '15.0'),
  DEFAULT_HUMIDITY_MAX: parseFloat(import.meta.env.VITE_DEFAULT_HUMIDITY_MAX || '80.0'),
  DEFAULT_HUMIDITY_MIN: parseFloat(import.meta.env.VITE_DEFAULT_HUMIDITY_MIN || '30.0'),
  
  // Development
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
} as const;

// Validation function
export function validateEnvironment() {
  const required = ['CONNECTION_MODE', 'API_BASE_URL'];
  const missing = required.filter(key => !env[key as keyof typeof env]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  if (env.DEBUG) {
    console.log('Environment configuration:', env);
  }
}

// MQTT Topics based on COPILOT_PRIMER.md
export const MQTT_TOPICS = {
  TELEMETRY: (deviceId: string) => `iot/classroom/${deviceId}/telemetry`,
  CONTROL: (deviceId: string) => `iot/classroom/${deviceId}/control`,
  ACK: (deviceId: string) => `iot/classroom/${deviceId}/ack`,
} as const;