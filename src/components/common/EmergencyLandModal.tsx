import React, { useState } from 'react';
import { AlertOctagon, Home, X, ShieldAlert } from 'lucide-react';
import { soundFX } from '../../services/audioService';

interface EmergencyLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLand: () => void;
  onConfirmRTL: () => void;
}

export const EmergencyLandModal: React.FC<EmergencyLandModalProps> = ({
  isOpen,
  onClose,
  onConfirmLand,
  onConfirmRTL,
}) => {
  const [typedConfirm, setTypedConfirm] = useState('');

  if (!isOpen) return null;

  const isLandConfirmed = typedConfirm.trim().toUpperCase() === 'LAND';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#111825',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.3)',
        }}
        className="tactical-border-red"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={24} color="#ef4444" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em' }} className="font-tactical">
              EMERGENCY FLIGHT TERMINATION
            </h3>
          </div>
          <button
            onClick={() => {
              soundFX.playTacticalClick();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#1c151b', border: '1px solid #571e23', borderRadius: '6px', padding: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px', color: '#fca5a5', fontSize: '13px', lineHeight: '1.4' }}>
            <ShieldAlert size={18} className="flex-shrink-0" style={{ marginTop: '2px' }} />
            <div>
              <strong>SAFETY WARNING:</strong> Emergency landing forces PX4 Autopilot to initiate immediate controlled vertical descent at current coordinates. If possible, consider <strong>Return to Home (RTL)</strong> instead to preserve the airframe.
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
            Type <strong>LAND</strong> to unlock immediate emergency descent:
          </label>
          <input
            type="text"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            placeholder="Type LAND"
            style={{
              width: '100%',
              background: '#070a0f',
              border: '1px solid #293b57',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
            className="font-mono"
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              soundFX.playTacticalClick();
              onConfirmRTL();
              onClose();
            }}
            style={{
              background: '#13233b',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="tactical-btn"
          >
            <Home size={16} />
            SAFE RETURN HOME (RTL)
          </button>

          <button
            disabled={!isLandConfirmed}
            onClick={() => {
              if (isLandConfirmed) {
                soundFX.playWarningBeep();
                onConfirmLand();
                onClose();
              }
            }}
            style={{
              background: isLandConfirmed ? '#ef4444' : '#2d181b',
              border: isLandConfirmed ? '1px solid #ef4444' : '1px solid #4a2125',
              color: isLandConfirmed ? '#ffffff' : '#7f333b',
              padding: '10px 18px',
              borderRadius: '4px',
              cursor: isLandConfirmed ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="tactical-btn"
          >
            <AlertOctagon size={16} />
            EMERGENCY LAND NOW
          </button>
        </div>
      </div>
    </div>
  );
};
