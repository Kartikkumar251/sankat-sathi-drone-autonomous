import React, { useState, useEffect } from 'react';
import {
  Activity,
  Battery,
  BatteryCharging,
  Cpu,
  Eye,
  Radio,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const Navbar: React.FC = () => {
  const {
    telemetry,
    flightMode,
    isDemoMode,
    setIsDemoMode,
    isDemoRunning,
    startDemoMission,
    pauseDemoMission,
    resetDemoMission,
    isAudioMuted,
    toggleAudioMute,
    thermalSimEnabled,
    toggleThermalSim,
    gpsDeniedMode,
    toggleGpsDeniedMode,
  } = useMission();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB') + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatMissionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return '#10b981';
    if (battery > 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#0c111a',
        borderBottom: '1px solid #1c283c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50,
      }}
      className="flex-shrink-0"
    >
      {/* Brand & Mission Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
            }}
          >
            <Shield size={20} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                }}
                className="font-tactical"
              >
                SANKATSATHI
              </span>
              <StatusBadge status="ONLINE" variant="green" pulse size="sm" />
            </div>
            <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Autonomous AI SAR Command (NDRF)
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: '#1c283c', margin: '0 4px' }} />

        {/* Active Airframe Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              background: '#111825',
              border: '1px solid #293b57',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Navigation size={13} color="#38bdf8" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
              {telemetry.id}
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '3px',
                background: flightMode === 'RTL' ? '#ef4444' : flightMode === 'AUTO' ? '#0369a1' : '#334155',
                color: '#ffffff',
                fontWeight: 700,
              }}
              className="font-mono"
            >
              {flightMode}
            </span>
          </div>
        </div>
      </div>

      {/* Main Telemetry Badges Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Battery */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {telemetry.battery > 90 ? (
            <BatteryCharging size={16} color={getBatteryColor(telemetry.battery)} />
          ) : (
            <Battery size={16} color={getBatteryColor(telemetry.battery)} />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: getBatteryColor(telemetry.battery),
                }}
                className="font-mono"
              >
                {telemetry.battery.toFixed(0)}%
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                {telemetry.voltage.toFixed(1)}V
              </span>
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Battery</div>
          </div>
        </div>

        {/* Altitude */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
            {telemetry.altitude.toFixed(1)} <span style={{ fontSize: '10px', color: '#64748b' }}>m</span>
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Altitude (AGL)</span>
        </div>

        {/* Speed */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
            {telemetry.groundSpeed.toFixed(1)} <span style={{ fontSize: '10px', color: '#64748b' }}>m/s</span>
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Gnd Speed</span>
        </div>

        {/* GPS */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Radio size={15} color={gpsDeniedMode ? '#f59e0b' : '#10b981'} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: gpsDeniedMode ? '#f59e0b' : '#10b981' }} className="font-mono">
              {gpsDeniedMode ? 'GPS-DENIED' : `${telemetry.satellites} SAT`}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>
              {gpsDeniedMode ? 'Visual Odometry' : 'RTK 3D Lock'}
            </div>
          </div>
        </div>

        {/* Signal */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }} className="font-mono">
            {telemetry.signalStrength}%
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>MAVLink {telemetry.signalRssi}dBm</span>
        </div>

        {/* Edge AI Status */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Cpu size={15} color="#06b6d4" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4' }} className="font-mono">
              AI: {telemetry.aiFps} FPS
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Jetson {telemetry.aiInferenceMs}ms</div>
          </div>
        </div>

        {/* Mission Timer */}
        <div
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Clock size={15} color="#e2e8f0" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }} className="font-mono">
              {formatMissionTime(telemetry.missionTimeSeconds)}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Mission Time</div>
          </div>
        </div>
      </div>

      {/* Control Buttons & Demo Mode Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Thermal Sim Toggle */}
        <button
          onClick={toggleThermalSim}
          title={thermalSimEnabled ? 'Thermal Preview Active' : 'Thermal Sensor Not Installed (Click for Simulation)'}
          style={{
            background: thermalSimEnabled ? '#4c1d95' : '#111825',
            border: `1px solid ${thermalSimEnabled ? '#8b5cf6' : '#293b57'}`,
            color: thermalSimEnabled ? '#ffffff' : '#94a3b8',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          className="tactical-btn"
        >
          <Layers size={14} color={thermalSimEnabled ? '#c084fc' : '#64748b'} />
          <span>{thermalSimEnabled ? 'THERMAL (SIM)' : 'RGB ONLY'}</span>
        </button>

        {/* GPS-Denied Experimental Toggle */}
        <button
          onClick={toggleGpsDeniedMode}
          title="Toggle Experimental GPS-Denied Visual SLAM"
          style={{
            background: gpsDeniedMode ? '#78350f' : '#111825',
            border: `1px solid ${gpsDeniedMode ? '#f59e0b' : '#293b57'}`,
            color: gpsDeniedMode ? '#fef3c7' : '#94a3b8',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          className="tactical-btn"
        >
          <Radio size={14} color={gpsDeniedMode ? '#fbbf24' : '#64748b'} />
          <span>{gpsDeniedMode ? 'GPS-DENIED (EXP)' : 'RTK GPS'}</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleAudioMute}
          title={isAudioMuted ? 'Unmute tactical alarms' : 'Mute tactical alarms'}
          style={{
            background: '#111825',
            border: '1px solid #293b57',
            color: isAudioMuted ? '#64748b' : '#38bdf8',
            padding: '6px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="tactical-btn"
        >
          {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* SIH Demo Mode Trigger Widget */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#111825',
            border: '1px solid #0369a1',
            borderRadius: '4px',
            padding: '2px',
          }}
        >
          {!isDemoRunning ? (
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                startDemoMission();
              }}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.05em',
              }}
              className="tactical-btn font-tactical"
            >
              <Play size={13} fill="#ffffff" />
              START DEMO MISSION
            </button>
          ) : (
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                pauseDemoMission();
              }}
              style={{
                background: '#eab308',
                color: '#000000',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.05em',
              }}
              className="tactical-btn font-tactical"
            >
              <Pause size={13} fill="#000000" />
              PAUSE DEMO
            </button>
          )}

          <button
            onClick={() => {
              soundFX.playTacticalClick();
              resetDemoMission();
            }}
            title="Reset Simulation to Initial State"
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              padding: '6px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            className="tactical-btn"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Real-time Clock */}
        <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '6px' }} className="font-mono">
          {currentTime}
        </div>
      </div>
    </header>
  );
};
