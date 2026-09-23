import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  Upload,
  Play,
  RotateCcw,
  Activity,
  AlertTriangle,
  Info,
  RefreshCw,
  Eye,
  Crosshair,
} from 'lucide-react';
import {
  aiDetectionService,
  YOLODetection,
  BackendHealthResponse,
  DetectionResponse,
} from '../../services/aiDetectionService';
import { soundFX } from '../../services/audioService';

export const ObjectDetectionDashboard: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'WEBCAM' | 'IMAGE'>('WEBCAM');
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [confThreshold, setConfThreshold] = useState<number>(0.35);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [targetFps, setTargetFps] = useState<number>(5);
  const [detections, setDetections] = useState<YOLODetection[]>([]);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(0);
  const [actualFps, setActualFps] = useState<number>(0);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [totalFramesProcessed, setTotalFramesProcessed] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isInferringRef = useRef<boolean>(false);
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastCalculatedRef = useRef<number>(Date.now());

  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const health = await aiDetectionService.checkHealth();
      setBackendHealth(health);
    } catch {
      setBackendHealth(null);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const drawBoundingBoxes = useCallback(
    (ctx: CanvasRenderingContext2D, detectionsList: YOLODetection[], canvasWidth: number, canvasHeight: number) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      detectionsList.forEach((det) => {
        const { x, y, w, h } = det.bbox_normalized;
        const x1 = x * canvasWidth;
        const y1 = y * canvasHeight;
        const boxW = w * canvasWidth;
        const boxH = h * canvasHeight;

        let primaryColor = '#38bdf8';
        let bgColor = 'rgba(56, 189, 248, 0.15)';

        const cls = det.class_name.toLowerCase();
        if (cls === 'person') {
          primaryColor = '#10b981';
          bgColor = 'rgba(16, 185, 129, 0.18)';
        } else if (['cat', 'dog', 'horse', 'sheep', 'cow', 'bird'].includes(cls)) {
          primaryColor = '#f59e0b';
          bgColor = 'rgba(245, 158, 11, 0.18)';
        } else if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(cls)) {
          primaryColor = '#a855f7';
          bgColor = 'rgba(168, 85, 247, 0.18)';
        } else if (['fire hydrant', 'stop sign', 'traffic light'].includes(cls)) {
          primaryColor = '#ef4444';
          bgColor = 'rgba(239, 68, 68, 0.18)';
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(x1, y1, boxW, boxH);

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x1, y1, boxW, boxH);

        const cornerLen = Math.min(14, boxW / 4, boxH / 4);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';

        ctx.beginPath();
        ctx.moveTo(x1, y1 + cornerLen);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 + cornerLen, y1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1 + boxW - cornerLen, y1);
        ctx.lineTo(x1 + boxW, y1);
        ctx.lineTo(x1 + boxW, y1 + cornerLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1 + boxH - cornerLen);
        ctx.lineTo(x1, y1 + boxH);
        ctx.lineTo(x1 + cornerLen, y1 + boxH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1 + boxW - cornerLen, y1 + boxH);
        ctx.lineTo(x1 + boxW, y1 + boxH);
        ctx.lineTo(x1 + boxW, y1 + boxH - cornerLen);
        ctx.stroke();

        const labelText = `${det.label} ${det.confidence_pct}%`;
        ctx.font = 'bold 12px monospace';
        const textMetrics = ctx.measureText(labelText);
        const tagHeight = 22;
        const tagWidth = textMetrics.width + 12;

        let tagY = y1 - tagHeight;
        if (tagY < 0) tagY = y1;

        ctx.fillStyle = primaryColor;
        ctx.fillRect(x1, tagY, tagWidth, tagHeight);

        ctx.fillStyle = '#070a0f';
        ctx.fillText(labelText, x1 + 6, tagY + 15);
      });
    },
    []
  );

  const processVideoFrame = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !isWebcamActive ||
      videoRef.current.readyState < 2 ||
      isInferringRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = 480;
    captureCanvas.height = Math.round((480 / video.videoWidth) * video.videoHeight);
    const capCtx = captureCanvas.getContext('2d');
    if (!capCtx) return;

    capCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const base64Data = captureCanvas.toDataURL('image/jpeg', 0.8);

    isInferringRef.current = true;
    setIsInferring(true);

    try {
      const response: DetectionResponse = await aiDetectionService.detectFrame(
        base64Data,
        confThreshold,
        iouThreshold
      );

      if (response.success) {
        setDetections(response.detections);
        setInferenceTimeMs(response.inference_time_ms);
        setTotalFramesProcessed((prev) => prev + 1);

        drawBoundingBoxes(ctx, response.detections, canvas.width, canvas.height);

        fpsFrameCountRef.current += 1;
        const now = Date.now();
        if (now - fpsLastCalculatedRef.current >= 1000) {
          setActualFps(fpsFrameCountRef.current);
          fpsFrameCountRef.current = 0;
          fpsLastCalculatedRef.current = now;
        }
      }
    } catch {
      // Handled silently
    } finally {
      isInferringRef.current = false;
      setIsInferring(false);
    }
  }, [confThreshold, iouThreshold, isWebcamActive, drawBoundingBoxes]);

  useEffect(() => {
    let timerId: number | null = null;
    if (isWebcamActive) {
      const intervalMs = Math.round(1000 / targetFps);
      timerId = setInterval(() => {
        processVideoFrame();
      }, intervalMs);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isWebcamActive, targetFps, processVideoFrame]);

  const startWebcam = async () => {
    setWebcamError(null);
    soundFX.playTacticalClick();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);
      soundFX.playCriticalAlert();
    } catch (err: any) {
      setWebcamError(err.message || 'Unable to access laptop webcam.');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    soundFX.playTacticalClick();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsWebcamActive(false);
    setDetections([]);
    setActualFps(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const objUrl = URL.createObjectURL(file);
      setUploadedImageSrc(objUrl);
      setDetections([]);
      soundFX.playTacticalClick();
    }
  };

  const runImageDetection = async () => {
    if (!uploadedFile) return;
    soundFX.playTacticalClick();
    setIsInferring(true);
    try {
      const res = await aiDetectionService.detectImage(uploadedFile, confThreshold, iouThreshold);
      setDetections(res.detections);
      setInferenceTimeMs(res.inference_time_ms);

      if (canvasRef.current && imageRef.current) {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        canvas.width = img.naturalWidth || img.clientWidth;
        canvas.height = img.naturalHeight || img.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawBoundingBoxes(ctx, res.detections, canvas.width, canvas.height);
        }
      }
      if (res.detections.length > 0) {
        soundFX.playCriticalAlert();
      }
    } catch (err: any) {
      alert(`Detection failed: ${err.message}`);
    } finally {
      setIsInferring(false);
    }
  };

  const clearResults = () => {
    soundFX.playTacticalClick();
    setDetections([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#070a0f', color: '#f1f5f9', overflowY: 'auto', padding: '16px', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crosshair size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>SANKAT SAATHI OBJECT DETECTION DASHBOARD</h1>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#0284c7', color: '#ffffff' }} className="font-mono">TACTICAL NEURAL VISION</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Real-time survivor, human, animal, and obstacle vision telemetry for Sankat Saathi</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: backendHealth ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${backendHealth ? '#10b981' : '#ef4444'}` }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendHealth ? '#10b981' : '#ef4444' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: backendHealth ? '#10b981' : '#ef4444' }} className="font-mono">FASTAPI ENGINE: {backendHealth ? `ONLINE (${backendHealth.device.toUpperCase()})` : 'OFFLINE'}</span>
          </div>
          <button onClick={checkHealth} disabled={isCheckingHealth} title="Refresh Status" style={{ background: '#111825', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {!backendHealth && !isCheckingHealth && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Sankat Saathi Vision Engine Not Detected</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Please run backend on laptop: <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }} className="font-mono">python backend/server.py</code></div>
            </div>
          </div>
          <button onClick={checkHealth} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0e16', border: '1px solid #1c283c', borderRadius: '8px', padding: '10px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { soundFX.playTacticalClick(); setActiveMode('WEBCAM'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', background: activeMode === 'WEBCAM' ? '#172338' : 'transparent', border: activeMode === 'WEBCAM' ? '1px solid #0284c7' : '1px solid #1e293b', color: activeMode === 'WEBCAM' ? '#38bdf8' : '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <Video size={16} /> Live Webcam
              </button>
              <button onClick={() => { soundFX.playTacticalClick(); setActiveMode('IMAGE'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', background: activeMode === 'IMAGE' ? '#172338' : 'transparent', border: activeMode === 'IMAGE' ? '1px solid #0284c7' : '1px solid #1e293b', color: activeMode === 'IMAGE' ? '#38bdf8' : '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <Upload size={16} /> Upload Image
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {activeMode === 'WEBCAM' ? (
                !isWebcamActive ? (
                  <button onClick={startWebcam} disabled={!backendHealth} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: backendHealth ? '#10b981' : '#334155', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: backendHealth ? 'pointer' : 'not-allowed' }}>
                    <Video size={16} /> Start Webcam
                  </button>
                ) : (
                  <button onClick={stopWebcam} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <VideoOff size={16} /> Stop Webcam
                  </button>
                )
              ) : (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <Upload size={16} /> Choose Image
                  </button>
                  <button onClick={runImageDetection} disabled={!uploadedFile || isInferring || !backendHealth} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: uploadedFile && backendHealth ? '#0284c7' : '#334155', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: uploadedFile && backendHealth ? 'pointer' : 'not-allowed' }}>
                    <Play size={16} /> {isInferring ? 'Running...' : 'Run Detection'}
                  </button>
                </>
              )}
              <button onClick={clearResults} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', background: '#111825', border: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
                <RotateCcw size={16} /> Clear
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', background: '#04070c', border: '1px solid #1c283c', borderRadius: '8px', minHeight: '440px', height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {activeMode === 'WEBCAM' && (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain', display: isWebcamActive ? 'block' : 'none' }} />
            )}
            {activeMode === 'IMAGE' && uploadedImageSrc && (
              <img ref={imageRef} src={uploadedImageSrc} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />

            {activeMode === 'WEBCAM' && !isWebcamActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                <Camera size={36} color="#64748b" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#94a3b8' }}>Laptop Webcam Standby</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Click "Start Webcam" above to detect real-time objects.</div>
                </div>
                {webcamError && <div style={{ color: '#ef4444', fontSize: '12px' }}>{webcamError}</div>}
              </div>
            )}

            {activeMode === 'IMAGE' && !uploadedImageSrc && (
              <div onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b', cursor: 'pointer', padding: '40px', borderRadius: '12px', border: '2px dashed #1e293b' }}>
                <Upload size={32} color="#64748b" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Click to Choose Image</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Supports JPG, PNG, WEBP (Person, Cat, Dog, Car, etc.)</div>
                </div>
              </div>
            )}

            {(isWebcamActive || (activeMode === 'IMAGE' && detections.length > 0)) && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(10, 14, 22, 0.85)', backdropFilter: 'blur(6px)', border: '1px solid #1c283c', borderRadius: '6px', padding: '8px 12px', display: 'flex', gap: '16px', fontSize: '11px', zIndex: 10 }} className="font-mono">
                <div><span style={{ color: '#64748b' }}>LATENCY: </span><span style={{ color: '#38bdf8', fontWeight: 700 }}>{inferenceTimeMs > 0 ? `${inferenceTimeMs}ms` : '--'}</span></div>
                {activeMode === 'WEBCAM' && <div><span style={{ color: '#64748b' }}>FPS: </span><span style={{ color: '#10b981', fontWeight: 700 }}>{actualFps} / {targetFps}</span></div>}
                <div><span style={{ color: '#64748b' }}>OBJECTS: </span><span style={{ color: detections.length > 0 ? '#10b981' : '#94a3b8', fontWeight: 700 }}>{detections.length}</span></div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#0a0e16', border: '1px solid #1c283c', borderRadius: '8px', padding: '12px 16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Confidence Threshold</span>
                <span className="font-mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(confThreshold * 100)}%</span>
              </div>
              <input type="range" min="0.10" max="0.90" step="0.05" value={confThreshold} onChange={(e) => setConfThreshold(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>NMS IoU Threshold</span>
                <span className="font-mono" style={{ color: '#10b981', fontWeight: 700 }}>{Math.round(iouThreshold * 100)}%</span>
              </div>
              <input type="range" min="0.10" max="0.90" step="0.05" value={iouThreshold} onChange={(e) => setIouThreshold(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Webcam Rate Cap</span>
                <span className="font-mono" style={{ color: '#f59e0b', fontWeight: 700 }}>{targetFps} FPS</span>
              </div>
              <input type="range" min="1" max="15" step="1" value={targetFps} onChange={(e) => setTargetFps(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#0a0e16', border: '1px solid #1c283c', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>DETECTED OBJECTS</span>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: detections.length > 0 ? '#0284c7' : '#1e293b', color: '#ffffff' }} className="font-mono">
                {detections.length} ACTIVE
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {detections.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                  <Eye size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  No objects currently detected.
                  <span style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>Show a person, cat, dog, car, or phone in front of camera.</span>
                </div>
              ) : (
                detections.map((item, idx) => {
                  const isPerson = item.class_name.toLowerCase() === 'person';
                  const isAnimal = ['cat', 'dog', 'horse', 'sheep', 'bird'].includes(item.class_name.toLowerCase());
                  const isVehicle = ['car', 'truck', 'bus', 'motorcycle'].includes(item.class_name.toLowerCase());

                  let borderCol = '#0284c7';
                  let bgCol = '#0d1726';
                  let tagBg = '#0284c7';

                  if (isPerson) {
                    borderCol = '#10b981';
                    bgCol = '#09211c';
                    tagBg = '#10b981';
                  } else if (isAnimal) {
                    borderCol = '#f59e0b';
                    bgCol = '#241a08';
                    tagBg = '#f59e0b';
                  } else if (isVehicle) {
                    borderCol = '#a855f7';
                    bgCol = '#200d2b';
                    tagBg = '#a855f7';
                  }

                  return (
                    <div key={`${item.id}-${idx}`} style={{ background: bgCol, border: `1px solid ${borderCol}`, borderRadius: '6px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tagBg }} />
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f1f5f9' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: tagBg, color: '#070a0f' }} className="font-mono">
                          {item.confidence_pct}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }} className="font-mono">
                        <span>CATEGORY: {item.category}</span>
                        <span>ID: #{item.class_id}</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.confidence_pct}%`, height: '100%', background: tagBg }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ background: '#0a0e16', border: '1px solid #1c283c', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700 }}>
              <Info size={14} />
              <span>SANKAT SAATHI AI TELEMETRY</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Model Architecture:</span>
              <span style={{ color: '#f1f5f9' }} className="font-mono">SankatSaathi Neural Vision Engine v1.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Target Classes:</span>
              <span style={{ color: '#f1f5f9' }} className="font-mono">80 Target Threat & Survivor Classes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Inference Device:</span>
              <span style={{ color: '#10b981' }} className="font-mono">{backendHealth?.device.toUpperCase() || 'CPU (Local Laptop)'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Frames Analyzed:</span>
              <span style={{ color: '#38bdf8' }} className="font-mono">{totalFramesProcessed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
