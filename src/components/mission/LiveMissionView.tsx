import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Compass,
  Crosshair,
  Eye,
  Flame,
  Radio,
  Shield,
  Video,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { LiveAICameraFeed } from '../camera/LiveAICameraFeed';
import { TacticalMap } from '../map/TacticalMap';
import { FlightControlPanel } from './FlightControlPanel';
import { ObstacleRadarWidget } from '../common/ObstacleRadarWidget';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const LiveMissionView: React.FC = () => {
  const {
    telemetry,
    detections,
    timeline,
    setSelectedDetection,
    setFocusedCoordinates,
    verifyDetection,
    dispatchRescueTeam,
  } = useMission();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '1fr 180px',
        height: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* TOP ROW: 3-column split (Camera Stream | Tactical Map | Telemetry & AI Stream) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '420px 1fr 340px',
          gap: '12px',
          minHeight: 0,
        }}
      >
        {/* LEFT: Live Camera Stream with Edge AI Bounding Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <LiveAICameraFeed className="h-full" />
          </div>

          <ObstacleRadarWidget
            distance={telemetry.obstacleDistance}
            status={telemetry.obstacleStatus}
          />
        </div>

        {/* CENTER: Tactical Map */}
        <div style={{ minHeight: 0, position: 'relative' }}>
          <TacticalMap />
        </div>

        {/* RIGHT: Flight Control & Live AI Detections Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, overflowY: 'auto' }}>
          <FlightControlPanel />

          <div
            style={{
              background: '#0e1420',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '12px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
            className="tactical-border"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crosshair size={15} color="#38bdf8" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                  LIVE AI DETECTIONS STREAM
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }} className="font-mono">
                {detections.length} TARGETS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
              {detections.map((det) => {
                const isPerson = det.type === 'PERSON';
                return (
                  <div
                    key={det.id}
                    style={{
                      background: isPerson ? '#181119' : '#111825',
                      border: `1px solid ${isPerson ? '#ef4444' : '#293b57'}`,
                      borderRadius: '4px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isPerson ? '#ef4444' : '#38bdf8' }} className="font-mono">
                        {det.label}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }} className="font-mono">
                        {(det.confidence * 100).toFixed(0)}% | {det.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.2' }}>
                      {det.visualAssessment}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                        Status: <strong style={{ color: det.status === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>{det.status}</strong>
                      </span>
                      <button
                        onClick={() => {
                          soundFX.playTacticalClick();
                          setSelectedDetection(det);
                          setFocusedCoordinates([det.latitude, det.longitude]);
                        }}
                        style={{
                          background: '#172338',
                          border: '1px solid #0284c7',
                          color: '#38bdf8',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        LOCATE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Chronological Mission Timeline */}
      <div
        style={{
          background: '#0c111a',
          border: '1px solid #1c283c',
          borderRadius: '6px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
        className="tactical-border"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={15} color="#38bdf8" />
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
              MISSION EVENT TIMELINE & AUDIT LOG
            </h4>
          </div>
          <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
            SAR-2026-09-07-001 // SYNCHRONIZED
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', flex: 1, alignItems: 'center' }}>
          {timeline.map((event) => {
            const isCritical = event.severity === 'CRITICAL';
            const isHigh = event.severity === 'HIGH';
            const isDetection = event.type === 'DETECTION';
            return (
              <div
                key={event.id}
                style={{
                  minWidth: '220px',
                  maxWidth: '260px',
                  background: isCritical ? '#211216' : isHigh ? '#211910' : '#111825',
                  border: `1px solid ${isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#293b57'}`,
                  borderRadius: '5px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#38bdf8',
                    }}
                    className="font-mono"
                  >
                    {event.time}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      background: isDetection ? '#7f1d1d' : '#1e293b',
                      color: '#ffffff',
                    }}
                    className="font-mono"
                  >
                    {event.type}
                  </span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.2' }}>
                  {event.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
