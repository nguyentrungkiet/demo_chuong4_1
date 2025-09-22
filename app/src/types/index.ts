// MQTT message types based on COPILOT_PRIMER.md specification

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
  id: string;
  deviceId: string;
  temperatureMax?: number;
  temperatureMin?: number;
  humidityMax?: number;
  humidityMin?: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
}

// Connection types
export type ConnectionMode = 'mqtt' | 'websocket';

export interface ConnectionConfig {
  mode: ConnectionMode;
  mqttUrl?: string;
  wsUrl?: string;
  clientId?: string;
}

// Store states
export interface DashboardState {
  devices: Device[];
  telemetryBuffer: Map<string, DataPoint[]>; // deviceId -> last 500 data points
  alerts: Alert[];
  thresholds: Map<string, Threshold>; // deviceId -> thresholds
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  connectionMode: ConnectionMode;
  lastUpdate: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HistoryResponse {
  deviceId: string;
  data: DataPoint[];
  total: number;
  page: number;
  limit: number;
}