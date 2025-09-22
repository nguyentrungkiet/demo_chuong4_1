# ⚠️ COPILOT: READ ME FIRST — IoT Web Dashboard (ESP32-C3/S3)

<!-- COPILOT: ALWAYS READ THIS FILE FIRST BEFORE WRITING ANY CODE -->

**Bạn là GitHub Copilot.** Hãy đọc file này **trước** khi tạo bất kỳ mã nguồn nào trong repo.

## 1) Mục tiêu demo
- Xây dựng **Dashboard Web** giám sát **nhiệt độ, độ ẩm** theo thời gian thực và **điều khiển LED** của ESP32-C3/S3.
- Có **cảnh báo vượt ngưỡng** (UI highlight + toast), cho phép **đổi ngưỡng** ngay trên Dashboard.
- Chạy được **offline trong lớp học** (có chế độ **WS mock** nếu chưa có phần cứng/MQTT broker).

## 2) Thiết bị & cảm biến
- Bo: **ESP32-C3** hoặc **ESP32-S3**.
- LED: dùng 1 GPIO (mặc định `GPIO 2`, chỉnh trong `config.h`).
- Cảm biến: **DHT22 (AM2302)** cho nhiệt độ/độ ẩm (mặc định `GPIO 4`).
- Không có phần cứng? Dùng **WebSocket mock** phía server mô phỏng telemetry.

## 3) Kiến trúc & công nghệ
- **Frontend**: React + TypeScript (Vite), TailwindCSS, Zustand, Recharts, shadcn/ui, react-hot-toast.
- **Realtime**:
  - MQTT over WebSocket (`mqtt.js`) với broker (ví dụ Mosquitto `ws://localhost:9001`), **hoặc**
  - **WS mock** (Node `ws`) để dạy offline.
- **Backend**: Node + Express (REST) + MQTT bridge **hoặc** WS mock.
- **Firmware**: Arduino (ESP32 core), PubSubClient (MQTT), ArduinoJson, DHT sensor lib.

## 4) Chủ đề (MQTT topics) & payload
- **Telemetry (thiết bị → dashboard)**  
  Topic: `iot/classroom/<deviceId>/telemetry`  
  Payload:
  ```json
  {
    "ts": 1690000000000,
    "temperature": 31.5,
    "humidity": 52.3,
    "led": false,
    "deviceId": "c3-01"
  }
