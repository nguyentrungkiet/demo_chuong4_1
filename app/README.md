# Frontend App

React + TypeScript + Vite application cho IoT Dashboard

## Cài đặt

```bash
npm install
```

## Chạy development

```bash
npm run dev
```

## Environment Variables

Sao chép `.env.example` thành `.env` và chỉnh sửa:

```bash
cp .env.example .env
```

### Cấu hình quan trọng:

- `VITE_CONNECTION_MODE`: `mqtt` hoặc `websocket` 
- `VITE_MQTT_BROKER_URL`: URL broker MQTT (ws://localhost:9001)
- `VITE_WS_MOCK_URL`: URL WebSocket mock (ws://localhost:3002)
- `VITE_API_BASE_URL`: URL backend API (http://localhost:3001/api)

## Cấu trúc thư mục

```
src/
├── components/     # UI components
├── pages/         # Route pages  
├── store/         # Zustand stores
├── hooks/         # Custom hooks (BƯỚC 2)
├── lib/           # Utilities
├── types/         # TypeScript types
└── config/        # Environment config
```

## Công nghệ

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Recharts** - Charts (BƯỚC 2)
- **shadcn/ui** - UI components
- **react-hot-toast** - Notifications
- **MQTT.js** - MQTT client (BƯỚC 2)