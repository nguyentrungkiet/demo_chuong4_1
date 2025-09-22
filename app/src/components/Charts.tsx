import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/store/dashboard';
import { DataPoint } from '@/types';

interface TemperatureChartProps {
  deviceId?: string;
  height?: number;
}

export function TemperatureChart({ deviceId, height = 300 }: TemperatureChartProps) {
  const { getTelemetryBuffer } = useDashboardStore();
  
  // Get data for specific device or all devices
  const data = deviceId ? 
    getTelemetryBuffer(deviceId) : 
    getAllDevicesData('temperature');
    
  const formatData = (dataPoints: DataPoint[]) => {
    return dataPoints
      .slice(-50) // Show last 50 points for better performance
      .map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        temperature: point.temperature,
        timestamp: point.timestamp,
      }));
  };

  const chartData = formatData(data);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'temperature') {
      return [`${Number(value).toFixed(1)}°C`, 'Temperature'];
    }
    return [value, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 12 }}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No temperature data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HumidityChart({ deviceId, height = 300 }: TemperatureChartProps) {
  const { getTelemetryBuffer } = useDashboardStore();
  
  const data = deviceId ? 
    getTelemetryBuffer(deviceId) : 
    getAllDevicesData('humidity');
    
  const formatData = (dataPoints: DataPoint[]) => {
    return dataPoints
      .slice(-50)
      .map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        humidity: point.humidity,
        timestamp: point.timestamp,
      }));
  };

  const chartData = formatData(data);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'humidity') {
      return [`${Number(value).toFixed(1)}%`, 'Humidity'];
    }
    return [value, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Humidity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: '%', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No humidity data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to combine data from all devices
function getAllDevicesData(_type: 'temperature' | 'humidity'): DataPoint[] {
  // This will be implemented when we have access to all devices data
  // For now, return empty array
  return [];
}