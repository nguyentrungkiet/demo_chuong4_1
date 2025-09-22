import { env } from '@/config/env';
import { useMqttConnection } from './useMqttConnection';
import { useWebSocketConnection } from './useWebSocketConnection';
import { useDeviceOnlineStatus } from './useDeviceOnlineStatus';
import { useAlertSystem } from './useAlertSystem';
import { ControlCommand } from '@/types';

export function useRealtimeConnection() {
  const mqttHook = useMqttConnection();
  const wsHook = useWebSocketConnection();
  
  // Always run these hooks for monitoring
  useDeviceOnlineStatus();
  const alertSystem = useAlertSystem();
  
  // Determine which connection to use based on config
  const activeConnection = env.CONNECTION_MODE === 'mqtt' ? mqttHook : wsHook;
  
  const toggleLed = (deviceId: string) => {
    const command: ControlCommand = {
      command: 'LED_TOGGLE',
      value: true, // Value will be toggled by device
      ts: Date.now(),
    };
    
    if (env.CONNECTION_MODE === 'mqtt') {
      return mqttHook.publishControl(deviceId, command);
    } else {
      return wsHook.sendControl(deviceId, command);
    }
  };
  
  const setLed = (deviceId: string, state: boolean) => {
    const command: ControlCommand = {
      command: state ? 'LED_ON' : 'LED_OFF',
      value: state,
      ts: Date.now(),
    };
    
    if (env.CONNECTION_MODE === 'mqtt') {
      return mqttHook.publishControl(deviceId, command);
    } else {
      return wsHook.sendControl(deviceId, command);
    }
  };
  
  return {
    // Connection control
    connect: activeConnection.connect,
    disconnect: activeConnection.disconnect,
    isConnected: activeConnection.isConnected,
    connectionMode: env.CONNECTION_MODE,
    
    // Device control
    toggleLed,
    setLed,
    
    // Alert system
    unacknowledgedAlerts: alertSystem.unacknowledgedAlerts,
    evaluateAlert: alertSystem.evaluateAlert,
  };
}