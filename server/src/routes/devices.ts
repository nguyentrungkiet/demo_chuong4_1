import { Router, Request, Response } from 'express';
import { Device, ApiResponse } from '../types';

const router = Router();

// In-memory device storage (replace with database in production)
const devices = new Map<string, Device>();

// Sample devices for demo
const sampleDevices: Device[] = [
  {
    id: 'c3-01',
    name: 'ESP32-C3 Kitchen',
    status: 'offline',
    lastSeen: Date.now() - 10000,
  },
  {
    id: 's3-01', 
    name: 'ESP32-S3 Living Room',
    status: 'offline',
    lastSeen: Date.now() - 15000,
  }
];

// Initialize sample devices
sampleDevices.forEach(device => devices.set(device.id, device));

/**
 * GET /api/devices
 * Get all registered devices
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const deviceList = Array.from(devices.values());
    
    const response: ApiResponse<Device[]> = {
      success: true,
      data: deviceList,
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
 * GET /api/devices/:deviceId
 * Get specific device information
 */
router.get('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const device = devices.get(deviceId);
    
    if (!device) {
      const notFoundResponse: ApiResponse<null> = {
        success: false,
        error: `Device ${deviceId} not found`,
        timestamp: Date.now(),
      };
      
      return res.status(404).json(notFoundResponse);
    }
    
    const response: ApiResponse<Device> = {
      success: true,
      data: device,
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
 * POST /api/devices/:deviceId
 * Register or update device
 */
router.post('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { name, status } = req.body;
    
    const existingDevice = devices.get(deviceId);
    const device: Device = {
      id: deviceId,
      name: name || existingDevice?.name || `ESP32-${deviceId}`,
      status: status || 'offline',
      lastSeen: Date.now(),
      currentData: existingDevice?.currentData,
    };
    
    devices.set(deviceId, device);
    
    const response: ApiResponse<Device> = {
      success: true,
      data: device,
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
 * DELETE /api/devices/:deviceId
 * Remove device
 */
router.delete('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const deleted = devices.delete(deviceId);
    
    if (!deleted) {
      const notFoundResponse: ApiResponse<null> = {
        success: false,
        error: `Device ${deviceId} not found`,
        timestamp: Date.now(),
      };
      
      return res.status(404).json(notFoundResponse);
    }
    
    const response: ApiResponse<{ deviceId: string }> = {
      success: true,
      data: { deviceId },
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

// Helper function to update device (used by MQTT bridge and WS mock)
export function updateDevice(deviceData: Partial<Device> & { id: string }): Device {
  const existingDevice = devices.get(deviceData.id);
  const device: Device = {
    id: deviceData.id,
    name: deviceData.name || existingDevice?.name || `ESP32-${deviceData.id}`,
    status: deviceData.status || existingDevice?.status || 'offline',
    lastSeen: Date.now(),
    currentData: deviceData.currentData || existingDevice?.currentData,
  };
  
  devices.set(device.id, device);
  return device;
}

// Helper function to get device
export function getDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}

export default router;
