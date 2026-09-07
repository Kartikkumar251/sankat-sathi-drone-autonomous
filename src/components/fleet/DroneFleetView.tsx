import React from 'react';
import {
  Plane,
  Battery,
  Radio,
  Navigation,
  CheckCircle2,
  Clock,
  Cpu,
  ArrowRight,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { FLEET_DRONES } from '../../services/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const DroneFleetView: React.FC = () => {
  const { selectedDroneId, setSelectedDroneId, telemetry, setActiveTab } = useMission();

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
      {/* Fleet Overview Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plane size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              NDRF DISASTER RESPONSE DRONE FLEET
            </h2>
            <StatusBadge status="3 AIRFRAMES REGISTERED" variant="cyan" size="sm" />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Multi-UAV coordination, payload dispatch, and telemetry diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 8px', borderRadius: '4px' }} className="font-mono">
            1 ACTIVE SORTIE
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 8px', borderRadius: '4px' }} className="font-mono">
            1 STANDBY READY
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(100, 116, 139, 0.15)', padding: '4px 8px', borderRadius: '4px' }} className="font-mono">
            1 DOCKED / CHARGING
          </span>
        </div>
      </div>

      {/* Fleet Drone Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {FLEET_DRONES.map((drone) => {
          const isSelected = selectedDroneId === drone.id;
          const isOnline = drone.status === 'ONLINE';
          const isStandby = drone.status === 'STANDBY';

          // Override drone 01 with live telemetry values
          const batteryVal = isOnline ? telemetry.battery.toFixed(0) : drone.battery;
          const gpsVal = isOnline ? `${telemetry.satellites} Sat (${telemetry.gpsFix})` : drone.gps;

          return (
            <div
              key={drone.id}
              style={{
                background: isSelected ? '#121a29' : '#0e1420',
                border: `1.5px solid ${isSelected ? '#38bdf8' : isOnline ? '#0284c7' : '#1c283c'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
                position: 'relative',
              }}
              className="tactical-border"
            >
              {/* Drone Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }} className="font-tactical">
                      {drone.id}
                    </span>
                    <StatusBadge
                      status={drone.status}
                      variant={isOnline ? 'green' : isStandby ? 'cyan' : 'gray'}
                      pulse={isOnline}
                      size="sm"
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {drone.name}
                  </div>
                </div>

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: isOnline ? '#0369a1' : '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Navigation size={16} color={isOnline ? '#ffffff' : '#64748b'} />
                </div>
              </div>

              {/* Specs & Payload */}
              <div style={{ background: '#070a0f', border: '1px solid #1c283c', borderRadius: '4px', padding: '8px 10px', fontSize: '11px' }}>
                <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '9px' }}>Payload Config</div>
                <div style={{ color: '#38bdf8', fontWeight: 600 }}>{drone.payload}</div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
                <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748b' }}>Battery Status</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }} className="font-mono">
                    {batteryVal}%
                  </div>
                </div>

                <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748b' }}>GNSS Satellite Lock</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
                    {gpsVal}
                  </div>
                </div>

                <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748b' }}>Flight Mode</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
                    {isOnline ? telemetry.mode : drone.mode}
                  </div>
                </div>

                <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748b' }}>Telemetry Link</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isOnline ? '#10b981' : '#64748b' }} className="font-mono">
                    {drone.signal}% Link
                  </div>
                </div>
              </div>

              {/* Location Tag */}
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }} className="font-mono">
                <Navigation size={12} color="#64748b" />
                <span>Loc: {isOnline ? `${telemetry.latitude.toFixed(4)}°N, ${telemetry.longitude.toFixed(4)}°E` : drone.location}</span>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    soundFX.playTacticalClick();
                    setSelectedDroneId(drone.id);
                    if (isOnline) setActiveTab('command-center');
                  }}
                  style={{
                    flex: 1,
                    background: isSelected ? '#0284c7' : '#172338',
                    border: `1px solid ${isSelected ? '#38bdf8' : '#293b57'}`,
                    color: '#ffffff',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                  className="tactical-btn font-tactical"
                >
                  <span>{isOnline ? 'ATTACH TELEMETRY HUD' : 'INSPECT DRONE'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
