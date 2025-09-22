# IoT Dashboard Frontend

Modern React + TypeScript frontend application với real-time monitoring, interactive charts, và comprehensive alert system cho IoT device management.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│               Frontend Stack                │
├─────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite              │
│  ├── TailwindCSS (Styling)                 │
│  ├── shadcn/ui (Components)                │
│  ├── Zustand (State Management)            │
│  ├── Recharts (Data Visualization)         │
│  ├── react-hot-toast (Notifications)       │
│  └── Vitest (Testing Framework)            │
└─────────────────────────────────────────────┘
                    │
          ┌─────────▼─────────┐
          │   Communication   │
          │ WebSocket + MQTT  │
          │   Port: 3001      │
          └───────────────────┘
```

## 🚀 Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Component Architecture

### Core Components

#### `DeviceCard.tsx`
Real-time device status và telemetry display
```typescript
interface DeviceCardProps {
  device: Device;
  onToggleLed: (deviceId: string) => void;
}
```

**Features:**
- Live temperature/humidity readings
- Device online/offline status
- LED control button
- Connection status indicator

#### `Charts.tsx`
Interactive real-time data visualization
```typescript
interface ChartsProps {
  data: TelemetryData[];
  timeRange: '1h' | '6h' | '24h';
}
```

**Features:**
- Real-time line charts với Recharts
- Temperature và humidity trends
- Customizable time ranges
- Responsive design

#### `AlertPanel.tsx`
Alert notification và management system
```typescript
interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onClear: (alertId: string) => void;
}
```

**Features:**
- Real-time alert notifications
- Alert severity levels
- Acknowledge/dismiss functionality
- Alert history tracking

#### `Header.tsx`
Application navigation và status
```typescript
interface HeaderProps {
  connectedDevices: number;
  activeAlerts: number;
}
```

### UI Components (shadcn/ui)

Pre-built, customizable components:
- `Button` - Interactive buttons với variants
- `Card` - Content containers với consistent styling
- `Badge` - Status indicators và labels

## 📁 Project Structure

```
app/
├── src/
│   ├── components/           # React components
│   │   ├── DeviceCard.tsx   # Device status cards
│   │   ├── Charts.tsx       # Data visualization
│   │   ├── AlertPanel.tsx   # Alert management
│   │   ├── Header.tsx       # Navigation header
│   │   └── ui/              # shadcn/ui components
│   │       ├── button.tsx   # Button component
│   │       ├── card.tsx     # Card component
│   │       └── badge.tsx    # Badge component
│   ├── hooks/               # Custom React hooks
│   │   ├── useAlertSystem.ts        # Alert evaluation logic
│   │   ├── useMqttConnection.ts     # MQTT real-time data
│   │   ├── useWebSocketConnection.ts # WebSocket connection
│   │   ├── useDeviceOnlineStatus.ts # Device status tracking
│   │   └── useRealtimeConnection.ts # Unified real-time hook
│   ├── pages/               # Application pages
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── DeviceDetail.tsx # Individual device details
│   │   └── Settings.tsx     # Configuration settings
│   ├── store/               # State management
│   │   └── dashboard.ts     # Zustand global store
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Shared type definitions
│   ├── config/              # Configuration
│   │   └── env.ts           # Environment variables
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # Helper functions
│   └── __tests__/           # Test suite
│       ├── setup.ts         # Test configuration
│       └── useAlertSystem.test.ts # Alert system tests
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies và scripts
├── tailwind.config.js      # TailwindCSS configuration
├── vite.config.ts          # Vite build configuration
├── vitest.config.ts        # Test configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎯 Key Features

### Real-time Data Monitoring
- Live telemetry updates via WebSocket
- MQTT fallback for direct device communication
- Automatic reconnection với exponential backoff
- Data persistence across reconnections

### Interactive Dashboard
- Multi-device monitoring grid
- Customizable chart time ranges
- Responsive design cho mobile/desktop
- Dark/light theme support (ready)

### Alert System
- Real-time threshold monitoring
- Multiple alert types (temperature_high, temperature_low, humidity_high, humidity_low)
- Visual notifications với react-hot-toast
- Alert acknowledgment và history

### Device Control
- Remote LED control via MQTT
- Device status monitoring
- Connection health indicators
- Command feedback với acknowledgments

## 🔧 Custom Hooks

### `useAlertSystem`
Manages alert evaluation và notifications
```typescript
const {
  alerts,
  addAlert,
  acknowledgeAlert,
  clearAlert,
  evaluateAlerts
} = useAlertSystem();
```

### `useMqttConnection`
Handles MQTT real-time communication
```typescript
const {
  isConnected,
  messages,
  subscribe,
  publish,
  error
} = useMqttConnection(brokerUrl);
```

### `useWebSocketConnection`
WebSocket fallback communication
```typescript
const {
  isConnected,
  data,
  sendMessage,
  error
} = useWebSocketConnection(wsUrl);
```

### `useDeviceOnlineStatus`
Tracks device connectivity status
```typescript
const {
  deviceStatuses,
  updateDeviceStatus,
  getDeviceStatus
} = useDeviceOnlineStatus();
```

## 🧪 Testing Strategy

### Test Coverage
- **21 comprehensive test cases** cho alert evaluation logic
- Component testing với React Testing Library
- Hook testing với @testing-library/react-hooks
- End-to-end testing setup (ready for implementation)

### Running Tests
```bash
# Run all tests
npm test

# Run tests với coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🚀 Development Commands

```bash
# Development server với hot reload
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/nguyentrungkiet/demo_chuong4_1/issues)
- **Documentation:** Check main [README.md](../README.md)
- **Backend API:** See [server/README.md](../server/README.md)
- **Hardware Setup:** See [firmware/README.md](../firmware/README.md)

---

Built with ❤️ using React + TypeScript + Vite

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