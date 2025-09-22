import { Link } from 'react-router-dom';
import { useDashboardStore, selectConnectionStatus, selectOnlineDevices } from '@/store/dashboard';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const connectionStatus = useDashboardStore(selectConnectionStatus);
  const onlineDevices = useDashboardStore(selectOnlineDevices);
  
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary">
              IoT Dashboard
            </Link>
            <div className="text-sm text-muted-foreground">
              ESP32-C3/S3 Monitor
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium",
              isConnected ? "bg-green-100 text-green-800" : 
              isConnecting ? "bg-yellow-100 text-yellow-800" : 
              "bg-red-100 text-red-800"
            )}>
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span>
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>

            {/* Online Devices Count */}
            <div className="text-sm text-muted-foreground">
              {onlineDevices.length} device{onlineDevices.length !== 1 ? 's' : ''} online
            </div>

            {/* Settings Button */}
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}