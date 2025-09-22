import { Router, Request, Response } from 'express';
import { DataPoint, HistoryResponse, ApiResponse } from '../types';

const router = Router();

// In-memory telemetry data storage (replace with database in production)
const telemetryData = new Map<string, DataPoint[]>(); // deviceId -> DataPoint[]

/**
 * GET /api/history/:deviceId
 * Get historical telemetry data for a device
 */
router.get('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { from, to, limit = 100, page = 1 } = req.query as any;
    
    let deviceData = telemetryData.get(deviceId) || [];
    
    // Filter by time range if provided
    if (from || to) {
      const fromTs = from ? parseInt(from as string) : 0;
      const toTs = to ? parseInt(to as string) : Date.now();
      
      deviceData = deviceData.filter(point => 
        point.timestamp >= fromTs && point.timestamp <= toTs
      );
    }
    
    // Sort by timestamp (newest first)
    deviceData.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = deviceData.slice(startIndex, endIndex);
    
    const response: ApiResponse<HistoryResponse> = {
      success: true,
      data: {
        deviceId,
        data: paginatedData,
        total: deviceData.length,
        page: pageNum,
        limit: limitNum,
      },
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
 * GET /api/history
 * Get historical data for all devices or filtered by query
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { deviceId, from, to, limit = 100, page = 1 } = req.query as any;
    
    let allData: { deviceId: string; data: DataPoint[] }[] = [];
    
    if (deviceId) {
      // Single device
      const deviceData = telemetryData.get(deviceId as string) || [];
      allData = [{ deviceId: deviceId as string, data: deviceData }];
    } else {
      // All devices
      for (const [devId, data] of telemetryData.entries()) {
        allData.push({ deviceId: devId, data });
      }
    }
    
    // Apply time filtering and combine data
    let combinedData: (DataPoint & { deviceId: string })[] = [];
    
    allData.forEach(({ deviceId: devId, data }) => {
      let filteredData = data;
      
      if (from || to) {
        const fromTs = from ? parseInt(from as string) : 0;
        const toTs = to ? parseInt(to as string) : Date.now();
        
        filteredData = data.filter(point => 
          point.timestamp >= fromTs && point.timestamp <= toTs
        );
      }
      
      combinedData.push(...filteredData.map(point => ({ ...point, deviceId: devId })));
    });
    
    // Sort by timestamp (newest first)
    combinedData.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = combinedData.slice(startIndex, endIndex);
    
    const response: ApiResponse<{
      data: (DataPoint & { deviceId: string })[];
      total: number;
      page: number;
      limit: number;
    }> = {
      success: true,
      data: {
        data: paginatedData,
        total: combinedData.length,
        page: pageNum,
        limit: limitNum,
      },
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
 * POST /api/history/:deviceId
 * Add telemetry data point (used by MQTT bridge and WS mock)
 */
router.post('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { timestamp, temperature, humidity } = req.body;
    
    if (!timestamp || temperature === undefined || humidity === undefined) {
      const badRequestResponse: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: timestamp, temperature, humidity',
        timestamp: Date.now(),
      };
      
      return res.status(400).json(badRequestResponse);
    }
    
    const dataPoint: DataPoint = {
      timestamp: parseInt(timestamp),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
    };
    
    addTelemetryData(deviceId, dataPoint);
    
    const response: ApiResponse<DataPoint> = {
      success: true,
      data: dataPoint,
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

// Helper function to add telemetry data
export function addTelemetryData(deviceId: string, dataPoint: DataPoint): void {
  if (!telemetryData.has(deviceId)) {
    telemetryData.set(deviceId, []);
  }
  
  const deviceData = telemetryData.get(deviceId)!;
  deviceData.push(dataPoint);
  
  // Keep only last 500 data points per device (match frontend buffer)
  if (deviceData.length > 500) {
    deviceData.splice(0, deviceData.length - 500);
  }
}

// Helper function to get telemetry data
export function getTelemetryData(deviceId: string): DataPoint[] {
  return telemetryData.get(deviceId) || [];
}

export default router;
