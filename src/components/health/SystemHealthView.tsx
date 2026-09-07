import React from 'react';
import {
  HeartPulse,
  Cpu,
  Radio,
  Camera,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Server,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { StatusBadge } from '../common/StatusBadge';

export const SystemHealthView: React.FC = () => {
  const { systemHealth, telemetry } = useMission();

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
            <HeartPulse size={20} color="#10b981" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              HARDWARE & FLIGHT SAFETY DIAGNOSTICS
            </h2>
            <StatusBadge status="ALL AVIONICS NOMINAL" variant="green" size="sm" />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            PX4 Autopilot redundancy, MAVLink transport, and NVIDIA Jetson Nano edge health.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 8px', borderRadius: '4px' }} className="font-mono">
            MAVLink: CONNECTED (32ms)
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 8px', borderRadius: '4px' }} className="font-mono">
            HEARTBEAT: ACTIVE (1 Hz)
          </span>
        </div>
      </div>

      {/* Main Grid: Left Hardware Matrix | Right Failsafe Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Hardware Components Table */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
              PHYSICAL SUBSYSTEMS & SENSORS
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              8 Subsystems Polled
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {systemHealth.map((comp, idx) => (
              <div
                key={idx}
                style={{
                  background: '#111825',
                  border: '1px solid #1c283c',
                  borderRadius: '5px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{comp.name}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: comp.isFlightCritical ? '#1e293b' : '#141c2c',
                        color: comp.isFlightCritical ? '#38bdf8' : '#94a3b8',
                        border: '1px solid #293b57',
                      }}
                      className="font-mono"
                    >
                      {comp.isFlightCritical ? 'FLIGHT CRITICAL (PX4)' : 'AI COMPANION PAYLOAD'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {comp.hardware} // {comp.details}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <StatusBadge
                    status={comp.status}
                    variant={comp.status === 'HEALTHY' ? 'green' : comp.status === 'WARNING' ? 'amber' : 'gray'}
                    size="sm"
                  />
                  {comp.latencyMs && (
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }} className="font-mono">
                      {comp.latencyMs} ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Automatic Failsafe Architecture & MAVLink Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* MAVLink / Comms Transport Card */}
          <div
            style={{
              background: '#0e1420',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '14px',
            }}
            className="tactical-border"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Radio size={16} color="#38bdf8" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                MAVLINK TELEMETRY PROTOCOL STREAM
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Transport Medium</div>
                <div style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">High-Speed UART (921600)</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Packet Success Rate</div>
                <div style={{ color: '#10b981', fontWeight: 700 }} className="font-mono">99.8% (0.2% drop)</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Roundtrip Latency</div>
                <div style={{ color: '#38bdf8', fontWeight: 700 }} className="font-mono">32 ms (Nominal)</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Last Heartbeat</div>
                <div style={{ color: '#10b981', fontWeight: 700 }} className="font-mono">0.2s ago (Active)</div>
              </div>
            </div>
          </div>

          {/* Automatic Failsafe Architecture Panel */}
          <div
            style={{
              background: '#0e1420',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '14px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
            className="tactical-border"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                PX4 AUTOMATIC FAILSAFE BEHAVIORS
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', flex: 1, overflowY: 'auto' }}>
              <div style={{ background: '#111825', padding: '8px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0' }}>RC / GCS Connection Lost</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }} className="font-mono">AUTO RTL @ 45m</span>
              </div>
              <div style={{ background: '#111825', padding: '8px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0' }}>Critical Low Battery (&lt; 20%)</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }} className="font-mono">AUTO RTL / LAND</span>
              </div>
              <div style={{ background: '#111825', padding: '8px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0' }}>GPS Failure / Loss of Fix</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }} className="font-mono">ALT_HOLD / SAFE DESCENT</span>
              </div>
              <div style={{ background: '#111825', padding: '8px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0' }}>Companion Computer (Jetson) Crash</span>
                <span style={{ color: '#10b981', fontWeight: 700 }} className="font-mono">PX4 MAINTAINS FLIGHT SAFELY</span>
              </div>
              <div style={{ background: '#111825', padding: '8px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e2e8f0' }}>Geofence Perimeter Breach</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }} className="font-mono">BRAKE / HOLD AT BOUNDARY</span>
              </div>
            </div>

            <div style={{ background: '#141a24', border: '1px solid #293b57', borderRadius: '4px', padding: '8px 10px', fontSize: '10px', color: '#94a3b8' }}>
              <strong>Safety Isolation:</strong> Flight stabilization and safety failsafes run natively on PX4 NuttX RTOS. Edge AI companion computer failure cannot cause loss of aircraft flight control.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
