import { useEffect, useRef, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { env, MQTT_TOPICS } from '@/config/env';
import { TelemetryData, ControlCommand, AckResponse } from '@/types';
import toast from 'react-hot-toast';

// MQTT client type (will be imported from mqtt package)
type MqttClient = any;

export function useMqttConnection() {
  const clientRef = useRef<MqttClient | null>(null);
  const {
    setConnectionStatus,
    setConnectionMode,
    addTelemetryData,
    addDevice,
    setDeviceOnlineStatus,
  } = useDashboardStore();

  // Use setDeviceOnlineStatus in message handlers below
  const updateDeviceStatus = useCallback((deviceId: string, status: 'online' | 'offline') => {
    setDeviceOnlineStatus(deviceId, status === 'online');
  }, [setDeviceOnlineStatus]);

  const connect = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setConnectionMode('mqtt');

      // Dynamic import to avoid bundling mqtt in WebSocket mode
      const mqtt = await import('mqtt');
      
      const client = mqtt.connect(env.MQTT_BROKER_URL, {
        clientId: `${env.MQTT_CLIENT_ID}-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        keepalive: 60,
        reconnectPeriod: 1000,
      });

      client.on('connect', () => {
        console.log('MQTT Connected');
        setConnectionStatus('connected');
        toast.success('Connected to MQTT broker');
        
        // Subscribe to all device telemetry
        client.subscribe('iot/classroom/+/telemetry', (err) => {
          if (err) {
            console.error('Subscribe error:', err);
            toast.error('Failed to subscribe to telemetry');
          }
        });
        
        // Subscribe to all device ACKs
        client.subscribe('iot/classroom/+/ack', (err) => {
          if (err) {
            console.error('Subscribe ACK error:', err);
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          
          if (topic.includes('/telemetry')) {
            handleTelemetryMessage(payload as TelemetryData);
          } else if (topic.includes('/ack')) {
            handleAckMessage(payload as AckResponse);
          }
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('MQTT Error:', error);
        setConnectionStatus('disconnected');
        toast.error('MQTT connection error');
      });

      client.on('offline', () => {
        console.log('MQTT Offline');
        setConnectionStatus('disconnected');
        toast.error('MQTT connection lost');
      });

      client.on('reconnect', () => {
        console.log('MQTT Reconnecting...');
        setConnectionStatus('connecting');
      });

      clientRef.current = client;
    } catch (error) {
      console.error('Failed to connect MQTT:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to MQTT broker');
    }
  }, [setConnectionStatus, setConnectionMode]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setConnectionStatus('disconnected');
      toast.success('Disconnected from MQTT');
    }
  }, [setConnectionStatus]);

  const publishControl = useCallback((deviceId: string, command: ControlCommand) => {
    if (!clientRef.current || !clientRef.current.connected) {
      toast.error('Not connected to MQTT broker');
      return false;
    }

    try {
      const topic = MQTT_TOPICS.CONTROL(deviceId);
      const payload = JSON.stringify(command);
      
      clientRef.current.publish(topic, payload, { qos: 1 }, (err: any) => {
        if (err) {
          console.error('Publish error:', err);
          toast.error('Failed to send command');
        } else {
          console.log(`Command sent to ${deviceId}:`, command);
          toast.success(`Command sent: ${command.command}`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error publishing control:', error);
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

    // Update device online status
    updateDeviceStatus(data.deviceId, 'online');

    // Add telemetry data to buffer (store handles 500 limit)
    addTelemetryData(data.deviceId, data);
  }, [addDevice, addTelemetryData, updateDeviceStatus]);

  const handleAckMessage = useCallback((ack: AckResponse) => {
    if (ack.success) {
      toast.success(`✓ ${ack.command} acknowledged`);
    } else {
      toast.error(`✗ ${ack.command} failed: ${ack.message || 'Unknown error'}`);
    }
  }, []);

  // Auto-connect on mount if MQTT mode
  useEffect(() => {
    if (env.CONNECTION_MODE === 'mqtt') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    publishControl,
    isConnected: clientRef.current?.connected || false,
  };
}