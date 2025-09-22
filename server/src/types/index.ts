// Shared types matching frontend types (based on COPILOT_PRIMER.md)

export interface TelemetryData {
  ts: number;
  temperature: number;
  humidity: number;
  led: boolean;
  deviceId: string;
}

export interface ControlCommand {
  command: 'LED_TOGGLE' | 'LED_ON' | 'LED_OFF';
  value: boolean;
  ts: number;
}

export interface AckResponse {
  command: string;
  success: boolean;
  ts: number;
  message?: string;
}

export interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen: number;
  currentData?: TelemetryData;
}

export interface Alert {
  id: string;
  deviceId: string;
  type: 'temperature_high' | 'temperature_low' | 'humidity_high' | 'humidity_low';
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
  message: string;
}

export interface Threshold {
  deviceId: string;
  temperatureMax: number;
  temperatureMin: number;
  humidityMax: number;
  humidityMin: number;
}

export interface DataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
}

// API Request/Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HistoryRequest {
  deviceId?: string;
  from?: number;
  to?: number;
  limit?: number;
  page?: number;
}

export interface HistoryResponse {
  deviceId: string;
  data: DataPoint[];
  total: number;
  page: number;
  limit: number;
}

export interface ThresholdRequest {
  deviceId: string;
  temperatureMax?: number;
  temperatureMin?: number;
  humidityMax?: number;
  humidityMin?: number;
}

export interface AlertAckRequest {
  alertId: string;
  acknowledged: boolean;
}

// WebSocket Mock message types
export interface WSMessage {
  type: 'telemetry' | 'control' | 'ack' | 'device_list' | 'get_devices';
  deviceId?: string;
  data?: any;
}

// Server Configuration
export interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
  mqttBrokerUrl: string;
  mqttWsUrl: string;
  mqttClientId: string;
  wsMockPort: number;
  wsMockHost: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
  nodeEnv: string;
  debug: boolean;
}