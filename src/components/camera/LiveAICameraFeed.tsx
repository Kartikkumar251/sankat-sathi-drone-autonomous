import React, { useRef, useEffect } from 'react';
import { Camera, Layers, Zap, Eye, AlertCircle } from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { StatusBadge } from '../common/StatusBadge';

interface LiveAICameraFeedProps {
  className?: string;
  isCompact?: boolean;
}

export const LiveAICameraFeed: React.FC<LiveAICameraFeedProps> = ({
  className = '',
  isCompact = false,
}) => {
  const {
    telemetry,
    detections,
    thermalSimEnabled,
    toggleThermalSim,
  } = useMission();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate dynamic disaster drone footage simulation with bounding boxes on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Draw simulated ground terrain (Urban flood / debris zone aerial view)
      if (thermalSimEnabled) {
        // Thermal ironbow palette background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.3, '#1c0a35');
        grad.addColorStop(0.6, '#6b114d');
        grad.addColorStop(0.85, '#bf3b1e');
        grad.addColorStop(1, '#f7d038');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Dark disaster aerial imagery palette
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Ground texture / streets / river flood line
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.4);
        ctx.bezierCurveTo(w * 0.3, h * 0.35 + Math.sin(tick * 0.02) * 5, w * 0.7, h * 0.5, w, h * 0.45);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Flood water channel
        ctx.fillStyle = '#0f314c';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        ctx.bezierCurveTo(w * 0.4, h * 0.6, w * 0.6, h * 0.75, w, h * 0.7);
        ctx.lineTo(w, h * 0.88);
        ctx.lineTo(0, h * 0.88);
        ctx.fill();

        // Structural debris blocks
        ctx.fillStyle = '#334155';
        ctx.fillRect(w * 0.2, h * 0.35, 45, 30);
        ctx.fillRect(w * 0.58, h * 0.42, 60, 40);
        ctx.fillRect(w * 0.75, h * 0.28, 40, 50);
      }

      // Render Dynamic YOLO Bounding Boxes for detected objects
      const visibleDetections = detections.slice(0, 3);
      visibleDetections.forEach((det, idx) => {
        const offsetFactor = Math.sin(tick * 0.03 + idx) * 4;
        let x = (det.bbox ? det.bbox[1] : 0.3 + idx * 0.2) * w + offsetFactor;
        let y = (det.bbox ? det.bbox[0] : 0.3 + idx * 0.15) * h + offsetFactor * 0.5;
        let bw = (det.bbox ? det.bbox[3] - det.bbox[1] : 0.25) * w;
        let bh = (det.bbox ? det.bbox[2] - det.bbox[0] : 0.3) * h;

        // Clamp inside canvas
        x = Math.max(10, Math.min(w - bw - 10, x));
        y = Math.max(10, Math.min(h - bh - 10, y));

        const isPerson = det.type === 'PERSON';
        const boxColor = isPerson ? '#ef4444' : det.type === 'FIRE' ? '#f97316' : '#06b6d4';

        // Draw corner brackets
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 2;

        // Bounding box rect
        ctx.strokeRect(x, y, bw, bh);

        // Highlight corners
        const cornerLen = 8;
        ctx.lineWidth = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + bw - cornerLen, y);
        ctx.lineTo(x + bw, y);
        ctx.lineTo(x + bw, y + cornerLen);
        ctx.stroke();

        // Label pill
        ctx.fillStyle = boxColor;
        ctx.fillRect(x, Math.max(0, y - 20), 120, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${det.type} ${(det.confidence * 100).toFixed(0)}%`, x + 5, Math.max(14, y - 6));
      });

      // Optical scanline sweep
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      const scanY = (tick * 2) % h;
      ctx.fillRect(0, scanY, w, 3);

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [detections, thermalSimEnabled]);

  return (
    <div
      style={{
        position: 'relative',
        background: '#070a0f',
        border: '1px solid #1c283c',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={`tactical-border ${className}`}
    >
      {/* Top Video Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          background: 'linear-gradient(to bottom, rgba(7, 10, 15, 0.9) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} className="led-pulse led-red" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em' }} className="font-mono">
            {thermalSimEnabled ? 'THERMAL (SIM)' : isCompact ? 'RGB 1080p' : 'LIVE RGB 1080p CAMERA'}
          </span>
          {!isCompact && <StatusBadge status="AI VISION ACTIVE" variant="cyan" size="sm" />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#38bdf8' }} className="font-mono">
            {telemetry.aiFps} FPS
          </span>
          <button
            onClick={toggleThermalSim}
            title="Toggle Thermal Layer Simulation"
            style={{
              background: thermalSimEnabled ? '#8b5cf6' : 'rgba(17, 24, 37, 0.8)',
              border: `1px solid ${thermalSimEnabled ? '#c084fc' : '#293b57'}`,
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Layers size={10} />
            {thermalSimEnabled ? 'THERMAL' : 'THERMAL'}
          </button>
        </div>
      </div>

      {/* Main Canvas Stream */}
      <div style={{ position: 'relative', width: '100%', height: isCompact ? '220px' : '360px', backgroundColor: '#05080e' }}>
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Tactical Crosshair */}
        <div className="hud-crosshair" />

        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
          className="hud-scanline"
        />

        {/* Future Thermal Camera Banner Notice when active */}
        {thermalSimEnabled && (
          <div
            style={{
              position: 'absolute',
              bottom: '36px',
              left: '12px',
              right: '12px',
              background: 'rgba(76, 29, 149, 0.85)',
              border: '1px solid #c084fc',
              borderRadius: '4px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              color: '#f5f3ff',
              zIndex: 10,
            }}
          >
            <AlertCircle size={13} color="#f5f3ff" />
            <span>*Thermal sensor not connected on physical prototype. Showing software simulated thermal preview.</span>
          </div>
        )}

        {/* Bottom HUD Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '6px 12px',
            background: 'linear-gradient(to top, rgba(7, 10, 15, 0.9) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#94a3b8',
            zIndex: 10,
          }}
          className="font-mono"
        >
          <div>
            POS: {telemetry.latitude.toFixed(5)}°N, {telemetry.longitude.toFixed(5)}°E | ALT: {telemetry.altitude}m
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>OBJECTS: {detections.length}</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>
              SURVIVORS: {detections.filter((d) => d.type === 'PERSON').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
