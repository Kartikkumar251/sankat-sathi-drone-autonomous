import React, { useState } from 'react';
import { MissionProvider, useMission } from './context/MissionContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthGate } from './components/layout/AuthGate';

// All 11 Major View Components
import { CommandCenterView } from './components/dashboard/CommandCenterView';
import { MissionPlannerView } from './components/mission/MissionPlannerView';
import { LiveMissionView } from './components/mission/LiveMissionView';
import { DetectionCenterView } from './components/detections/DetectionCenterView';
import { RiskMapView } from './components/risk/RiskMapView';
import { DroneFleetView } from './components/fleet/DroneFleetView';
import { SearchCoverageView } from './components/mission/SearchCoverageView';
import { AlertsCenterView } from './components/alerts/AlertsCenterView';
import { MissionReportsView } from './components/reports/MissionReportsView';
import { SystemHealthView } from './components/health/SystemHealthView';
import { SettingsView } from './components/settings/SettingsView';

const MainApplication: React.FC = () => {
  const { activeTab, isAuthenticated, authenticate } = useMission();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <AuthGate onLogin={authenticate} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenterView />;
      case 'mission-planning':
        return <MissionPlannerView />;
      case 'live-mission':
        return <LiveMissionView />;
      case 'detection-center':
        return <DetectionCenterView />;
      case 'risk-map':
        return <RiskMapView />;
      case 'drone-fleet':
        return <DroneFleetView />;
      case 'search-coverage':
        return <SearchCoverageView />;
      case 'alerts':
        return <AlertsCenterView />;
      case 'reports':
        return <MissionReportsView />;
      case 'system-health':
        return <SystemHealthView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#070a0f',
      }}
    >
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <main style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative' }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MissionProvider>
      <MainApplication />
    </MissionProvider>
  );
}
