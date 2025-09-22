export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Settings */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Connection Mode</label>
              <div className="mt-1 text-muted-foreground text-sm">
                MQTT or WebSocket mock configuration will be implemented in BƯỚC 2
              </div>
            </div>
          </div>
        </div>
        
        {/* Alert Thresholds */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Thresholds</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Temperature & Humidity Limits</label>
              <div className="mt-1 text-muted-foreground text-sm">
                Threshold configuration will be implemented in BƯỚC 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}