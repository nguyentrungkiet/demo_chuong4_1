import { describe, it, expect } from 'vitest';
import { TelemetryData, Threshold } from '../types';
import { evaluateAlert } from '../hooks/useAlertSystem';

describe('Alert System - evaluateAlert Function', () => {
  // Mock data for testing
  const mockDeviceId = 'ESP32_001';
  const mockTimestamp = Date.now();

  const createTelemetryData = (temperature: number, humidity: number): TelemetryData => ({
    ts: mockTimestamp,
    temperature,
    humidity,
    led: false,
    deviceId: mockDeviceId,
  });

  const createThreshold = (
    tempMax?: number,
    tempMin?: number,
    humidMax?: number,
    humidMin?: number
  ): Threshold => ({
    id: 'threshold_001',
    deviceId: mockDeviceId,
    temperatureMax: tempMax,
    temperatureMin: tempMin,
    humidityMax: humidMax,
    humidityMin: humidMin,
    enabled: true,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  });

  describe('Temperature Alerts', () => {
    it('should create HIGH temperature alert when value exceeds maximum threshold', () => {
      // Arrange
      const telemetry = createTelemetryData(35.5, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        deviceId: mockDeviceId,
        type: 'temperature_high',
        value: 35.5,
        threshold: 30,
        acknowledged: false,
      });
      expect(alerts[0].message).toContain('Temperature 35.5°C exceeds maximum');
      expect(alerts[0].id).toMatch(/ESP32_001-temp-high-\d+/);
    });

    it('should create LOW temperature alert when value is below minimum threshold', () => {
      // Arrange
      const telemetry = createTelemetryData(5.2, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        deviceId: mockDeviceId,
        type: 'temperature_low',
        value: 5.2,
        threshold: 10,
        acknowledged: false,
      });
      expect(alerts[0].message).toContain('Temperature 5.2°C below minimum');
    });

    it('should NOT create temperature alert when value is within thresholds', () => {
      // Arrange
      const telemetry = createTelemetryData(25.0, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      const tempAlerts = alerts.filter(alert => alert.type.includes('temperature'));
      expect(tempAlerts).toHaveLength(0);
    });

    it('should handle edge case: exactly at temperature thresholds', () => {
      // Arrange - exactly at max threshold
      const telemetryAtMax = createTelemetryData(30.0, 60);
      const telemetryAtMin = createTelemetryData(10.0, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alertsAtMax = evaluateAlert(telemetryAtMax, threshold);
      const alertsAtMin = evaluateAlert(telemetryAtMin, threshold);

      // Assert - should NOT trigger alerts at exact threshold values
      const tempAlertsMax = alertsAtMax.filter(alert => alert.type.includes('temperature'));
      const tempAlertsMin = alertsAtMin.filter(alert => alert.type.includes('temperature'));
      expect(tempAlertsMax).toHaveLength(0);
      expect(tempAlertsMin).toHaveLength(0);
    });
  });

  describe('Humidity Alerts', () => {
    it('should create HIGH humidity alert when value exceeds maximum threshold', () => {
      // Arrange
      const telemetry = createTelemetryData(25, 85.7);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        deviceId: mockDeviceId,
        type: 'humidity_high',
        value: 85.7,
        threshold: 80,
        acknowledged: false,
      });
      expect(alerts[0].message).toContain('Humidity 85.7% exceeds maximum');
      expect(alerts[0].id).toMatch(/ESP32_001-humid-high-\d+/);
    });

    it('should create LOW humidity alert when value is below minimum threshold', () => {
      // Arrange
      const telemetry = createTelemetryData(25, 15.3);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        deviceId: mockDeviceId,
        type: 'humidity_low',
        value: 15.3,
        threshold: 20,
        acknowledged: false,
      });
      expect(alerts[0].message).toContain('Humidity 15.3% below minimum');
    });

    it('should NOT create humidity alert when value is within thresholds', () => {
      // Arrange
      const telemetry = createTelemetryData(25, 50);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      const humidityAlerts = alerts.filter(alert => alert.type.includes('humidity'));
      expect(humidityAlerts).toHaveLength(0);
    });
  });

  describe('Multiple Alerts', () => {
    it('should create multiple alerts when both temperature and humidity exceed thresholds', () => {
      // Arrange
      const telemetry = createTelemetryData(35.5, 85.7);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(2);
      
      const tempAlert = alerts.find(alert => alert.type === 'temperature_high');
      const humidAlert = alerts.find(alert => alert.type === 'humidity_high');
      
      expect(tempAlert).toBeDefined();
      expect(humidAlert).toBeDefined();
      expect(tempAlert?.value).toBe(35.5);
      expect(humidAlert?.value).toBe(85.7);
    });

    it('should create alerts for extreme values (both high and low)', () => {
      // Arrange
      const telemetry = createTelemetryData(5.0, 15.0);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(2);
      
      const tempAlert = alerts.find(alert => alert.type === 'temperature_low');
      const humidAlert = alerts.find(alert => alert.type === 'humidity_low');
      
      expect(tempAlert).toBeDefined();
      expect(humidAlert).toBeDefined();
    });
  });

  describe('Threshold Configurations', () => {
    it('should handle missing temperature thresholds (undefined)', () => {
      // Arrange
      const telemetry = createTelemetryData(50, 60);
      const threshold = createThreshold(undefined, undefined, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      const tempAlerts = alerts.filter(alert => alert.type.includes('temperature'));
      expect(tempAlerts).toHaveLength(0);
    });

    it('should handle missing humidity thresholds (undefined)', () => {
      // Arrange
      const telemetry = createTelemetryData(25, 95);
      const threshold = createThreshold(30, 10, undefined, undefined);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      const humidityAlerts = alerts.filter(alert => alert.type.includes('humidity'));
      expect(humidityAlerts).toHaveLength(0);
    });

    it('should handle disabled thresholds', () => {
      // Arrange
      const telemetry = createTelemetryData(35, 85);
      const threshold: Threshold = {
        ...createThreshold(30, 10, 80, 20),
        enabled: false,
      };

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Alert ID Generation', () => {
    it('should generate unique alert IDs for each call', async () => {
      // Arrange
      const telemetry = createTelemetryData(35, 85);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts1 = evaluateAlert(telemetry, threshold);
      
      // Wait 1ms to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const alerts2 = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts1).toHaveLength(2);
      expect(alerts2).toHaveLength(2);
      
      // IDs should be different (contain different timestamps)
      expect(alerts1[0].id).not.toBe(alerts2[0].id);
      expect(alerts1[1].id).not.toBe(alerts2[1].id);
    });

    it('should include device ID and alert type in alert ID', () => {
      // Arrange
      const telemetry = createTelemetryData(35, 15);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(2);
      expect(alerts[0].id).toMatch(/ESP32_001-(temp|humid)-(high|low)-\d+/);
      expect(alerts[1].id).toMatch(/ESP32_001-(temp|humid)-(high|low)-\d+/);
    });
  });

  describe('Alert Message Format', () => {
    it('should format temperature alert messages correctly', () => {
      // Arrange
      const telemetry = createTelemetryData(35.5, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts[0].message).toBe(
        'Temperature 35.5°C exceeds maximum threshold 30°C'
      );
    });

    it('should format humidity alert messages correctly', () => {
      // Arrange
      const telemetry = createTelemetryData(25, 85.7);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts[0].message).toBe(
        'Humidity 85.7% exceeds maximum threshold 80%'
      );
    });
  });

  describe('Data Type Validation', () => {
    it('should handle decimal values correctly', () => {
      // Arrange
      const telemetry = createTelemetryData(30.1, 80.1);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(2);
      expect(alerts[0].value).toBe(30.1);
      expect(alerts[1].value).toBe(80.1);
    });

    it('should handle zero values', () => {
      // Arrange
      const telemetry = createTelemetryData(0, 0);
      const threshold = createThreshold(30, 10, 80, 20);

      // Act
      const alerts = evaluateAlert(telemetry, threshold);

      // Assert
      expect(alerts).toHaveLength(2);
      expect(alerts.some(alert => alert.type === 'temperature_low')).toBe(true);
      expect(alerts.some(alert => alert.type === 'humidity_low')).toBe(true);
    });
  });

  describe('COPILOT_PRIMER.md Compliance', () => {
    it('should meet acceptance criteria: generate alerts when thresholds exceeded', () => {
      // Test case from COPILOT_PRIMER.md requirements
      const telemetry = createTelemetryData(32, 85);
      const threshold = createThreshold(30, 15, 80, 30);

      const alerts = evaluateAlert(telemetry, threshold);

      // Should create 2 alerts (temp high + humidity high)
      expect(alerts).toHaveLength(2);
      expect(alerts.some(alert => alert.type === 'temperature_high')).toBe(true);
      expect(alerts.some(alert => alert.type === 'humidity_high')).toBe(true);
    });

    it('should meet acceptance criteria: no alerts when within thresholds', () => {
      // Test normal operating conditions
      const telemetry = createTelemetryData(25, 60);
      const threshold = createThreshold(30, 15, 80, 30);

      const alerts = evaluateAlert(telemetry, threshold);

      // Should not create any alerts
      expect(alerts).toHaveLength(0);
    });

    it('should include all required alert properties per COPILOT_PRIMER.md', () => {
      const telemetry = createTelemetryData(35, 60);
      const threshold = createThreshold(30, 10, 80, 20);

      const alerts = evaluateAlert(telemetry, threshold);

      expect(alerts[0]).toHaveProperty('id');
      expect(alerts[0]).toHaveProperty('deviceId');
      expect(alerts[0]).toHaveProperty('type');
      expect(alerts[0]).toHaveProperty('value');
      expect(alerts[0]).toHaveProperty('threshold');
      expect(alerts[0]).toHaveProperty('timestamp');
      expect(alerts[0]).toHaveProperty('acknowledged');
      expect(alerts[0]).toHaveProperty('message');
    });
  });
});