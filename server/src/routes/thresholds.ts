import { Router, Request, Response } from 'express';
import { Threshold, ThresholdRequest, ApiResponse } from '../types';

const router = Router();

// In-memory threshold storage (replace with database in production)
const thresholds = new Map<string, Threshold>();

// Default thresholds
const DEFAULT_THRESHOLD: Omit<Threshold, 'deviceId'> = {
  temperatureMax: 35.0,
  temperatureMin: 15.0,
  humidityMax: 80.0,
  humidityMin: 30.0,
};

/**
 * GET /api/thresholds
 * Get all device thresholds
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const thresholdList = Array.from(thresholds.values());
    
    const response: ApiResponse<Threshold[]> = {
      success: true,
      data: thresholdList,
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
 * GET /api/thresholds/:deviceId
 * Get threshold for specific device
 */
router.get('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    let threshold = thresholds.get(deviceId);
    
    // Return default threshold if not set
    if (!threshold) {
      threshold = {
        deviceId,
        ...DEFAULT_THRESHOLD,
      };
    }
    
    const response: ApiResponse<Threshold> = {
      success: true,
      data: threshold,
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
 * POST /api/thresholds/:deviceId
 * Set or update threshold for device
 */
router.post('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const {
      temperatureMax,
      temperatureMin,
      humidityMax,
      humidityMin
    }: Partial<ThresholdRequest> = req.body;
    
    // Get existing threshold or use defaults
    const existingThreshold = thresholds.get(deviceId) || {
      deviceId,
      ...DEFAULT_THRESHOLD,
    };
    
    // Update with provided values
    const updatedThreshold: Threshold = {
      deviceId,
      temperatureMax: temperatureMax !== undefined ? parseFloat(temperatureMax.toString()) : existingThreshold.temperatureMax,
      temperatureMin: temperatureMin !== undefined ? parseFloat(temperatureMin.toString()) : existingThreshold.temperatureMin,
      humidityMax: humidityMax !== undefined ? parseFloat(humidityMax.toString()) : existingThreshold.humidityMax,
      humidityMin: humidityMin !== undefined ? parseFloat(humidityMin.toString()) : existingThreshold.humidityMin,
    };
    
    // Validate thresholds
    if (updatedThreshold.temperatureMax <= updatedThreshold.temperatureMin) {
      const validationResponse: ApiResponse<null> = {
        success: false,
        error: 'Temperature max must be greater than min',
        timestamp: Date.now(),
      };
      
      return res.status(400).json(validationResponse);
    }
    
    if (updatedThreshold.humidityMax <= updatedThreshold.humidityMin) {
      const validationResponse: ApiResponse<null> = {
        success: false,
        error: 'Humidity max must be greater than min',
        timestamp: Date.now(),
      };
      
      return res.status(400).json(validationResponse);
    }
    
    thresholds.set(deviceId, updatedThreshold);
    
    const response: ApiResponse<Threshold> = {
      success: true,
      data: updatedThreshold,
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
 * DELETE /api/thresholds/:deviceId
 * Reset threshold to defaults
 */
router.delete('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    const defaultThreshold: Threshold = {
      deviceId,
      ...DEFAULT_THRESHOLD,
    };
    
    thresholds.set(deviceId, defaultThreshold);
    
    const response: ApiResponse<Threshold> = {
      success: true,
      data: defaultThreshold,
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

// Helper function to get threshold (used by alert evaluation)
export function getThreshold(deviceId: string): Threshold {
  return thresholds.get(deviceId) || {
    deviceId,
    ...DEFAULT_THRESHOLD,
  };
}

export default router;
