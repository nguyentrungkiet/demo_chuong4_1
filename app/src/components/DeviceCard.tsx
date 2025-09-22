import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Device } from '@/types';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { useDashboardStore } from '@/store/dashboard';
import { cn } from '@/lib/utils';
import { 
  Thermometer, 
  Droplets, 
  Lightbulb, 
  LightbulbOff, 
  Wifi, 
  WifiOff,
  AlertTriangle 
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const { toggleLed } = useRealtimeConnection();
  const { getThreshold, getUnacknowledgedAlerts } = useDashboardStore();
  
  const threshold = getThreshold(device.id);
  const alerts = getUnacknowledgedAlerts().filter(alert => alert.deviceId === device.id);
  
  const hasTemperatureAlert = alerts.some(alert => 
    alert.type === 'temperature_high' || alert.type === 'temperature_low'
  );
  const hasHumidityAlert = alerts.some(alert => 
    alert.type === 'humidity_high' || alert.type === 'humidity_low'
  );
  
  const handleLedToggle = () => {
    toggleLed(device.id);
  };
  
  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };
  
  const isOnline = device.status === 'online';
  const currentData = device.currentData;
  
  return (
    <Card className={cn(
      "transition-all duration-200",
      isOnline ? "border-green-200 shadow-sm" : "border-gray-200",
      isOnline && "online-glow"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            {device.name}
          </CardTitle>
          
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        
        {alerts.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            {alerts.length} alert{alerts.length > 1 ? 's' : ''}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentData ? (
          <>
            {/* Temperature */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              hasTemperatureAlert ? "temperature-high" : "bg-blue-50 border-blue-200"
            )}>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Temperature</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {formatValue(currentData.temperature, '°C')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {threshold?.temperatureMin ?? 0}°C - {threshold?.temperatureMax ?? 50}°C
                </div>
              </div>
            </div>
            
            {/* Humidity */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              hasHumidityAlert ? "humidity-high" : "bg-cyan-50 border-cyan-200"
            )}>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">Humidity</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {formatValue(currentData.humidity, '%')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {threshold?.humidityMin ?? 0}% - {threshold?.humidityMax ?? 100}%
                </div>
              </div>
            </div>
            
            {/* LED Control */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
              <div className="flex items-center gap-2">
                {currentData.led ? (
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                ) : (
                  <LightbulbOff className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium">LED Status</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={currentData.led ? "default" : "secondary"}>
                  {currentData.led ? "ON" : "OFF"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLedToggle}
                  disabled={!isOnline}
                >
                  Toggle
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {isOnline ? 'Waiting for data...' : 'Device offline'}
          </div>
        )}
        
        {/* Last Seen */}
        <div className="text-xs text-muted-foreground text-center">
          Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}