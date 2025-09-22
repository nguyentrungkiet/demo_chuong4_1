import { Router, Request, Response } from 'express';
import { Alert, ApiResponse } from '../types';

const router = Router();

// In-memory alert storage (replace with database in production)
const alerts = new Map<string, Alert>();

/**
 * GET /api/alerts
 * Get all alerts
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { deviceId, acknowledged, type } = req.query;
    
    let alertList = Array.from(alerts.values());
    
    // Filter by device if specified
    if (deviceId) {
      alertList = alertList.filter(alert => alert.deviceId === deviceId);
    }
    
    // Filter by acknowledged status if specified
    if (acknowledged !== undefined) {
      const isAcknowledged = acknowledged === 'true';
      alertList = alertList.filter(alert => alert.acknowledged === isAcknowledged);
    }
    
    // Filter by type if specified
    if (type) {
      alertList = alertList.filter(alert => alert.type === type);
    }
    
    // Sort by timestamp (newest first)
    alertList.sort((a, b) => b.timestamp - a.timestamp);
    
    const response: ApiResponse<Alert[]> = {
      success: true,
      data: alertList,
      timestamp: Date.now(),
    };
    
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    return res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/alerts/:alertId
 * Get specific alert
 */
router.get('/:alertId', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = alerts.get(alertId);
    
    if (!alert) {
      const notFoundResponse: ApiResponse<null> = {
        success: false,
        error: `Alert ${alertId} not found`,
        timestamp: Date.now(),
      };
      
      return res.status(404).json(notFoundResponse);
    }
    
    const response: ApiResponse<Alert> = {
      success: true,
      data: alert,
      timestamp: Date.now(),
    };
    
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    return res.status(500).json(errorResponse);
  }
});

/**
 * POST /api/alerts/:alertId/ack
 * Acknowledge an alert
 */
router.post('/:alertId/ack', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = alerts.get(alertId);
    
    if (!alert) {
      const notFoundResponse: ApiResponse<null> = {
        success: false,
        error: `Alert ${alertId} not found`,
        timestamp: Date.now(),
      };
      
      return res.status(404).json(notFoundResponse);
    }
    
    // Update alert acknowledgment
    const updatedAlert: Alert = {
      ...alert,
      acknowledged: true,
    };
    
    alerts.set(alertId, updatedAlert);
    
    const response: ApiResponse<Alert> = {
      success: true,
      data: updatedAlert,
      timestamp: Date.now(),
    };
    
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    return res.status(500).json(errorResponse);
  }
});

/**
 * DELETE /api/alerts/:alertId
 * Clear/delete an alert
 */
router.delete('/:alertId', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const deleted = alerts.delete(alertId);
    
    if (!deleted) {
      const notFoundResponse: ApiResponse<null> = {
        success: false,
        error: `Alert ${alertId} not found`,
        timestamp: Date.now(),
      };
      
      return res.status(404).json(notFoundResponse);
    }
    
    const response: ApiResponse<{ alertId: string }> = {
      success: true,
      data: { alertId },
      timestamp: Date.now(),
    };
    
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    return res.status(500).json(errorResponse);
  }
});

/**
 * POST /api/alerts
 * Create new alert (used by alert evaluation system)
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id,
      deviceId,
      type,
      value,
      threshold,
      timestamp,
      message
    } = req.body;
    
    if (!id || !deviceId || !type || value === undefined || !threshold || !timestamp || !message) {
      const badRequestResponse: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: id, deviceId, type, value, threshold, timestamp, message',
        timestamp: Date.now(),
      };
      
      return res.status(400).json(badRequestResponse);
    }
    
    const alert: Alert = {
      id,
      deviceId,
      type,
      value: parseFloat(value),
      threshold: parseFloat(threshold),
      timestamp: parseInt(timestamp),
      acknowledged: false,
      message,
    };
    
    alerts.set(alert.id, alert);
    
    const response: ApiResponse<Alert> = {
      success: true,
      data: alert,
      timestamp: Date.now(),
    };
    
    res.status(201).json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    return res.status(500).json(errorResponse);
  }
});

// Helper function to add alert (used by MQTT bridge and WS mock)
export function addAlert(alert: Alert): void {
  alerts.set(alert.id, alert);
}

// Helper function to get unacknowledged alerts
export function getUnacknowledgedAlerts(): Alert[] {
  return Array.from(alerts.values()).filter(alert => !alert.acknowledged);
}

export default router;
