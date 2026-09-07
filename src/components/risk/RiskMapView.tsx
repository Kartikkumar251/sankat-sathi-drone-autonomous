import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Droplets,
  Zap,
  Building,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { TacticalMap } from '../map/TacticalMap';
import { soundFX } from '../../services/audioService';

export const RiskMapView: React.FC = () => {
  const { hazardZones, detections, searchCells } = useMission();

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    survivors: true,
    fire: true,
    smoke: true,
    flood: true,
    structural: true,
    electrical: true,
    corridors: true,
    nogo: true,
  });

  const toggleLayer = (layer: string) => {
    soundFX.playTacticalClick();
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Dynamic Risk Score calculation based on active hazards
  const fireCount = hazardZones.filter((h) => h.type === 'FIRE').length;
  const floodCount = hazardZones.filter((h) => h.type === 'FLOOD').length;
  const structCount = hazardZones.filter((h) => h.type === 'DAMAGED_STRUCTURE').length;
  const electricCount = hazardZones.filter((h) => h.type === 'ELECTRICAL_HAZARD').length;

  const rawScore = 55 + fireCount * 8 + floodCount * 5 + structCount * 7 + electricCount * 5;
  const riskScore = Math.min(95, rawScore);
  const riskLevel = riskScore > 75 ? 'HIGH' : riskScore > 50 ? 'MEDIUM' : 'LOW';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        height: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Multi-Hazard Tactical Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <TacticalMap />
        </div>

        {/* Hazard Corridor Guidance Bar */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#10b981" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }} className="font-tactical">
                DESIGNATED SAFE EVACUATION CORRIDOR: WESTERN FLANK (SECTOR A1 - B1)
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                Clear of 11kV live electrical cables and eastward propagating fire plume.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }} className="font-mono">
            CORRIDOR CLEAR (100%)
          </span>
        </div>
      </div>

      {/* RIGHT: Calculated Risk Score & Layer Matrix */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* Risk Score Card */}
        <div
          style={{
            background: '#140e12',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            padding: '16px',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.15)',
          }}
          className="tactical-border-red"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', letterSpacing: '0.06em' }} className="font-tactical">
                COMPOSITE DISASTER RISK ASSESSMENT
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
                background: '#dc2626',
                padding: '2px 8px',
                borderRadius: '3px',
              }}
              className="font-mono"
            >
              RISK: {riskLevel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#ef4444' }} className="font-mono">
              {riskScore}
            </span>
            <span style={{ fontSize: '14px', color: '#94a3b8' }} className="font-mono">
              / 100 RISK INDEX
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                width: `${riskScore}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
              }}
            />
          </div>

          {/* Risk Factors Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Thermal Radiation / Fire Spread:</span>
              <strong style={{ color: '#f97316' }}>HIGH (88%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Flood Inundation & Current Velocity:</span>
              <strong style={{ color: '#06b6d4' }}>MEDIUM (64%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Structural Collapse Severity:</span>
              <strong style={{ color: '#ef4444' }}>CRITICAL (92%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Live High-Voltage Power Risk:</span>
              <strong style={{ color: '#eab308' }}>HIGH (80%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Survivor Density in Danger Zone:</span>
              <strong style={{ color: '#ef4444' }}>3 VICTIMS LOCATED</strong>
            </div>
          </div>
        </div>

        {/* Tactical Map Layer Toggles */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '14px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
              TACTICAL HAZARD LAYERS
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            {[
              { id: 'survivors', label: '1. Survivor Geo-Markers', icon: '👤', color: '#ef4444' },
              { id: 'fire', label: '2. Active Fire & Thermal Perimeters', icon: <Flame size={14} color="#f97316" />, color: '#f97316' },
              { id: 'smoke', label: '3. Toxic Smoke & Vapor Plumes', icon: <AlertTriangle size={14} color="#a855f7" />, color: '#a855f7' },
              { id: 'flood', label: '4. Flood Inundation Zones', icon: <Droplets size={14} color="#06b6d4" />, color: '#06b6d4' },
              { id: 'structural', label: '5. Structural Collapse Void Zones', icon: <Building size={14} color="#ef4444" />, color: '#ef4444' },
              { id: 'electrical', label: '6. Exposed 11kV Electrical Lines', icon: <Zap size={14} color="#eab308" />, color: '#eab308' },
              { id: 'corridors', label: '7. Designated Safe Rescue Corridors', icon: <Shield size={14} color="#10b981" />, color: '#10b981' },
              { id: 'nogo', label: '8. Automated No-Go Flight Exclusion', icon: <AlertTriangle size={14} color="#dc2626" />, color: '#dc2626' },
            ].map((layer) => {
              const isChecked = activeLayers[layer.id];
              return (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  style={{
                    background: isChecked ? '#172338' : '#111825',
                    border: `1px solid ${isChecked ? '#293b57' : '#1c283c'}`,
                    borderRadius: '4px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{layer.icon}</span>
                    <span style={{ color: isChecked ? '#f1f5f9' : '#64748b', fontWeight: isChecked ? 600 : 400 }}>
                      {layer.label}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
