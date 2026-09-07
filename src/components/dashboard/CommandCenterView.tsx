import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Compass,
  Crosshair,
  Eye,
  Grid,
  MapPin,
  Maximize2,
  Navigation,
  Radio,
  Shield,
  UserPlus,
  Users,
  Volume2,
  Zap,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { TacticalMap } from '../map/TacticalMap';
import { LiveAICameraFeed } from '../camera/LiveAICameraFeed';
import { ObstacleRadarWidget } from '../common/ObstacleRadarWidget';
import { FlightControlPanel } from '../mission/FlightControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const CommandCenterView: React.FC = () => {
  const {
    telemetry,
    detections,
    alerts,
    searchCells,
    setSelectedDetection,
    setFocusedCoordinates,
    verifyDetection,
    dispatchRescueTeam,
    highlightUnsurveyed,
    setHighlightUnsurveyed,
    setActiveTab,
  } = useMission();

  // Search coverage stats
  const completedCells = searchCells.filter((c) => c.status === 'SEARCHED').length;
  const totalCells = searchCells.length;
  const coveragePercent = Math.round((completedCells / totalCells) * 100);
  const areaCovered = (completedCells * 0.4).toFixed(1);
  const areaRemaining = ((totalCells - completedCells) * 0.4).toFixed(1);

  // Survivors list
  const survivors = detections.filter((d) => d.type === 'PERSON');
  const criticalAlerts = alerts.filter((a) => a.category === 'CRITICAL' && !a.acknowledged);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gridTemplateRows: '1fr auto',
        gap: '12px',
        height: '100%',
        padding: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* LEFT COLUMN: Large Tactical Map + Bottom Quick Detections / Ticker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        {/* Main Map Container */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <TacticalMap />
        </div>

        {/* Bottom Search Coverage & Mission Progress Bar */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
          className="tactical-border"
        >
          {/* Coverage metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#172338',
                border: '1px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }} className="font-mono">
                  {coveragePercent}%
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>SEARCH COVERAGE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }} className="font-mono">
                {areaCovered} km² Covered | {areaRemaining} km² Remaining | {completedCells}/{totalCells} Sectors
              </div>
            </div>
          </div>

          {/* Unsurveyed areas highlight toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                setHighlightUnsurveyed(!highlightUnsurveyed);
              }}
              style={{
                background: highlightUnsurveyed ? '#7c3aed' : '#111825',
                border: `1px solid ${highlightUnsurveyed ? '#a855f7' : '#293b57'}`,
                color: highlightUnsurveyed ? '#ffffff' : '#94a3b8',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className="tactical-btn font-tactical"
            >
              <Eye size={13} />
              {highlightUnsurveyed ? 'UNSURVEYED HIGHLIGHTED' : 'SHOW UNSURVEYED AREAS'}
            </button>

            <button
              onClick={() => {
                soundFX.playTacticalClick();
                setActiveTab('search-coverage');
              }}
              style={{
                background: '#172338',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="tactical-btn"
            >
              <span>GRID MATRIX</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Camera PIP, Real-time Detections, Obstacle Radar, Flight Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* Live Camera Feed PIP */}
        <LiveAICameraFeed isCompact />

        {/* Forward LiDAR Obstacle Avoidance Radar */}
        <ObstacleRadarWidget
          distance={telemetry.obstacleDistance}
          status={telemetry.obstacleStatus}
        />

        {/* Flight Control Actions */}
        <FlightControlPanel />

        {/* AI Detections Stream & Survivor Triage Queue */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={16} color="#ef4444" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                AI DETECTIONS & SURVIVORS ({detections.length})
              </h3>
            </div>
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                setActiveTab('detection-center');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span>ALL DETECTIONS</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Detections List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '280px' }}>
            {detections.slice(0, 4).map((det) => {
              const isPerson = det.type === 'PERSON';
              return (
                <div
                  key={det.id}
                  style={{
                    background: isPerson ? '#1a141a' : '#111825',
                    border: `1px solid ${isPerson ? '#ef4444' : '#293b57'}`,
                    borderRadius: '5px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                  className={isPerson ? 'tactical-border-red' : ''}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: isPerson ? '#ef4444' : '#38bdf8',
                        }}
                        className="font-mono"
                      >
                        {det.label}
                      </span>
                      <StatusBadge
                        status={`${(det.confidence * 100).toFixed(0)}% CONF`}
                        variant={isPerson ? 'red' : 'cyan'}
                        size="sm"
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                      {det.timestamp}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.3' }}>
                    {det.visualAssessment}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                      {det.latitude.toFixed(4)}°N, {det.longitude.toFixed(4)}°E
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
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
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        VIEW ON MAP
                      </button>

                      {isPerson && det.status === 'UNVERIFIED' && (
                        <button
                          onClick={() => verifyDetection(det.id, 'VERIFIED')}
                          style={{
                            background: '#065f46',
                            border: '1px solid #10b981',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          VERIFY
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
