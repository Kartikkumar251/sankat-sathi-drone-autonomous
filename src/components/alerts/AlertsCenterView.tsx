import React, { useState } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCheck,
  CheckCircle2,
  MapPin,
  Send,
  Filter,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { AlertCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const AlertsCenterView: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    setFocusedCoordinates,
    setActiveTab,
    dispatchRescueTeam,
  } = useMission();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = alerts.filter((a) => {
    if (filterCategory === 'ALL') return true;
    return a.category === filterCategory;
  });

  const getAlertIcon = (category: AlertCategory) => {
    switch (category) {
      case 'CRITICAL':
        return <AlertOctagon size={18} color="#ef4444" />;
      case 'HIGH':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'MEDIUM':
        return <AlertTriangle size={18} color="#06b6d4" />;
      default:
        return <Info size={18} color="#38bdf8" />;
    }
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

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
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#ef4444" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              EMERGENCY INCIDENT & TACTICAL ALERT CENTER
            </h2>
            {unacknowledgedCount > 0 ? (
              <StatusBadge status={`${unacknowledgedCount} UNACKNOWLEDGED`} variant="red" pulse size="sm" />
            ) : (
              <StatusBadge status="ALL ALERTS ACKNOWLEDGED" variant="green" size="sm" />
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Priority-ranked incident notifications, geofence breaches, and detection alerts.
          </p>
        </div>

        <button
          onClick={acknowledgeAllAlerts}
          disabled={unacknowledgedCount === 0}
          style={{
            background: unacknowledgedCount > 0 ? '#172338' : '#111825',
            border: `1px solid ${unacknowledgedCount > 0 ? '#0284c7' : '#1c283c'}`,
            color: unacknowledgedCount > 0 ? '#38bdf8' : '#64748b',
            padding: '8px 14px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: unacknowledgedCount > 0 ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          className="tactical-btn"
        >
          <CheckCheck size={15} />
          ACKNOWLEDGE ALL ALERTS
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((cat) => {
          const isSelected = filterCategory === cat;
          const count = cat === 'ALL' ? alerts.length : alerts.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => {
                soundFX.playTacticalClick();
                setFilterCategory(cat);
              }}
              style={{
                background: isSelected ? '#172338' : '#0e1420',
                border: `1px solid ${isSelected ? '#38bdf8' : '#1c283c'}`,
                color: isSelected ? '#38bdf8' : '#94a3b8',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className="tactical-btn font-mono"
            >
              <span>{cat}</span>
              <span style={{ fontSize: '10px', color: isSelected ? '#ffffff' : '#64748b', background: '#111825', padding: '1px 5px', borderRadius: '3px' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {filtered.map((alert) => {
          const isCritical = alert.category === 'CRITICAL';
          const isHigh = alert.category === 'HIGH';
          return (
            <div
              key={alert.id}
              style={{
                background: alert.acknowledged ? '#0c111a' : isCritical ? '#1f1014' : isHigh ? '#1c1510' : '#111825',
                border: `1px solid ${
                  alert.acknowledged ? '#1c283c' : isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#38bdf8'
                }`,
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                opacity: alert.acknowledged ? 0.75 : 1,
              }}
              className={!alert.acknowledged && isCritical ? 'tactical-border-red bbox-survivor-glow' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>{getAlertIcon(alert.category)}</div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }} className="font-tactical">
                      {alert.title}
                    </span>
                    <StatusBadge
                      status={alert.category}
                      variant={isCritical ? 'red' : isHigh ? 'amber' : 'cyan'}
                      size="sm"
                    />
                    <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                      {alert.droneId} // {alert.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {alert.description}
                  </p>

                  {alert.latitude && alert.longitude && (
                    <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '4px' }} className="font-mono">
                      Geo-tag: {alert.latitude.toFixed(5)}°N, {alert.longitude.toFixed(5)}°E
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {alert.latitude && alert.longitude && (
                  <button
                    onClick={() => {
                      soundFX.playTacticalClick();
                      if (alert.latitude && alert.longitude) {
                        setFocusedCoordinates([alert.latitude, alert.longitude]);
                        setActiveTab('command-center');
                      }
                    }}
                    style={{
                      background: '#172338',
                      border: '1px solid #0284c7',
                      color: '#38bdf8',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="tactical-btn"
                  >
                    <MapPin size={13} />
                    VIEW ON MAP
                  </button>
                )}

                {alert.relatedDetectionId && !alert.acknowledged && (
                  <button
                    onClick={() => {
                      soundFX.playWarningBeep();
                      dispatchRescueTeam(alert.relatedDetectionId!, 'NDRF Quick Response Team Alpha-1');
                      acknowledgeAlert(alert.id);
                    }}
                    style={{
                      background: '#991b1b',
                      border: '1px solid #ef4444',
                      color: '#ffffff',
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
                    <Send size={13} />
                    DISPATCH TEAM
                  </button>
                )}

                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    style={{
                      background: '#065f46',
                      border: '1px solid #10b981',
                      color: '#ffffff',
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
                    <CheckCircle2 size={13} />
                    ACKNOWLEDGE
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                    Acknowledged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
