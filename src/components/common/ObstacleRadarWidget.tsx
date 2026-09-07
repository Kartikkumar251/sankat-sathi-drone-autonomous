import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ObstacleRadarWidgetProps {
  distance: number;
  status: 'CLEAR' | 'WARNING' | 'CRITICAL';
  className?: string;
}

export const ObstacleRadarWidget: React.FC<ObstacleRadarWidgetProps> = ({
  distance,
  status,
  className = '',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL':
        return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' };
      case 'WARNING':
        return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' };
      default:
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' };
    }
  };

  const colors = getStatusColor();
  // Map distance 0 to 6 meters to percentage
  const distPercent = Math.min(100, Math.max(5, (distance / 6.0) * 100));

  return (
    <div
      style={{
        background: '#111825',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        padding: '10px 14px',
      }}
      className={`tactical-border ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {status === 'CRITICAL' ? (
            <ShieldAlert size={16} color="#ef4444" />
          ) : status === 'WARNING' ? (
            <AlertTriangle size={16} color="#f59e0b" />
          ) : (
            <ShieldCheck size={16} color="#10b981" />
          )}
          <span style={{ fontSize: '11px', letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Front Obstacle Sensing
          </span>
        </div>
        <span
          style={{
            fontSize: '10px',
            color: colors.text,
            fontWeight: 700,
            background: colors.bg,
            padding: '2px 6px',
            borderRadius: '3px',
            border: `1px solid ${colors.border}`,
          }}
          className="font-mono"
        >
          {status}
        </span>
      </div>

      {/* Visual Distance Arc / Gauge */}
      <div style={{ position: 'relative', marginTop: '4px', marginBottom: '6px' }}>
        <div
          style={{
            height: '6px',
            background: '#1c283c',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${distPercent}%`,
              height: '100%',
              backgroundColor: colors.text,
              transition: 'width 0.4s ease, background-color 0.4s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: colors.text }} className="font-mono">
          {distance.toFixed(1)} <span style={{ fontSize: '12px', color: '#64748b' }}>meters</span>
        </span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>
          TFmini-S 1D Laser (0-12m)
        </span>
      </div>
      <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
        *Front directional sensor only (Non-3D)
      </div>
    </div>
  );
};
