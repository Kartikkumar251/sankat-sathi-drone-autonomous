import React, { useState } from 'react';
import { Shield, Lock, User, CheckCircle2, ArrowRight, Radio } from 'lucide-react';
import { soundFX } from '../../services/audioService';

interface AuthGateProps {
  onLogin: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
  const [operatorId, setOperatorId] = useState('NDRF-CMD-08');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    soundFX.playMissionLaunchTone();
    setTimeout(() => {
      onLogin();
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#070a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="tactical-grid-bg radar-sweep-bg"
    >
      {/* Decorative tactical HUD elements */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          fontSize: '11px',
          color: '#475569',
          letterSpacing: '0.1em',
        }}
        className="font-mono"
      >
        SYS_SEC_LEVEL: ALPHA-01 // NDRF COMMAND RECON
      </div>
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          fontSize: '11px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        className="font-mono"
      >
        <Radio size={14} /> GCS TELEMETRY: READY
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0e1420',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)',
        }}
        className="tactical-border"
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
            }}
          >
            <Shield size={32} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#f8fafc',
              marginBottom: '6px',
            }}
            className="font-tactical"
          >
            SANKATSATHI
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '0.04em' }}>
            AI-Powered Autonomous Search & Rescue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Operator ID / Call Sign
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#070a0f',
                  border: '1px solid #293b57',
                  color: '#f1f5f9',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                }}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authentication Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#070a0f',
                  border: '1px solid #293b57',
                  color: '#f1f5f9',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                }}
                className="font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
            }}
            className="tactical-btn font-tactical"
          >
            <span>{isSubmitting ? 'AUTHENTICATING ENCRYPTED LINK...' : 'ENTER COMMAND CENTER'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* System Readiness Footer */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '18px',
            borderTop: '1px solid #1c283c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#10b981',
            fontSize: '11px',
            letterSpacing: '0.05em',
          }}
          className="font-mono"
        >
          <CheckCircle2 size={15} />
          <span>SYSTEM STATUS: ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
};
