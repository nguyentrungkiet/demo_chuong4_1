import { useDashboardStore, selectDevices } from '@/store/dashboard';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { DeviceCard } from '@/components/DeviceCard';
import { TemperatureChart, HumidityChart } from '@/components/Charts';
import { AlertPanel } from '@/components/AlertPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function Dashboard() {
  const devices = useDashboardStore(selectDevices);
  const { connect, disconnect, isConnected, connectionMode } = useRealtimeConnection();
  
  const onlineDevices = devices.filter(device => device.status === 'online');
  const offlineDevices = devices.filter(device => device.status === 'offline');

  const handleConnectionToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of ESP32-C3/S3 devices
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {connectionMode === 'mqtt' ? 'MQTT' : 'WebSocket'} 
            {isConnected ? ' Connected' : ' Disconnected'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnectionToggle}
            className="flex items-center gap-2"
          >
            {isConnected ? (
              <>
                <WifiOff className="h-4 w-4" />
                Disconnect
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Total Devices</div>
          <div className="text-2xl font-bold">{devices.length}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Online</div>
          <div className="text-2xl font-bold text-green-600">{onlineDevices.length}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Offline</div>
          <div className="text-2xl font-bold text-gray-500">{offlineDevices.length}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Mode</div>
          <div className="text-2xl font-bold capitalize">{connectionMode}</div>
        </div>
      </div>
      
      {/* Device Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
        {devices.length === 0 ? (
          <div className="col-span-full">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
              <p className="text-muted-foreground mb-4">
                {isConnected 
                  ? 'Waiting for ESP32 devices to connect...' 
                  : 'Connect to MQTT broker or start WebSocket mock to see devices'
                }
              </p>
              {!isConnected && (
                <Button onClick={handleConnectionToggle} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Connect Now
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TemperatureChart />
        <HumidityChart />
      </div>
      
      {/* Alerts Panel */}
      <AlertPanel />
    </div>
  );
}