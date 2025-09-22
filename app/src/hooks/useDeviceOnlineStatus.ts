import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { env } from '@/config/env';

export function useDeviceOnlineStatus() {
  const { devices, setDeviceOnlineStatus } = useDashboardStore();

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      devices.forEach(device => {
        // Check if device hasn't sent data for more than OFFLINE_TIMEOUT (5s)
        const timeSinceLastSeen = now - device.lastSeen;
        const shouldBeOffline = timeSinceLastSeen > env.OFFLINE_TIMEOUT;
        
        if (device.status === 'online' && shouldBeOffline) {
          console.log(`Device ${device.id} went offline (${timeSinceLastSeen}ms since last seen)`);
          setDeviceOnlineStatus(device.id, false);
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(checkInterval);
  }, [devices, setDeviceOnlineStatus]);
}