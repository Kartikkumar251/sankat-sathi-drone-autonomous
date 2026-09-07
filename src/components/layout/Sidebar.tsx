import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Video,
  Crosshair,
  Flame,
  Grid,
  Bell,
  FileText,
  HeartPulse,
  Settings,
  Plane,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useMission, NavigationTab } from '../../context/MissionContext';
import { soundFX } from '../../services/audioService';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { activeTab, setActiveTab, alerts, detections } = useMission();

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeVariant?: 'red' | 'cyan' | 'amber';
  }> = [
    { id: 'command-center', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
    { id: 'mission-planning', label: 'Mission Planning', icon: <Compass size={18} /> },
    { id: 'live-mission', label: 'Live Mission', icon: <Video size={18} />, badge: 'LIVE', badgeVariant: 'red' },
    {
      id: 'detection-center',
      label: 'Detection Center',
      icon: <Crosshair size={18} />,
      badge: detections.length,
      badgeVariant: 'cyan',
    },
    { id: 'risk-map', label: 'Risk Map', icon: <Flame size={18} /> },
    { id: 'drone-fleet', label: 'Drone Fleet', icon: <Plane size={18} /> },
    { id: 'search-coverage', label: 'Search Coverage', icon: <Grid size={18} /> },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <Bell size={18} />,
      badge: alerts.filter((a) => !a.acknowledged).length || undefined,
      badgeVariant: 'red',
    },
    { id: 'reports', label: 'Mission Reports & SITREP', icon: <FileText size={18} /> },
    { id: 'system-health', label: 'System Health', icon: <HeartPulse size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '240px',
        backgroundColor: '#0a0e16',
        borderRight: '1px solid #1c283c',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
      }}
      className="flex-shrink-0"
    >
      {/* Top Nav List */}
      <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFX.playTacticalClick();
                setActiveTab(item.id);
              }}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                borderRadius: '6px',
                background: isActive ? '#172338' : 'transparent',
                border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                position: 'relative',
              }}
              className="tactical-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? '#38bdf8' : '#64748b' }}>{item.icon}</span>
                {!isCollapsed && (
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>

              {/* Badge */}
              {item.badge !== undefined && (
                <span
                  style={{
                    position: isCollapsed ? 'absolute' : 'static',
                    top: isCollapsed ? '4px' : undefined,
                    right: isCollapsed ? '6px' : undefined,
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background:
                      item.badgeVariant === 'red'
                        ? '#ef4444'
                        : item.badgeVariant === 'amber'
                        ? '#f59e0b'
                        : '#0284c7',
                    color: '#ffffff',
                  }}
                  className="font-mono"
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info & Collapse Toggle */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1c283c', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!isCollapsed && (
          <div
            style={{
              background: '#111825',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  border: '1px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCheck size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
                  NDRF COMMANDER
                </div>
                <div style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                  STATUS: ON DUTY
                </div>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>MAVLink Link</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>CONNECTED</span>
            </div>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={() => {
            soundFX.playTacticalClick();
            setIsCollapsed(!isCollapsed);
          }}
          style={{
            background: '#111825',
            border: '1px solid #1c283c',
            color: '#64748b',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            width: '100%',
          }}
          className="tactical-btn"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
