# 📄 Product Requirements Document (PRD)
## Project: SankatSathi (संकटसाथी) — AI Autonomous Search & Rescue Drone Command Center

---

## 1. Executive Summary & Vision
During major disasters (earthquakes, floods, structural collapses, wildfires), the initial **72-hour golden window** is decisive for saving human lives. Ground rescue squads face severe bottlenecks due to destroyed road networks, live debris hazards, unmapped environments, and limited aerial visibility.

**SankatSathi** is an AI-powered autonomous search and rescue (SAR) companion ecosystem designed for emergency disaster response agencies like the **National Disaster Response Force (NDRF)** and State Disaster Response Authorities (SDRF). It unifies:
1. Autonomous multi-copter aerial surveillance with PX4 autopilot flight telemetry.
2. Companion Edge AI (NVIDIA Jetson / YOLOv5n vision) for real-time human and hazard detection.
3. Interactive tactical GIS maps with automated sector-by-sector search coverage tracking.
4. Dynamic disaster hazard zoning (11kV live powerlines, flood inundations, structural collapse zones, gas leaks).
5. Instant Field Commander SITREP (Situation Report) generation with one-click PDF/JSON exports.

---

## 2. Target Personas & Stakeholders

| Persona | Role | Primary Goals / Use Cases |
|---|---|---|
| **Incident Commander (NDRF/SDRF)** | Oversees overall rescue operations at the tactical command post. | Live situational awareness, triage prioritization, safety corridor verification, automated SITREP generation. |
| **Drone Ground Pilot / Operator** | Manages autonomous drone flight path, RTK GPS telemetry, and safety overrides. | Mission planning, real-time battery/heading/LiDAR collision monitoring, manual override / RTL execution. |
| **Rescue Field Unit Leader** | Directs ground squads entering active collapse or flood zones. | Receives live GPS coordinates of verified survivors, hazardous barrier alerts, and safe ingress routes. |

---

## 3. Core Functional Requirements

### 3.1 Avionics Telemetry & Flight Dynamics
- **Real-Time Telemetry Gauges**: Display Altitude AGL (Above Ground Level), Ground Speed (m/s), Vertical Climb Rate (m/s), Heading Compass (0–360°), and 3-axis Attitude (Pitch, Roll, Yaw).
- **Power & System Health**: Battery Voltage (V), Current Draw (A), Battery Percentage indicator with adaptive color states (Normal > 40%, Warning 20-40%, Critical < 20%), and Estimated Remaining Flight Time.
- **LiDAR Collision Avoidance HUD**: Real-time forward laser rangefinder data displaying proximity warning zones (Safe > 3.0m, Caution 1.5m–3.0m, Critical Obstacle < 1.5m).
- **Navigation & Satellite Fix**: Multi-constellation RTK GNSS lock indicator (e.g. 16+ Satellites Locked) and autonomous GPS-denied Visual SLAM fallback mode.

### 3.2 Live Tactical GIS & Grid Matrix
- **Interactive High-Resolution Tactical Map**: Dark-mode cartography with drone position, heading vector, and real-time flight path trail breadcrumbs.
- **16-Sector Search Grid Matrix (`A1` through `D4`)**:
  - Automatically color-coded sectors: `SEARCHED` (Green), `SEARCHING` (Cyan pulse), `PENDING` (Slate), `HIGH RISK` (Red).
  - Calculated search coverage percentage counter across the entire designated disaster perimeter.
- **Survivor Triage Pins**:
  - Interactive map pins detailing timestamp, detected survivor count, physical condition assessment (e.g., Trapped under rubble, Conscious, Waving), triage urgency level, and coordinates.
- **Dynamic Multi-Hazard Overlays**:
  - Thermal radiation zones (Active Fire).
  - Flood inundation & water level encroachment polygons.
  - Structural collapse danger boundaries.
  - Exposed 11kV high-voltage electrical hazard lines.

### 3.3 Edge AI Computer Vision & YOLO Perception
- **Dual-Stream Video Feed**: High-definition simulated optical RGB feed alongside software-rendered thermal infrared imaging overlay.
- **Real-time YOLOv5n Detection**: Fast inference detecting humans, vehicles, infrastructure barriers, and carried gear.
- **Performance Telemetry**: Live rendering of inference latency (ms), frame processing rate (FPS), and active device acceleration (`CUDA` vs `CPU`).
- **Interactive Image Inspection Tool**: Allows manual upload of aerial drone photos or live frame capture for on-demand server-side neural detection.

### 3.4 Safety Protocols & Flight Command Dispatch
- **Non-blocking Autonomous Controls**:
  - `PAUSE (HOLD)`: Instantly hover and hold current 3D spatial position.
  - `RESUME (AUTO)`: Continue planned autonomous grid search pattern.
  - `RTL (Return to Launch)`: Climb to safe transit altitude and return to GPS home coordinates.
  - `MANUAL OVERRIDE`: Hand over control sticks to physical ground transmitter.
  - `EMERGENCY LAND`: 2-step confirmed immediate controlled vertical descent.
- **PX4 Flight Controller Separation**: Independent flight stabilization loop ensuring companion computer processing never degrades flight safety.

### 3.5 Automated SITREP & Reporting
- **Standardized NDRF Format**: Instant compilation of mission summary, total area covered ($m^2$ or $km^2$), confirmed survivors found, critical hazards identified, and prioritized rescue squad dispatch order.
- **Multi-Format Export**: One-click download of SITREP as structured JSON and print-ready summary report.

### 3.6 Synchronized Smart India Hackathon (SIH) Demo Mode
- A 2–3 minute self-contained realistic disaster scenario execution simulating automated takeoff, sector scanning, live survivor discovery, obstacle detection, audio alerts, and automated RTL on low battery / mission completion.

---

## 4. Non-Functional Requirements

- **Latency**: UI updates at 60 FPS; AI vision inference response latency < 60ms on GPU, < 150ms on CPU.
- **Reliability & Failsafe**: Automatic recovery from lost server connections, graceful fallback to simulated synthetic telemetry when offline.
- **Accessibility & UX**: High-contrast tactical military/emergency color palette, sound synthesis for critical obstacle radar warnings, fully responsive layout.
- **Security & Portability**: Lightweight containerizable/modular architecture with clear separation between frontend visualization, ML inference engine, and flight controller bridge.

---

## 5. Technology Stack Summary

- **Frontend**: React 19, TypeScript, Vite 8, Leaflet, Lucide Icons, Recharts, HTML5 Web Audio API.
- **AI & Vision Backend**: Python 3.10+, FastAPI, Uvicorn, PyTorch, Ultralytics YOLOv5n, Pillow.
- **Target Hardware**:
  - Flight Controller: Pixhawk 4 / Cube Orange running PX4 Autopilot.
  - Edge Companion Computer: NVIDIA Jetson Nano / Orin Nano (UART/MAVLink telemetry link).
  - Ground Control Station: Modern Web Browser / Rugged Field Tablet.
