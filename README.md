# 🚁 SankatSathi (संकटसाथी)
### AI-Powered Autonomous Search & Rescue Drone Command Center

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SankatSathi** is an emergency command-and-control platform engineered for disaster response teams such as the **National Disaster Response Force (NDRF)**. It bridges autonomous drone swarm telemetry, companion edge AI (NVIDIA Jetson Nano), real-time YOLO perception, geo-tagging, live tactical mapping, hazard intelligence, search coverage, and situational reporting (SITREP).

---

## 📍 Deployment & Demo Coordinates
- **Base Deployment**: Delhi Technical Campus (DTC), Plot No. 28/1, Knowledge Park-III, Greater Noida, UP 201306
- **Geographic Coordinates**: `28.4746766° N, 77.4764806° E`

---

## ⚡ Key Features

### 1. Situational Awareness & Flight Telemetry
- **Avionics Telemetry**: Real-time monitoring of Altitude (AGL), Ground Speed, Vertical Velocity, Battery Voltage/Current, Heading & Attitude (Pitch/Roll/Yaw).
- **Navigation Status**: RTK GPS 3D fix (15+ Satellites locked) + Experimental GPS-Denied Visual SLAM mode.
- **Collision Avoidance**: Forward laser LiDAR radar with clear/warning/critical distance thresholds (e.g. 3.8m CLEAR vs 1.2m WARNING).

### 2. Live Tactical Map & Geo-Spatial Overlays
- **Real-Time Airframe Tracking**: Live rotating drone heading vector and flight path trail.
- **Search Grid Matrix**: 16-sector search grid (`A1`–`D4`) with dynamic status updates (`SEARCHED`, `SEARCHING`, `PENDING`, `HIGH RISK`).
- **Interactive Triage Pins**: Survivor locations with visual assessment, confidence score, and nearest safe rescue corridor.
- **Multi-Hazard Perimeter**: Fire thermal radiation, flood inundation, structural collapse, and exposed 11kV live power lines.

### 3. Edge AI Video Stream & Perception (Jetson Nano)
- 1080p live simulated optical feed with dynamic YOLO bounding box overlays for `PERSON`, `FIRE`, `DAMAGED STRUCTURE`, and `VEHICLE`.
- Real-time inference latency (42ms) and FPS monitor (28 FPS).
- Software-simulated thermal imaging layer preview.

### 4. Safety & Failsafe Architecture
- **PX4 Flight Controller Separation**: Clear architectural separation ensuring flight stabilization does not depend on the edge companion computer.
- **High-Level Command Dispatch**: `PAUSE (HOLD)`, `RESUME (AUTO)`, `RETURN TO HOME (RTL)`, `MANUAL OVERRIDE`, and `EMERGENCY LAND` (with 2-step confirmation).

### 5. Automated SITREP Generator & Mission Reports
- Instant NDRF Situation Report (SITREP) formatted for field commanders with priority rescue recommendations.
- Post-mission report cards with PDF & JSON export capabilities.

### 6. Synchronized SIH Demonstration Mode
- One-click autonomous mission simulation running a full 2–3 minute realistic disaster SAR scenario with live telemetry updates, survivor discoveries, audio alerts, and automated RTL.

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Cartography**: Leaflet, OpenStreetMap (Tactical Dark Theme)
- **Visualization & Charts**: Recharts, Canvas HUD
- **Audio Synthesizer**: Web Audio API (tactical radar beeps and alert chimes)
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or newer)
- npm / pnpm / yarn

### Installation
```bash
# Clone repository
git clone https://github.com/Kartikkumar251/sankat-sachi-drone-autonomous-.git
cd sankat-sachi-drone-autonomous-

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```

---

## 🛡️ Operational Workflow
```
SEARCH ➔ DETECT ➔ GEO-TAG ➔ ASSESS ➔ ALERT ➔ MAP ➔ VERIFY ➔ RESPOND ➔ REPORT
```

Built for **Smart India Hackathon (SIH)** and Emergency Disaster Response.
