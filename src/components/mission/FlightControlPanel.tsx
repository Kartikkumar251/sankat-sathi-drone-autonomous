import React, { useState } from 'react';
import {
  Pause,
  Play,
  Home,
  AlertOctagon,
  Sliders,
  Shield,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { FlightMode } from '../../types';
import { EmergencyLandModal } from '../common/EmergencyLandModal';
import { soundFX } from '../../services/audioService';

interface FlightControlPanelProps {
  className?: string;
}

export const FlightControlPanel: React.FC<FlightControlPanelProps> = ({ className = '' }) => {
  const { flightMode, executeFlightCommand } = useMission();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const handleCommand = (mode: FlightMode) => {
    soundFX.playTacticalClick();
    executeFlightCommand(mode);
  };

  return (
    <div
      style={{
        background: '#0e1420',
        border: '1px solid #1c283c',
        borderRadius: '6px',
        padding: '14px',
      }}
      className={`tactical-border ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="#38bdf8" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
            PX4 FLIGHT CONTROL PANEL
          </h3>
        </div>
        <span
          style={{
            fontSize: '10px',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            padding: '2px 6px',
            borderRadius: '3px',
            fontWeight: 700,
          }}
          className="font-mono"
        >
          MODE: {flightMode}
        </span>
      </div>

      {/* Flight Control Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {flightMode === 'AUTO' ? (
          <button
            onClick={() => handleCommand('HOLD')}
            style={{
              background: '#1e293b',
              border: '1px solid #eab308',
              color: '#facc15',
              padding: '9px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            className="tactical-btn font-tactical"
          >
            <Pause size={14} />
            PAUSE MISSION (HOLD)
          </button>
        ) : (
          <button
            onClick={() => handleCommand('AUTO')}
            style={{
              background: '#0c4a6e',
              border: '1px solid #0284c7',
              color: '#ffffff',
              padding: '9px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            className="tactical-btn font-tactical"
          >
            <Play size={14} />
            RESUME MISSION (AUTO)
          </button>
        )}

        <button
          onClick={() => handleCommand('RTL')}
          style={{
            background: flightMode === 'RTL' ? '#991b1b' : '#1e293b',
            border: `1px solid ${flightMode === 'RTL' ? '#ef4444' : '#38bdf8'}`,
            color: flightMode === 'RTL' ? '#ffffff' : '#38bdf8',
            padding: '9px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          className="tactical-btn font-tactical"
        >
          <Home size={14} />
          RETURN TO HOME (RTL)
        </button>

        <button
          onClick={() => handleCommand('MANUAL')}
          style={{
            background: flightMode === 'MANUAL' ? '#334155' : '#111825',
            border: '1px solid #475569',
            color: '#cbd5e1',
            padding: '9px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          className="tactical-btn font-tactical"
        >
          <Sliders size={14} />
          MANUAL OVERRIDE
        </button>

        <button
          onClick={() => {
            soundFX.playWarningBeep();
            setIsEmergencyModalOpen(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            border: '1px solid #ef4444',
            color: '#ffffff',
            padding: '9px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          className="tactical-btn font-tactical"
        >
          <AlertOctagon size={14} />
          EMERGENCY LAND
        </button>
      </div>

      {/* Architecture / Safety Separation Explainer Notice */}
      <div
        style={{
          background: '#070a0f',
          border: '1px solid #1c283c',
          borderRadius: '4px',
          padding: '8px 10px',
          fontSize: '10px',
          color: '#64748b',
          lineHeight: '1.4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
          <Shield size={12} color="#10b981" />
          <span>Failsafe Architecture Guard</span>
        </div>
        Commands dispatch MAVLink packets directly to PX4 Autopilot. Flight stabilization runs on hardware autopilot independent of Jetson Edge AI.
      </div>

      <EmergencyLandModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmLand={() => executeFlightCommand('LAND')}
        onConfirmRTL={() => executeFlightCommand('RTL')}
      />
    </div>
  );
};
