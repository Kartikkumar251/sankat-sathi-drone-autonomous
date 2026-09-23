# 🏗️ SankatSathi - System Architecture & Engineering Design

This document details the architectural blueprint of **SankatSathi (संकटसाथी)**, covering hardware-software partitioning, data flow pipelines, fail-safe mechanisms, and software component interactions.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph "Aerial Drone Platform (Hardware)"
        FC[PX4 / Pixhawk Flight Controller]
        SENS[Sensors: RTK GNSS, LiDAR, IMU, Barometer]
        CAM[Dual Camera: RGB Optical + Thermal IR]
        JET[NVIDIA Jetson Companion Computer]
        
        SENS --> FC
        FC <--> |MAVLink / Serial| JET
        CAM --> |CSI / USB Stream| JET
    end

    subgraph "Edge AI Vision Pipeline (ml/)"
        JET --> YOLO[YOLOv5n Inference Engine]
        YOLO --> DET[Object & Survivor Detection Service]
        DET --> API[FastAPI Telemetry & Vision Server]
    end

    subgraph "Ground Command & Control (Web UI)"
        API <--> |HTTP / WebSocket / JSON| GCS[React 19 + TypeScript Command Center]
        GCS --> MAP[Tactical Leaflet GIS & Grid Matrix]
        GCS --> HUD[Avionics HUD & LiDAR Radar]
        GCS --> AI_UI[Live Optical & Thermal Video Monitor]
        GCS --> SITREP[Automated NDRF SITREP Generator]
    end
```

---

## 2. Component Breakdown

### 2.1 Flight Controller Layer (PX4 Autopilot)
- **Primary Responsibility**: Low-level motor control, orientation stabilization (gyro/accel EKF2 filter), waypoint navigation, and safety failsafes (Low Battery RTL, Geo-fence breach).
- **Decoupled Architecture**: Even if the edge AI companion computer experiences an unexpected freeze or reset, the flight controller independently maintains stable flight and RTL capability.

### 2.2 Edge AI Vision & Telemetry Engine (`ml/`)
- **Modules**:
  - `model_engine.py`: Encapsulates YOLOv5n neural network loading on CUDA or CPU, handles PIL/Base64 pre-processing, non-maximum suppression (NMS), and maps raw classes into tactical rescue designations.
  - `server.py`: FastAPI web service exposing REST endpoints for health checks, batch imagery inference, and live stream frame processing.

### 2.3 Ground Control Web Interface (`src/`)
- **Modules**:
  - `context/DroneContext.tsx`: Centralized reactive state store managing drone telemetry, waypoints, search sectors, survivor triage entries, active hazard zones, and SIH simulation sequences.
  - `components/Map/`: Tactical GIS mapping utilizing Leaflet with custom dark styling, heading vector rotation, survivor pins, hazard polygon geometry, and grid coverage trackers.
  - `components/Telemetry/`: Canvas HUD gauges, artificial horizon, vertical speed indicators, battery metrics, and LiDAR obstacle proximity warnings.
  - `components/VideoFeed/`: Simulated video streaming with synchronized YOLO bounding box overlays and thermal color lookup table filters.
  - `components/SITREP/`: Instant disaster incident reports with PDF and JSON export triggers.
  - `services/aiDetectionService.ts`: Client API layer communicating with `ml/server.py` at `http://127.0.0.1:8000`.

---

## 3. Data Flow & Communication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant D as Drone Sensors & Camera
    participant J as Edge ML Server (FastAPI)
    participant C as Command Center (React UI)
    participant Cmd as Incident Commander

    D->>J: Stream RGB Frames & Avionics Telemetry
    J->>J: Run YOLOv5n Neural Detection
    J->>C: Push Detections + Latency + BBoxes
    C->>C: Render HUD, Update Tactical Map & Grid Sector
    Note over C: Survivor Detected (e.g., Confidence 94.2%)
    C->>Cmd: Trigger Audio Alert & Highlight Triage Sector
    Cmd->>C: Click "Generate SITREP Report"
    C->>Cmd: Export NDRF Standard Incident Brief (JSON / PDF)
```

---

## 4. Disaster Triage & Hazard Mapping Taxonomy

| Category | Tactical Visual | Alert Priority | Recommended Field Action |
|---|---|---|---|
| **Survivor Confirmed** | 🟢 Emerald Pin | Critical (P1) | Immediate rescue squad dispatch via verified corridor. |
| **High Voltage 11kV** | ⚡ Amber Pulsing Line | High (P2) | Mark 15m safety exclusion zone for ground teams. |
| **Active Fire Hazard** | 🔥 Red Gradient Fill | High (P2) | Coordinate aerial fire suppression or buffer routing. |
| **Structural Collapse** | 🛑 Striped Hazard Polygon | Medium (P3) | Deploy acoustic search probes and canine units. |
