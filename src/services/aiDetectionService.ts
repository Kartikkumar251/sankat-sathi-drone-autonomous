export interface YOLOBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface YOLONormalizedBox {
  x: number; // 0.0 - 1.0 (left)
  y: number; // 0.0 - 1.0 (top)
  w: number; // 0.0 - 1.0 (width)
  h: number; // 0.0 - 1.0 (height)
}

export interface YOLODetection {
  id: string;
  class_id: number;
  class_name: string;
  label: string;
  category: string;
  confidence: number;
  confidence_pct: number;
  bbox: YOLOBoundingBox;
  bbox_normalized: YOLONormalizedBox;
}

export interface DetectionResponse {
  success: boolean;
  inference_time_ms: number;
  device: string;
  image_size: { width: number; height: number };
  count: number;
  detections: YOLODetection[];
  timestamp: number;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  device: string;
  classes_count: number;
  classes: string[];
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export const aiDetectionService = {
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  async detectImage(
    file: File,
    confThreshold: number = 0.25,
    iouThreshold: number = 0.45
  ): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = new URL(`${API_BASE_URL}/api/detect/image`);
    url.searchParams.append('conf_threshold', confThreshold.toString());
    url.searchParams.append('iou_threshold', iouThreshold.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Inference request failed: ${err}`);
    }

    return await response.json();
  },

  async detectFrame(
    base64Frame: string,
    confThreshold: number = 0.25,
    iouThreshold: number = 0.45
  ): Promise<DetectionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/detect/frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        frame: base64Frame,
        conf_threshold: confThreshold,
        iou_threshold: iouThreshold,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Frame detection failed: ${err}`);
    }

    return await response.json();
  },
};
