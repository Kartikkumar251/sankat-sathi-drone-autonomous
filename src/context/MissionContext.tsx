import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DroneTelemetry,
  FlightMode,
  AIDetection,
  SearchCell,
  HazardZone,
  AlertItem,
  TimelineEvent,
  CommsMessage,
  SystemComponentHealth,
  MissionReportData,
  PriorityLevel,
  VerificationStatus,
} from '../types';
import {
  INITIAL_TELEMETRY,
  INITIAL_SEARCH_CELLS,
  INITIAL_DETECTIONS,
  HAZARD_ZONES,
  INITIAL_ALERTS,
  INITIAL_TIMELINE,
  INITIAL_COMMS,
  SYSTEM_COMPONENTS,
  DEFAULT_MISSION_REPORT,
} from '../services/mockData';
import { soundFX } from '../services/audioService';

export type NavigationTab =
  | 'command-center'
  | 'mission-planning'
  | 'live-mission'
  | 'detection-center'
  | 'risk-map'
  | 'drone-fleet'
  | 'search-coverage'
  | 'alerts'
  | 'reports'
  | 'system-health'
  | 'settings';

interface MissionContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  telemetry: DroneTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<DroneTelemetry>>;
  flightMode: FlightMode;
  setFlightMode: (mode: FlightMode) => void;
  searchCells: SearchCell[];
  detections: AIDetection[];
  hazardZones: HazardZone[];
  alerts: AlertItem[];
  timeline: TimelineEvent[];
  comms: CommsMessage[];
  systemHealth: SystemComponentHealth[];
  missionReport: MissionReportData;
  selectedDetection: AIDetection | null;
  setSelectedDetection: (det: AIDetection | null) => void;
  focusedCoordinates: [number, number] | null;
  setFocusedCoordinates: (coords: [number, number] | null) => void;
  
  // Toggles & Settings
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  isDemoRunning: boolean;
  demoProgressStep: number;
  startDemoMission: () => void;
  pauseDemoMission: () => void;
  resetDemoMission: () => void;
  
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  thermalSimEnabled: boolean;
  toggleThermalSim: () => void;
  gpsDeniedMode: boolean;
  toggleGpsDeniedMode: () => void;
  
  // Actions
  verifyDetection: (id: string, status: VerificationStatus, teamName?: string) => void;
  dispatchRescueTeam: (detectionId: string, teamName: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAllAlerts: () => void;
  executeFlightCommand: (command: FlightMode) => void;
  highlightUnsurveyed: boolean;
  setHighlightUnsurveyed: (val: boolean) => void;
  selectedDroneId: string;
  setSelectedDroneId: (id: string) => void;
  
  // Auth state
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('command-center');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Demo ready
  const [selectedDroneId, setSelectedDroneId] = useState<string>('DRONE-01');
  
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(INITIAL_TELEMETRY);
  const [flightMode, setFlightModeState] = useState<FlightMode>('AUTO');
  const [searchCells, setSearchCells] = useState<SearchCell[]>(INITIAL_SEARCH_CELLS);
  const [detections, setDetections] = useState<AIDetection[]>(INITIAL_DETECTIONS);
  const [hazardZones, setHazardZones] = useState<HazardZone[]>(HAZARD_ZONES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [comms, setComms] = useState<CommsMessage[]>(INITIAL_COMMS);
  const [systemHealth, setSystemHealth] = useState<SystemComponentHealth[]>(SYSTEM_COMPONENTS);
  const [missionReport, setMissionReport] = useState<MissionReportData>(DEFAULT_MISSION_REPORT);

  const [selectedDetection, setSelectedDetection] = useState<AIDetection | null>(INITIAL_DETECTIONS[0]);
  const [focusedCoordinates, setFocusedCoordinates] = useState<[number, number] | null>(null);

  // Settings & Toggles
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoProgressStep, setDemoProgressStep] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [thermalSimEnabled, setThermalSimEnabled] = useState<boolean>(false);
  const [gpsDeniedMode, setGpsDeniedMode] = useState<boolean>(false);
  const [highlightUnsurveyed, setHighlightUnsurveyed] = useState<boolean>(false);

  const demoIntervalRef = useRef<number | null>(null);

  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      soundFX.setMuted(next);
      return next;
    });
  }, []);

  const toggleThermalSim = useCallback(() => {
    setThermalSimEnabled((prev) => !prev);
    soundFX.playTacticalClick();
  }, []);

  const toggleGpsDeniedMode = useCallback(() => {
    setGpsDeniedMode((prev) => !prev);
    soundFX.playTacticalClick();
  }, []);

  const setFlightMode = useCallback((mode: FlightMode) => {
    setFlightModeState(mode);
    setTelemetry((prev) => ({ ...prev, mode }));
    soundFX.playTacticalClick();

    // Add event to timeline & comms
    const nowStr = new Date().toLocaleTimeString('en-GB');
    setTimeline((prev) => [
      {
        id: 'TL-' + Date.now(),
        time: nowStr,
        timestamp: Date.now(),
        title: `Flight Mode Switched to ${mode}`,
        description: `Operator commanded flight mode update via SankatSathi GCS link.`,
        type: 'MODE_CHANGE',
      },
      ...prev,
    ]);

    setComms((prev) => [
      {
        id: 'CM-' + Date.now(),
        time: nowStr,
        sender: 'COMMAND_GCS',
        senderRole: 'Flight Operator',
        message: `Command sent to PX4: Switch mode -> ${mode}`,
        type: 'COMMAND',
      },
      ...prev,
    ]);
  }, []);

  const executeFlightCommand = useCallback((cmd: FlightMode) => {
    setFlightMode(cmd);
  }, [setFlightMode]);

  const verifyDetection = useCallback((id: string, status: VerificationStatus, teamName?: string) => {
    setDetections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status, assignedTeam: teamName || d.assignedTeam } : d))
    );
    soundFX.playTacticalClick();

    const nowStr = new Date().toLocaleTimeString('en-GB');
    setTimeline((prev) => [
      {
        id: 'TL-' + Date.now(),
        time: nowStr,
        timestamp: Date.now(),
        title: `Detection ${id} Updated to ${status}`,
        description: `Verified by NDRF Command. Action logged in SITREP.`,
        type: 'VERIFIED',
      },
      ...prev,
    ]);

    setComms((prev) => [
      {
        id: 'CM-' + Date.now(),
        time: nowStr,
        sender: 'COMMAND_GCS',
        senderRole: 'Tactical Commander',
        message: `Detection [${id}] marked as ${status}. Ready for ground coordination.`,
        type: 'INFO',
      },
      ...prev,
    ]);
  }, []);

  const dispatchRescueTeam = useCallback((detectionId: string, teamName: string) => {
    verifyDetection(detectionId, 'RESCUE_DISPATCHED', teamName);
    soundFX.playWarningBeep();

    const nowStr = new Date().toLocaleTimeString('en-GB');
    setAlerts((prev) => [
      {
        id: 'ALT-' + Date.now(),
        title: `RESCUE TEAM DISPATCHED: ${teamName}`,
        description: `Tactical unit ${teamName} assigned to coordinates of Detection ${detectionId}.`,
        category: 'HIGH',
        timestamp: nowStr,
        droneId: 'DRONE-01',
        acknowledged: false,
        relatedDetectionId: detectionId,
      },
      ...prev,
    ]);
  }, [verifyDetection]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    soundFX.playTacticalClick();
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    soundFX.playTacticalClick();
  }, []);

  // Autonomous Demo Simulation Script (2-3 minute multi-step realistic disaster SAR scenario)
  const startDemoMission = useCallback(() => {
    setIsDemoRunning(true);
    soundFX.playMissionLaunchTone();

    const nowStr = new Date().toLocaleTimeString('en-GB');
    setTimeline((prev) => [
      {
        id: 'TL-DEMO-START',
        time: nowStr,
        timestamp: Date.now(),
        title: 'SIH Autonomous SAR Demo Mission Initiated',
        description: 'Drone-01 powered on, Jetson TensorRT AI initialized, autonomous sector sweep started.',
        type: 'TAKEOFF',
      },
      ...prev,
    ]);
  }, []);

  const pauseDemoMission = useCallback(() => {
    setIsDemoRunning(false);
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, []);

  const resetDemoMission = useCallback(() => {
    setIsDemoRunning(false);
    setDemoProgressStep(0);
    setTelemetry(INITIAL_TELEMETRY);
    setFlightModeState('AUTO');
    setSearchCells(INITIAL_SEARCH_CELLS);
    setDetections(INITIAL_DETECTIONS);
    setAlerts(INITIAL_ALERTS);
    setTimeline(INITIAL_TIMELINE);
    setComms(INITIAL_COMMS);
    setMissionReport(DEFAULT_MISSION_REPORT);
  }, []);

  // Demo simulation clock & synchronized multi-phase progression
  useEffect(() => {
    if (!isDemoRunning) return;

    demoIntervalRef.current = window.setInterval(() => {
      setDemoProgressStep((prevStep) => {
        const nextStep = prevStep + 1;
        const nowStr = new Date().toLocaleTimeString('en-GB');

        // Dynamic Drone Trajectory around Delhi Technical Campus (DTC), Greater Noida
        const centerLat = 28.47468;
        const centerLng = 77.47648;
        const angle = (nextStep * 6 * Math.PI) / 180;
        const radius = 0.0025 + Math.sin(nextStep * 0.1) * 0.0010;
        const currentLat = Number((centerLat + Math.cos(angle) * radius).toFixed(5));
        const currentLng = Number((centerLng + Math.sin(angle) * radius).toFixed(5));
        const currentHeading = Math.round(((angle * 180) / Math.PI + 90) % 360);

        setTelemetry((prev) => {
          const newBattery = Math.max(18, Number((prev.battery - 0.15).toFixed(1)));
          const newMissionTime = prev.missionTimeSeconds + 1;
          const newSpeed = Number((6.0 + Math.sin(nextStep * 0.2) * 1.2).toFixed(1));
          const newAlt = Number((42.0 + Math.cos(nextStep * 0.15) * 1.5).toFixed(1));
          const newCpu = Math.min(85, Math.round(45 + Math.sin(nextStep * 0.3) * 15));
          const newGpu = Math.min(96, Math.round(75 + Math.cos(nextStep * 0.2) * 12));
          const newInference = Math.round(38 + Math.random() * 8);

          // Dynamic front obstacle distance simulation
          let obsDist = 3.8;
          let obsStatus: 'CLEAR' | 'WARNING' | 'CRITICAL' = 'CLEAR';
          if (nextStep % 40 > 25 && nextStep % 40 < 35) {
            obsDist = 1.4;
            obsStatus = 'WARNING';
          } else if (nextStep % 80 > 70 && nextStep % 80 < 76) {
            obsDist = 0.7;
            obsStatus = 'CRITICAL';
          }

          return {
            ...prev,
            latitude: currentLat,
            longitude: currentLng,
            heading: currentHeading,
            battery: newBattery,
            missionTimeSeconds: newMissionTime,
            groundSpeed: newSpeed,
            altitude: newAlt,
            cpuUsage: newCpu,
            gpuUsage: newGpu,
            aiInferenceMs: newInference,
            obstacleDistance: obsDist,
            obstacleStatus: obsStatus,
            roll: Number((Math.sin(nextStep * 0.2) * 4).toFixed(1)),
            pitch: Number((Math.cos(nextStep * 0.2) * 3).toFixed(1)),
            yaw: currentHeading,
          };
        });

        // Step 15: Cell B3 searched + High Risk tagged
        if (nextStep === 15) {
          setSearchCells((cells) =>
            cells.map((c) =>
              c.id === 'B3'
                ? { ...c, status: 'SEARCHED', coveragePercent: 100, searchedAt: nowStr, detectionsCount: 1 }
                : c.id === 'C2'
                ? { ...c, status: 'SEARCHING', coveragePercent: 45 }
                : c
            )
          );
          setComms((c) => [
            {
              id: 'CM-' + Date.now(),
              time: nowStr,
              sender: 'DRONE-01',
              senderRole: 'Autopilot PX4',
              message: 'Sector B3 grid sweep 100% completed. Moving to Sector C2.',
              type: 'INFO',
            },
            ...c,
          ]);
        }

        // Step 30: AI Detects new Survivor #08 in flooded basement area!
        if (nextStep === 30) {
          soundFX.playCriticalAlert();
          const newSurvivor: AIDetection = {
            id: 'DET-009',
            type: 'PERSON',
            label: 'SURVIVOR #08 (DTC HOSTEL)',
            confidence: 0.97,
            timestamp: nowStr,
            latitude: 28.4735,
            longitude: 77.4770,
            altitude: 41.8,
            priority: 'CRITICAL',
            status: 'UNVERIFIED',
            bbox: [0.22, 0.42, 0.65, 0.78],
            visualAssessment: 'Two persons detected signaling from DTC Hostel balcony above flood waterline. Flashlight beam visible.',
            nearestSafeRouteDistance: 190,
            nearbyHazards: ['Submerged electrical wire (60m South)', 'Debris pile'],
            assignedTeam: 'Unassigned (Action Required)',
            notes: 'High confidence. Thermal hotspot verified.',
            droneId: 'DRONE-01',
          };

          setDetections((d) => [newSurvivor, ...d]);
          setSelectedDetection(newSurvivor);
          setFocusedCoordinates([28.4735, 77.4770]);

          setAlerts((a) => [
            {
              id: 'ALT-' + Date.now(),
              title: 'CRITICAL: SURVIVOR DETECTED (CONF 97%)',
              description: 'Survivor #08 spotted at DTC Hostel. Signaling with light on balcony.',
              category: 'CRITICAL',
              timestamp: nowStr,
              droneId: 'DRONE-01',
              latitude: 28.4735,
              longitude: 77.4770,
              acknowledged: false,
              relatedDetectionId: 'DET-009',
              actionRequired: 'Verify & Dispatch Rescue Team',
            },
            ...a,
          ]);

          setTimeline((t) => [
            {
              id: 'TL-' + Date.now(),
              time: nowStr,
              timestamp: Date.now(),
              title: 'AI Detected Survivor #08 (97% Conf)',
              description: 'BALCONY REFUGE: Geo-tagged at [28.4735, 77.4770] (DTC Hostel). Alert emitted to GCS.',
              type: 'DETECTION',
              severity: 'CRITICAL',
              coordinates: [28.4735, 77.4770],
            },
            ...t,
          ]);

          setComms((c) => [
            {
              id: 'CM-' + Date.now(),
              time: nowStr,
              sender: 'AI_CORE',
              senderRole: 'Jetson Nano AI',
              message: 'PRIORITY 1: High confidence survivor detected [28.4735, 77.4770] near DTC Hostel. Flashlight signature.',
              type: 'ALERT',
            },
            ...c,
          ]);
        }

        // Step 50: Hazard emergence (Gas leak / Chemical plume)
        if (nextStep === 50) {
          soundFX.playWarningBeep();
          const newHazard: HazardZone = {
            id: 'HZ-05',
            type: 'SMOKE',
            title: 'Knowledge Park Chemical Plume',
            severity: 'CRITICAL',
            latitude: 28.4720,
            longitude: 77.4755,
            radiusMeters: 140,
            description: 'Toxic vapor cloud detected spreading downwind across Knowledge Park-III. Standoff required.',
            detectedAt: nowStr,
            isActive: true,
          };
          setHazardZones((hz) => [newHazard, ...hz]);

          setAlerts((a) => [
            {
              id: 'ALT-' + Date.now(),
              title: 'NO-GO ZONE ESTABLISHED: CHEMICAL VAPOR',
              description: 'Chemical plume detected in Sector D2. Safe corridor rerouted around perimeter.',
              category: 'HIGH',
              timestamp: nowStr,
              droneId: 'DRONE-01',
              latitude: 28.4720,
              longitude: 77.4755,
              acknowledged: false,
            },
            ...a,
          ]);

          setTimeline((t) => [
            {
              id: 'TL-' + Date.now(),
              time: nowStr,
              timestamp: Date.now(),
              title: 'Hazard #05 (Toxic Vapor) Identified',
              description: 'Risk map recalculated. Autonomous flight path dynamically adjusted.',
              type: 'HAZARD',
              severity: 'CRITICAL',
              coordinates: [28.4720, 77.4755],
            },
            ...t,
          ]);
        }

        // Step 70: More search cells complete
        if (nextStep === 70) {
          setSearchCells((cells) =>
            cells.map((c) =>
              c.id === 'C2' || c.id === 'C3'
                ? { ...c, status: 'SEARCHED', coveragePercent: 100, searchedAt: nowStr }
                : c.id === 'C1' || c.id === 'C4'
                ? { ...c, status: 'SEARCHING', coveragePercent: 60 }
                : c
            )
          );
        }

        // Step 100: Mission completion & Auto Return To Launch (RTL)
        if (nextStep === 100) {
          setFlightModeState('RTL');
          setTelemetry((prev) => ({ ...prev, mode: 'RTL' }));
          soundFX.playMissionLaunchTone();

          setAlerts((a) => [
            {
              id: 'ALT-' + Date.now(),
              title: 'MISSION AREA SEARCH COMPLETED (91%)',
              description: 'Grid sweep objectives met. PX4 Autopilot executing Return-To-Launch.',
              category: 'INFO',
              timestamp: nowStr,
              droneId: 'DRONE-01',
              acknowledged: false,
            },
            ...a,
          ]);

          setTimeline((t) => [
            {
              id: 'TL-' + Date.now(),
              time: nowStr,
              timestamp: Date.now(),
              title: 'Search Complete -> PX4 RTL Engaged',
              description: 'Autonomous grid search complete. 91% coverage achieved. Drone navigating home.',
              type: 'RTL',
            },
            ...t,
          ]);

          setMissionReport((rep) => ({
            ...rep,
            status: 'COMPLETED',
            coveragePercent: 91,
            cellsCompleted: 14,
            survivorsDetected: 4,
            survivorsVerified: 3,
            hazardsDetected: 6,
            batteryConsumedPercent: 38,
            distanceFlownKm: 6.8,
            durationFormatted: '38m 24s',
            sitrepSummary: `MISSION SITUATION REPORT (SITREP) - ${rep.missionId} [FINAL]
Status: MISSION COMPLETED (RTL SAFE DOCKED)
Total Search Coverage: 91% (14/16 sectors completed)
Survivors Identified: 4 Total (2 Evacuated, 1 Rescue Team En Route, 1 Verified Trapped)
Hazards Cataloged: 6 (1 Active Fire, 1 11kV Exposed Cable, 1 Chemical Vapor Plume, 1 Pancaked Building, 2 Inundations)
Decisional Recommendation: Dispatch Team Charlie with hydraulic spreader to Balcony Survivor #08 and Beam Survivor #04 immediately.`,
          }));
        }

        return nextStep;
      });
    }, 1000);

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    };
  }, [isDemoRunning]);

  const authenticate = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <MissionContext.Provider
      value={{
        activeTab,
        setActiveTab,
        telemetry,
        setTelemetry,
        flightMode,
        setFlightMode,
        searchCells,
        detections,
        hazardZones,
        alerts,
        timeline,
        comms,
        systemHealth,
        missionReport,
        selectedDetection,
        setSelectedDetection,
        focusedCoordinates,
        setFocusedCoordinates,
        isDemoMode,
        setIsDemoMode,
        isDemoRunning,
        demoProgressStep,
        startDemoMission,
        pauseDemoMission,
        resetDemoMission,
        isAudioMuted,
        toggleAudioMute,
        thermalSimEnabled,
        toggleThermalSim,
        gpsDeniedMode,
        toggleGpsDeniedMode,
        verifyDetection,
        dispatchRescueTeam,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        executeFlightCommand,
        highlightUnsurveyed,
        setHighlightUnsurveyed,
        selectedDroneId,
        setSelectedDroneId,
        isAuthenticated,
        authenticate,
        logout,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextType => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
