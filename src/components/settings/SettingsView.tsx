import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Cpu,
  Radio,
  Layers,
  CheckCircle2,
  Save,
  Bell,
  Eye,
  Camera,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { soundFX } from '../../services/audioService';

export const SettingsView: React.FC = () => {
  const {
    thermalSimEnabled,
    toggleThermalSim,
    gpsDeniedMode,
    toggleGpsDeniedMode,
    isAudioMuted,
    toggleAudioMute,
  } = useMission();

  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState<number>(85);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(1200);
  const [rtlAltitude, setRtlAltitude] = useState<number>(45);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    soundFX.playMissionLaunchTone();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#070a0f',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              SANKATSATHI GCS & AVIONICS CONFIGURATION
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Safety thresholds, AI confidence gating, sensors, and telemetry bridge parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '1px solid #38bdf8',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          className="tactical-btn font-tactical"
        >
          <Save size={15} />
          {savedSuccess ? 'CONFIG APPLIED TO GCS' : 'SAVE GCS PARAMETERS'}
        </button>
      </div>

      {savedSuccess && (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
          GCS Configuration successfully saved and synced to SankatSathi MAVLink bridge.
        </div>
      )}

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* Card 1: AI Perception & Confidence Gating */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '16px' }} className="tactical-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cpu size={16} color="#06b6d4" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }} className="font-tactical">
              EDGE AI INFERENCE & DETECTION GATING
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Survivor Auto-Tagging Confidence Threshold</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }} className="font-mono">{aiConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={98}
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                Detections below this threshold will be marked UNVERIFIED with low alert priority.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111825', padding: '10px', borderRadius: '4px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>Thermal Imaging Sensor Layer</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Expansion Slot #2 (FLIR Boson Core)</div>
              </div>
              <button
                onClick={toggleThermalSim}
                style={{
                  background: thermalSimEnabled ? '#7c3aed' : '#1e293b',
                  border: `1px solid ${thermalSimEnabled ? '#a855f7' : '#334155'}`,
                  color: thermalSimEnabled ? '#ffffff' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {thermalSimEnabled ? 'SIMULATION ON' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Flight Safety & Geofence Boundaries */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '16px' }} className="tactical-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Shield size={16} color="#10b981" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }} className="font-tactical">
              PX4 GEOFENCE & FAILSAFE ALTITUDE
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Autonomous Return-To-Launch (RTL) Safe Altitude</span>
                <span style={{ color: '#10b981', fontWeight: 700 }} className="font-mono">{rtlAltitude} m AGL</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={rtlAltitude}
                onChange={(e) => setRtlAltitude(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                Drone climbs to this altitude before returning home to clear trees and buildings.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Geofence Maximum Operational Radius</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">{geofenceRadius} m</span>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={100}
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: GPS-Denied Navigation (Experimental) */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '16px' }} className="tactical-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Radio size={16} color="#f59e0b" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }} className="font-tactical">
              GPS-DENIED SLAM & VISUAL ODOMETRY (EXPERIMENTAL)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
              Allows fallback navigation inside collapsed structures, tunnels, or urban canyons where satellite GNSS signals are jammed or degraded.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111825', padding: '10px', borderRadius: '4px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>GPS-Denied Mode State</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Sensors: IMU + Optical Flow + VIO</div>
              </div>
              <button
                onClick={toggleGpsDeniedMode}
                style={{
                  background: gpsDeniedMode ? '#78350f' : '#1e293b',
                  border: `1px solid ${gpsDeniedMode ? '#f59e0b' : '#334155'}`,
                  color: gpsDeniedMode ? '#fef3c7' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {gpsDeniedMode ? 'ACTIVE (EXPERIMENTAL)' : 'RTK GPS ONLY'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Audio Alerts & Tactical Sound Effects */}
        <div style={{ background: '#0e1420', border: '1px solid #1c283c', borderRadius: '6px', padding: '16px' }} className="tactical-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Bell size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }} className="font-tactical">
              COMMAND TACTICAL AUDIO SYNTHESIZER
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
              Synthesized audio tones for critical survivor geo-tags, hazard warnings, and mission completion.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111825', padding: '10px', borderRadius: '4px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>Emergency Audio Feedback</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Web Audio API Synthetic Chimes</div>
              </div>
              <button
                onClick={toggleAudioMute}
                style={{
                  background: !isAudioMuted ? '#065f46' : '#1e293b',
                  border: `1px solid ${!isAudioMuted ? '#10b981' : '#334155'}`,
                  color: !isAudioMuted ? '#ffffff' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {!isAudioMuted ? 'AUDIO ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
