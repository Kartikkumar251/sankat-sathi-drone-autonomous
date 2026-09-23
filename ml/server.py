import io
import os
import sys
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image

from model_engine import YOLOv5nInferenceEngine

app = FastAPI(
    title="Sankat Saathi AI Object Detection Service",
    description="Real-time AI object detection API for search, rescue, and autonomous drone surveillance.",
    version="1.0.0"
)

# Enable CORS for Frontend React Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Inference Engine
engine = YOLOv5nInferenceEngine.get_instance()

class FrameDetectionRequest(BaseModel):
    frame: str = Field(..., description="Base64 encoded image string (data:image/jpeg;base64,...)")
    conf_threshold: Optional[float] = Field(0.25, ge=0.01, le=1.0, description="Confidence threshold")
    iou_threshold: Optional[float] = Field(0.45, ge=0.01, le=1.0, description="IoU threshold for NMS")

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "Sankat Saathi Neural Vision Engine",
        "device": engine.device,
        "classes_count": len(engine.class_names),
        "classes": list(engine.class_names.values())[:10]  # First 10 classes preview
    }

@app.post("/api/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    conf_threshold: float = Query(0.25, ge=0.01, le=1.0),
    iou_threshold: float = Query(0.45, ge=0.01, le=1.0)
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        results = engine.detect_pil_image(image, conf_threshold=conf_threshold, iou_threshold=iou_threshold)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

@app.post("/api/detect/frame")
async def detect_frame(request: FrameDetectionRequest):
    try:
        results = engine.detect_base64_frame(
            base64_str=request.frame,
            conf_threshold=request.conf_threshold or 0.25,
            iou_threshold=request.iou_threshold or 0.45
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process frame: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("[Sankat Saathi] Starting AI Vision FastAPI Server on http://127.0.0.1:8000 ...")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
