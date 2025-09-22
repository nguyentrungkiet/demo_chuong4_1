import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/store/dashboard';
import { Alert } from '@/types';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export function AlertPanel() {
  const { alerts, acknowledgeAlert, clearAlert } = useDashboardStore();
  
  const sortedAlerts = alerts
    .sort((a, b) => b.timestamp - a.timestamp) // Latest first
    .slice(0, 10); // Show last 10 alerts

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId);
  };

  const handleClear = (alertId: string) => {
    clearAlert(alertId);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertColor = (alert: Alert) => {
    if (alert.acknowledged) return 'secondary';
    return alert.type.includes('temperature') ? 'destructive' : 'default';
  };

  const getAlertIcon = (alert: Alert) => {
    if (alert.acknowledged) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive">
              {unacknowledgedCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No alerts yet
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getAlertColor(alert)} className="text-xs">
                      {alert.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {alert.deviceId}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatTime(alert.timestamp)}
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex gap-1">
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="text-xs px-2 py-1"
                    >
                      ACK
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleClear(alert.id)}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {alerts.length > 10 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              View All Alerts ({alerts.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}