import React, { useState, useEffect } from 'react';
import {
  Activity,
  Battery,
  Radio,
  Cpu,
  TrendingUp,
  Compass,
  Zap,
  Gauge,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useMission } from '../../context/MissionContext';
import { soundFX } from '../../services/audioService';

export const TelemetryView: React.FC = () => {
  const { telemetry } = useMission();
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'mission'>('5m');
  const [telemetryHistory, setTelemetryHistory] = useState<Array<{
    time: string;
    battery: number;
    altitude: number;
    speed: number;
    aiLatency: number;
    cpu: number;
    gpu: number;
    roll: number;
    pitch: number;
  }>>([]);

  // Generate continuous real-time telemetry stream data
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB');

    setTelemetryHistory((prev) => {
      const next = [
        ...prev,
        {
          time: timeStr,
          battery: telemetry.battery,
          altitude: telemetry.altitude,
          speed: telemetry.groundSpeed,
          aiLatency: telemetry.aiInferenceMs,
          cpu: telemetry.cpuUsage,
          gpu: telemetry.gpuUsage,
          roll: telemetry.roll,
          pitch: telemetry.pitch,
        },
      ];
      // Keep up to 30 sample points
      if (next.length > 30) next.shift();
      return next;
    });
  }, [telemetry]);

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#070a0f',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
      }}
    >
      {/* Header & Time Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              REAL-TIME SENSOR & AVIONICS TELEMETRY
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            High-frequency PX4 MAVLink stream and Jetson Nano edge performance telemetry.
          </p>
        </div>

        {/* Time range buttons */}
        <div style={{ display: 'flex', gap: '6px', background: '#0e1420', border: '1px solid #1c283c', padding: '3px', borderRadius: '5px' }}>
          {(['1m', '5m', '15m', 'mission'] as const).map((range) => {
            const isSelected = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => {
                  soundFX.playTacticalClick();
                  setTimeRange(range);
                }}
                style={{
                  background: isSelected ? '#0284c7' : 'transparent',
                  border: 'none',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                className="font-mono"
              >
                {range.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Instant Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '12px' }} className="tactical-border">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>
            <span>BATTERY & VOLTAGE</span>
            <Battery size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }} className="font-mono">
            {telemetry.battery.toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }} className="font-mono">
            {telemetry.voltage}V | {telemetry.current}A Draw
          </div>
        </div>

        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '12px' }} className="tactical-border">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>
            <span>ALTITUDE (AGL)</span>
            <Gauge size={15} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }} className="font-mono">
            {telemetry.altitude.toFixed(1)} m
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }} className="font-mono">
            Speed: {telemetry.groundSpeed} m/s | Vert: {telemetry.verticalSpeed} m/s
          </div>
        </div>

        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '12px' }} className="tactical-border">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>
            <span>EDGE AI INFERENCE</span>
            <Cpu size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#06b6d4' }} className="font-mono">
            {telemetry.aiInferenceMs} ms
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }} className="font-mono">
            TensorRT @ {telemetry.aiFps} FPS (YOLOv8)
          </div>
        </div>

        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '12px' }} className="tactical-border">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>
            <span>ATTITUDE (ORIENTATION)</span>
            <Compass size={15} color="#c084fc" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#c084fc' }} className="font-mono">
            HDG {telemetry.heading}°
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }} className="font-mono">
            Roll: {telemetry.roll}° | Pitch: {telemetry.pitch}°
          </div>
        </div>
      </div>

      {/* Real-time Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', flex: 1, minHeight: 0 }}>
        {/* Chart 1: Altitude & Speed */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column' }} className="tactical-border">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }} className="font-tactical">
            ALTITUDE (m) & GROUND SPEED (m/s)
          </div>
          <div style={{ flex: 1, minHeight: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c283c" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 60]} />
                <Tooltip contentStyle={{ backgroundColor: '#111825', borderColor: '#293b57', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="altitude" stroke="#38bdf8" fill="url(#altGrad)" strokeWidth={2} name="Altitude (m)" />
                <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} name="Speed (m/s)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Jetson Edge AI Latency & GPU Usage */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column' }} className="tactical-border">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }} className="font-tactical">
            JETSON NANO AI LATENCY (ms) & GPU UTILIZATION (%)
          </div>
          <div style={{ flex: 1, minHeight: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c283c" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111825', borderColor: '#293b57', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="aiLatency" stroke="#06b6d4" strokeWidth={2} name="Inference Latency (ms)" dot={false} />
                <Line type="monotone" dataKey="gpu" stroke="#eab308" strokeWidth={2} name="GPU Usage (%)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
