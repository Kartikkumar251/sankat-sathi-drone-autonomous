import io
import time
import base64
from typing import List, Dict, Any, Optional
from PIL import Image
import torch
from ultralytics import YOLO

import os

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "yolov5nu.pt")

class YOLOv5nInferenceEngine:
    _instance: Optional["YOLOv5nInferenceEngine"] = None

    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            model_path = DEFAULT_MODEL_PATH if os.path.exists(DEFAULT_MODEL_PATH) else "yolov5nu.pt"
        print(f"[AI Engine] Initializing YOLOv5n inference engine with '{model_path}'...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = YOLO(model_path)
        self.model.to(self.device)
        self.class_names = self.model.names
        print(f"[AI Engine] YOLOv5n initialized successfully on device: {self.device}")
        print(f"[AI Engine] Total classes: {len(self.class_names)}")

    @classmethod
    def get_instance(cls, model_path: Optional[str] = None) -> "YOLOv5nInferenceEngine":
        if cls._instance is None:
            cls._instance = cls(model_path)
        return cls._instance

    def _map_category(self, class_name: str) -> str:
        class_name = class_name.lower()
        if class_name in ["person"]:
            return "PERSON / SURVIVOR"
        elif class_name in ["cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "bird"]:
            return "ANIMAL"
        elif class_name in ["car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "bicycle"]:
            return "VEHICLE"
        elif class_name in ["fire hydrant", "stop sign", "traffic light"]:
            return "INFRASTRUCTURE"
        elif class_name in ["backpack", "handbag", "suitcase", "cell phone", "laptop"]:
            return "CARRIED ITEM"
        else:
            return "OBJECT"

    def detect_pil_image(self, image: Image.Image, conf_threshold: float = 0.25, iou_threshold: float = 0.45) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        # Ensure RGB
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        width, height = image.size
        
        # Run inference
        results = self.model.predict(
            source=image,
            conf=conf_threshold,
            iou=iou_threshold,
            device=self.device,
            verbose=False
        )
        
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 1)
        
        detections: List[Dict[str, Any]] = []
        
        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes
            
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    conf = float(box.conf[0].item())
                    cls_id = int(box.cls[0].item())
                    cls_name = self.class_names.get(cls_id, f"class_{cls_id}")
                    
                    x1, y1, x2, y2 = xyxy
                    box_w = max(0, x2 - x1)
                    box_h = max(0, y2 - y1)
                    
                    category = self._map_category(cls_name)
                    
                    detections.append({
                        "id": f"det_{cls_name}_{int(time.time()*1000)}_{len(detections)+1}",
                        "class_id": cls_id,
                        "class_name": cls_name,
                        "label": cls_name.capitalize(),
                        "category": category,
                        "confidence": round(conf, 4),
                        "confidence_pct": round(conf * 100, 1),
                        "bbox": {
                            "x1": round(x1, 1),
                            "y1": round(y1, 1),
                            "x2": round(x2, 1),
                            "y2": round(y2, 1),
                            "width": round(box_w, 1),
                            "height": round(box_h, 1)
                        },
                        "bbox_normalized": {
                            "x": round(x1 / width, 4) if width > 0 else 0,
                            "y": round(y1 / height, 4) if height > 0 else 0,
                            "w": round(box_w / width, 4) if width > 0 else 0,
                            "h": round(box_h / height, 4) if height > 0 else 0
                        }
                    })
        
        return {
            "success": True,
            "inference_time_ms": inference_time_ms,
            "device": self.device,
            "image_size": {"width": width, "height": height},
            "count": len(detections),
            "detections": detections,
            "timestamp": time.time()
        }

    def detect_base64_frame(self, base64_str: str, conf_threshold: float = 0.25, iou_threshold: float = 0.45) -> Dict[str, Any]:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
            
        img_bytes = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(img_bytes))
        return self.detect_pil_image(image, conf_threshold=conf_threshold, iou_threshold=iou_threshold)
