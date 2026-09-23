# 🧠 SankatSathi - ML & Edge AI Vision Service

This directory contains the machine learning and computer vision pipeline for **SankatSathi (संकटसाथी)**, powering real-time survivor detection, hazard assessment, and object classification from drone optical/thermal streams.

---

## 📁 Directory Structure

```
ml/
├── model_engine.py      # YOLOv5n inference engine with bounding box & category mapping
├── server.py            # FastAPI REST & frame processing server
├── yolov5nu.pt          # YOLOv5 Nano PyTorch model weights (optimized for edge deployment)
├── requirements.txt     # Python runtime dependencies
└── README.md            # ML documentation & setup guide
```

---

## ⚡ Key Capabilities

1. **YOLOv5n Nano Inference**: Lightweight, high-throughput model optimized for edge devices (such as NVIDIA Jetson Nano / Raspberry Pi 4/5) and ground control stations.
2. **Emergency Triage Categorization**: Maps standard COCO classes into emergency rescue categories:
   - `PERSON / SURVIVOR`
   - `VEHICLE`
   - `INFRASTRUCTURE`
   - `CARRIED ITEM`
   - `ANIMAL`
3. **Dual Detection Endpoints**:
   - High-resolution multipart file upload (`/api/detect/image`)
   - Real-time Base64 video frame stream (`/api/detect/frame`)
4. **Latency & GPU Acceleration**: Automatic device detection (`cuda` if available, otherwise `cpu`), returning inference execution metrics in milliseconds.

---

## 🚀 Quick Setup & Run

### 1. Create & Activate Virtual Environment (Recommended)
```bash
# Windows PowerShell
python -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r ml/requirements.txt
```

### 3. Start the Inference Server
```bash
# From repository root:
python ml/server.py

# Or directly from the ml folder:
cd ml
python server.py
```

The server will be available at `http://127.0.0.1:8000`.

---

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ONLINE",
    "service": "Sankat Saathi Neural Vision Engine",
    "device": "cpu",
    "classes_count": 80,
    "classes": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light"]
  }
  ```

### 2. Detect Base64 Video Frame
- **Endpoint**: `POST /api/detect/frame`
- **Payload**:
  ```json
  {
    "frame": "data:image/jpeg;base64,...",
    "conf_threshold": 0.25,
    "iou_threshold": 0.45
  }
  ```

### 3. Detect Image File
- **Endpoint**: `POST /api/detect/image?conf_threshold=0.25&iou_threshold=0.45`
- **Payload**: Multipart form-data with `file` key.
