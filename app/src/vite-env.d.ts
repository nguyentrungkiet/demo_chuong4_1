/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONNECTION_MODE: string
  readonly VITE_MQTT_BROKER_URL: string
  readonly VITE_MQTT_CLIENT_ID: string
  readonly VITE_WS_MOCK_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEFAULT_DEVICE_ID: string
  readonly VITE_MAX_DATA_POINTS: string
  readonly VITE_OFFLINE_TIMEOUT: string
  readonly VITE_DEFAULT_TEMP_MAX: string
  readonly VITE_DEFAULT_TEMP_MIN: string
  readonly VITE_DEFAULT_HUMIDITY_MAX: string
  readonly VITE_DEFAULT_HUMIDITY_MIN: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}