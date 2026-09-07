import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Sliders,
  Shield,
  MapPin,
  Maximize,
  Clock,
  Battery,
  Radio,
  Eye,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { SearchPattern, SafetyCheckItem } from '../../types';
import { SAFETY_CHECKLIST } from '../../services/mockData';
import { TacticalMap } from '../map/TacticalMap';
import { soundFX } from '../../services/audioService';

export const MissionPlannerView: React.FC = () => {
  const { startDemoMission, setActiveTab } = useMission();

  const [pattern, setPattern] = useState<SearchPattern>('GRID');
  const [altitude, setAltitude] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(6.5);
  const [overlap, setOverlap] = useState<number>(75);
  const [rtlThreshold, setRtlThreshold] = useState<number>(25);
  const [obstacleAvoidance, setObstacleAvoidance] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<SafetyCheckItem[]>(SAFETY_CHECKLIST);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  // Computed flight estimations
  const estimatedDistanceKm = 4.2;
  const estimatedTimeMins = Math.round((estimatedDistanceKm * 1000) / (speed * 60));
  const estimatedBatteryRequired = Math.round(estimatedTimeMins * 1.8 + 15);
  const totalWaypointsCount = 28;

  const handleStartMission = () => {
    soundFX.playMissionLaunchTone();
    setIsLaunching(true);
    setTimeout(() => {
      startDemoMission();
      setActiveTab('live-mission');
    }, 800);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        height: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Tactical Area & Waypoints Map */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <TacticalMap />
        </div>

        {/* Mission Parameters Quick Bar */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
          className="tactical-border"
        >
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Est. Flight Distance</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
              {estimatedDistanceKm} km
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Est. Flight Time</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
              ~{estimatedTimeMins} mins
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Battery Requirement</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }} className="font-mono">
              {estimatedBatteryRequired}% (Safe)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Waypoints Calculated</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#c084fc' }} className="font-mono">
              {totalWaypointsCount} Points
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Search Configuration & Safety Pre-flight Checklist */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* Pattern Selection */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '14px',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Compass size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
              SEARCH PATTERN & TACTICAL GEOMETRY
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
            {(['GRID', 'SPIRAL', 'CORRIDOR', 'PERIMETER', 'CUSTOM'] as SearchPattern[]).map((p) => {
              const isSelected = pattern === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    soundFX.playTacticalClick();
                    setPattern(p);
                  }}
                  style={{
                    background: isSelected ? '#172338' : '#111825',
                    border: `1px solid ${isSelected ? '#38bdf8' : '#293b57'}`,
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    padding: '8px 4px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  className="font-tactical"
                >
                  {p === 'GRID' ? 'GRID / LAWNMOWER' : p}
                </button>
              );
            })}
          </div>

          {/* Sliders: Altitude, Speed, Overlap, RTL Threshold */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Search Altitude (AGL)</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">{altitude} m</span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                value={altitude}
                onChange={(e) => setAltitude(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Ground Search Speed</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">{speed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Camera Field-of-View Overlap</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">{overlap}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                value={overlap}
                onChange={(e) => setOverlap(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Auto RTL Battery Threshold</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }} className="font-mono">{rtlThreshold}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={35}
                value={rtlThreshold}
                onChange={(e) => setRtlThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>
          </div>
        </div>

        {/* Pre-Flight Safety Checks Matrix */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#10b981" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                MISSION SAFETY PRE-FLIGHT CHECK
              </h3>
            </div>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }} className="font-mono">
              ALL CHECKS PASSED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, marginBottom: '14px' }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#111825',
                  border: '1px solid #1c283c',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.title}</span>
                </div>
                <span style={{ color: '#10b981', fontWeight: 700 }} className="font-mono">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Launch Action Button */}
          <button
            onClick={handleStartMission}
            disabled={isLaunching}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
            }}
            className="tactical-btn font-tactical"
          >
            <Play size={16} fill="#ffffff" />
            <span>{isLaunching ? 'ARMING MOTORS & INITIALIZING PX4...' : 'START AUTONOMOUS SEARCH MISSION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
