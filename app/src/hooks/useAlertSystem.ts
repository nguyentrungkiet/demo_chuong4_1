import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { TelemetryData, Alert, Threshold } from '@/types';
import toast from 'react-hot-toast';

// Alert evaluation function (will be tested in BƯỚC 6)
export function evaluateAlert(
  data: TelemetryData,
  threshold: Threshold
): Alert[] {
  const { temperature, humidity, deviceId, ts } = data;
  const alerts: Alert[] = [];
  
  // Skip if threshold is disabled
  if (!threshold.enabled) {
    return alerts;
  }
  
  // Generate unique ID with timestamp and random component
  const generateId = (deviceId: string, type: string) => 
    `${deviceId}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Check temperature thresholds
  if (threshold.temperatureMax !== undefined && temperature > threshold.temperatureMax) {
    alerts.push({
      id: generateId(deviceId, 'temp-high'),
      deviceId,
      type: 'temperature_high',
      value: temperature,
      threshold: threshold.temperatureMax,
      timestamp: ts,
      acknowledged: false,
      message: `Temperature ${temperature}°C exceeds maximum threshold ${threshold.temperatureMax}°C`,
    });
  }
  
  if (threshold.temperatureMin !== undefined && temperature < threshold.temperatureMin) {
    alerts.push({
      id: generateId(deviceId, 'temp-low'),
      deviceId,
      type: 'temperature_low',
      value: temperature,
      threshold: threshold.temperatureMin,
      timestamp: ts,
      acknowledged: false,
      message: `Temperature ${temperature}°C below minimum threshold ${threshold.temperatureMin}°C`,
    });
  }
  
  // Check humidity thresholds
  if (threshold.humidityMax !== undefined && humidity > threshold.humidityMax) {
    alerts.push({
      id: generateId(deviceId, 'humid-high'),
      deviceId,
      type: 'humidity_high',
      value: humidity,
      threshold: threshold.humidityMax,
      timestamp: ts,
      acknowledged: false,
      message: `Humidity ${humidity}% exceeds maximum threshold ${threshold.humidityMax}%`,
    });
  }
  
  if (threshold.humidityMin !== undefined && humidity < threshold.humidityMin) {
    alerts.push({
      id: generateId(deviceId, 'humid-low'),
      deviceId,
      type: 'humidity_low',
      value: humidity,
      threshold: threshold.humidityMin,
      timestamp: ts,
      acknowledged: false,
      message: `Humidity ${humidity}% below minimum threshold ${threshold.humidityMin}%`,
    });
  }
  
  return alerts;
}

export function useAlertSystem() {
  const { 
    devices, 
    addAlert, 
    getThreshold,
    getUnacknowledgedAlerts 
  } = useDashboardStore();

  // Listen for new telemetry data and evaluate alerts
  useEffect(() => {
    devices.forEach(device => {
      if (device.currentData) {
        const threshold = getThreshold(device.id);
        if (threshold) {
          const alerts = evaluateAlert(device.currentData, threshold);
          
          alerts.forEach(alert => {
            // Check if we already have this alert (avoid duplicates)
            const existingAlerts = getUnacknowledgedAlerts();
            const isDuplicate = existingAlerts.some(existing => 
              existing.deviceId === alert.deviceId &&
              existing.type === alert.type &&
              Math.abs(existing.timestamp - alert.timestamp) < 60000 // Within 1 minute
            );
            
            if (!isDuplicate) {
              addAlert(alert);
              
              // Show toast notification with appropriate styling
              const toastOptions = {
                duration: 6000,
                style: {
                  background: alert.type.includes('temperature') ? '#fee2e2' : '#fef3c7',
                  color: alert.type.includes('temperature') ? '#991b1b' : '#92400e',
                  border: `2px solid ${alert.type.includes('temperature') ? '#fca5a5' : '#fcd34d'}`,
                },
              };
              
              toast(alert.message, toastOptions);
            }
          });
        }
      }
    });
  }, [devices, getThreshold, addAlert, getUnacknowledgedAlerts]);

  return {
    evaluateAlert,
    unacknowledgedAlerts: getUnacknowledgedAlerts(),
  };
}