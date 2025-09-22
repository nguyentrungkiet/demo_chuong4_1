import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DashboardState, 
  Device, 
  TelemetryData, 
  Alert, 
  Threshold, 
  DataPoint,
  ConnectionMode 
} from '@/types';

interface DashboardStore extends DashboardState {
  // Actions
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  
  // Device management
  addDevice: (device: Device) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  removeDevice: (deviceId: string) => void;
  setDeviceOnlineStatus: (deviceId: string, isOnline: boolean) => void;
  
  // Telemetry data
  addTelemetryData: (deviceId: string, data: TelemetryData) => void;
  getTelemetryBuffer: (deviceId: string) => DataPoint[];
  clearTelemetryBuffer: (deviceId: string) => void;
  
  // Alerts
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlert: (alertId: string) => void;
  getUnacknowledgedAlerts: () => Alert[];
  
  // Thresholds
  setThreshold: (deviceId: string, threshold: Threshold) => void;
  getThreshold: (deviceId: string) => Threshold | undefined;
  
  // Utility
  reset: () => void;
}

const initialState: DashboardState = {
  devices: [],
  telemetryBuffer: new Map(),
  alerts: [],
  thresholds: new Map(),
  connectionStatus: 'disconnected',
  connectionMode: 'websocket', // Default to WebSocket for demo
  lastUpdate: Date.now(),
};

const DEFAULT_THRESHOLD: Omit<Threshold, 'deviceId'> = {
  id: 'default',
  temperatureMax: 35.0,
  temperatureMin: 15.0,
  humidityMax: 80.0,
  humidityMin: 30.0,
  enabled: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const MAX_BUFFER_SIZE = 500; // Keep last 500 data points per device

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Connection management
    setConnectionStatus: (status) => 
      set({ connectionStatus: status, lastUpdate: Date.now() }),
    
    setConnectionMode: (mode) => 
      set({ connectionMode: mode, lastUpdate: Date.now() }),

    // Device management
    addDevice: (device) => 
      set((state) => ({
        devices: [...state.devices.filter(d => d.id !== device.id), device],
        lastUpdate: Date.now(),
      })),

    updateDevice: (deviceId, updates) =>
      set((state) => ({
        devices: state.devices.map(device =>
          device.id === deviceId ? { ...device, ...updates } : device
        ),
        lastUpdate: Date.now(),
      })),

    removeDevice: (deviceId) =>
      set((state) => {
        const newBuffer = new Map(state.telemetryBuffer);
        newBuffer.delete(deviceId);
        const newThresholds = new Map(state.thresholds);
        newThresholds.delete(deviceId);
        
        return {
          devices: state.devices.filter(d => d.id !== deviceId),
          telemetryBuffer: newBuffer,
          thresholds: newThresholds,
          alerts: state.alerts.filter(a => a.deviceId !== deviceId),
          lastUpdate: Date.now(),
        };
      }),

    setDeviceOnlineStatus: (deviceId, isOnline) =>
      set((state) => ({
        devices: state.devices.map(device =>
          device.id === deviceId 
            ? { 
                ...device, 
                status: isOnline ? 'online' : 'offline',
                lastSeen: isOnline ? Date.now() : device.lastSeen 
              }
            : device
        ),
        lastUpdate: Date.now(),
      })),

    // Telemetry data management
    addTelemetryData: (deviceId, data) =>
      set((state) => {
        const newBuffer = new Map(state.telemetryBuffer);
        const currentBuffer = newBuffer.get(deviceId) || [];
        
        const newDataPoint: DataPoint = {
          timestamp: data.ts,
          temperature: data.temperature,
          humidity: data.humidity,
        };
        
        // Add new data point and keep only last MAX_BUFFER_SIZE items
        const updatedBuffer = [...currentBuffer, newDataPoint]
          .slice(-MAX_BUFFER_SIZE);
        
        newBuffer.set(deviceId, updatedBuffer);
        
        // Update device current data and online status
        const updatedDevices = state.devices.map(device =>
          device.id === deviceId
            ? {
                ...device,
                currentData: data,
                status: 'online' as const,
                lastSeen: Date.now(),
              }
            : device
        );

        return {
          telemetryBuffer: newBuffer,
          devices: updatedDevices,
          lastUpdate: Date.now(),
        };
      }),

    getTelemetryBuffer: (deviceId) => {
      const state = get();
      return state.telemetryBuffer.get(deviceId) || [];
    },

    clearTelemetryBuffer: (deviceId) =>
      set((state) => {
        const newBuffer = new Map(state.telemetryBuffer);
        newBuffer.delete(deviceId);
        return { telemetryBuffer: newBuffer, lastUpdate: Date.now() };
      }),

    // Alert management
    addAlert: (alert) =>
      set((state) => ({
        alerts: [alert, ...state.alerts.filter(a => a.id !== alert.id)],
        lastUpdate: Date.now(),
      })),

    acknowledgeAlert: (alertId) =>
      set((state) => ({
        alerts: state.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ),
        lastUpdate: Date.now(),
      })),

    clearAlert: (alertId) =>
      set((state) => ({
        alerts: state.alerts.filter(a => a.id !== alertId),
        lastUpdate: Date.now(),
      })),

    getUnacknowledgedAlerts: () => {
      const state = get();
      return state.alerts.filter(alert => !alert.acknowledged);
    },

    // Threshold management
    setThreshold: (deviceId, threshold) =>
      set((state) => {
        const newThresholds = new Map(state.thresholds);
        newThresholds.set(deviceId, threshold);
        return { thresholds: newThresholds, lastUpdate: Date.now() };
      }),

    getThreshold: (deviceId) => {
      const state = get();
      return state.thresholds.get(deviceId) || {
        deviceId,
        ...DEFAULT_THRESHOLD,
      };
    },

    // Utility
    reset: () => set({ ...initialState, lastUpdate: Date.now() }),
  }))
);

// Selectors for better performance
export const selectDevices = (state: DashboardStore) => state.devices;
export const selectOnlineDevices = (state: DashboardStore) => 
  state.devices.filter(d => d.status === 'online');
export const selectConnectionStatus = (state: DashboardStore) => state.connectionStatus;
export const selectUnacknowledgedAlerts = (state: DashboardStore) => 
  state.alerts.filter(alert => !alert.acknowledged);