import { useEffect, useRef, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { env } from '@/config/env';
import { TelemetryData, ControlCommand, AckResponse } from '@/types';
import toast from 'react-hot-toast';

export function useWebSocketConnection() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    setConnectionStatus,
    setConnectionMode,
    addTelemetryData,
    addDevice,
  } = useDashboardStore();

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      setConnectionMode('websocket');

      const ws = new WebSocket(env.WS_MOCK_URL);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setConnectionStatus('connected');
        toast.success('Connected to WebSocket mock server');
        
        // Request device list
        ws.send(JSON.stringify({ type: 'get_devices' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'telemetry':
              handleTelemetryMessage(message.data as TelemetryData);
              break;
            case 'ack':
              handleAckMessage(message.data as AckResponse);
              break;
            case 'device_list':
              handleDeviceList(message.data);
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setConnectionStatus('disconnected');
        toast.error('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket Closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        if (!event.wasClean) {
          toast.error('WebSocket connection lost - attempting reconnect...');
          // Auto-reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to WebSocket server');
    }
  }, [setConnectionStatus, setConnectionMode]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
      setConnectionStatus('disconnected');
      toast.success('Disconnected from WebSocket');
    }
  }, [setConnectionStatus]);

  const sendControl = useCallback((deviceId: string, command: ControlCommand) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to WebSocket server');
      return false;
    }

    try {
      const message = {
        type: 'control',
        deviceId,
        data: command,
      };
      
      wsRef.current.send(JSON.stringify(message));
      console.log(`Command sent to ${deviceId}:`, command);
      toast.success(`Command sent: ${command.command}`);
      return true;
    } catch (error) {
      console.error('Error sending control:', error);
      toast.error('Error sending command');
      return false;
    }
  }, []);

  const handleTelemetryMessage = useCallback((data: TelemetryData) => {
    // Add or update device
    addDevice({
      id: data.deviceId,
      name: `ESP32-${data.deviceId}`,
      status: 'online',
      lastSeen: Date.now(),
      currentData: data,
    });

    // Add telemetry data to buffer (store handles 500 limit)
    addTelemetryData(data.deviceId, data);
  }, [addDevice, addTelemetryData]);

  const handleAckMessage = useCallback((ack: AckResponse) => {
    if (ack.success) {
      toast.success(`✓ ${ack.command} acknowledged`);
    } else {
      toast.error(`✗ ${ack.command} failed: ${ack.message || 'Unknown error'}`);
    }
  }, []);

  const handleDeviceList = useCallback((devices: any[]) => {
    devices.forEach(device => {
      addDevice({
        id: device.id,
        name: device.name || `ESP32-${device.id}`,
        status: device.status || 'offline',
        lastSeen: device.lastSeen || Date.now(),
        currentData: device.currentData,
      });
    });
  }, [addDevice]);

  // Auto-connect on mount if WebSocket mode
  useEffect(() => {
    if (env.CONNECTION_MODE === 'websocket') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    sendControl,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}