import { useParams } from 'react-router-dom';

export function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Device {deviceId}
        </h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-muted-foreground">
          Device detail page will be implemented in BƯỚC 2
        </p>
      </div>
    </div>
  );
}