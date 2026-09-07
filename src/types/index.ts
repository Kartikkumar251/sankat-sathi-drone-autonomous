export type FlightMode = 'AUTO' | 'MANUAL' | 'RTL' | 'HOLD' | 'LAND' | 'TAKEOFF';
export type DroneStatus = 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'CHARGING' | 'ERROR';
export type GPSFixStatus = 'LOCKED' | 'GOOD' | 'DEGRADED' | 'NO_FIX';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'RESCUE_DISPATCHED' | 'RESCUED' | 'REJECTED';
export type DetectionType = 'PERSON' | 'FIRE' | 'SMOKE' | 'FLOOD' | 'DEBRIS' | 'DAMAGED_STRUCTURE' | 'VEHICLE' | 'ELECTRICAL_HAZARD';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertCategory = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type CellStatus = 'SEARCHED' | 'SEARCHING' | 'PENDING' | 'HIGH_RISK';
export type SearchPattern = 'GRID' | 'SPIRAL' | 'CORRIDOR' | 'PERIMETER' | 'CUSTOM';

export interface DroneTelemetry {
  id: string;
  name: string;
  model: string;
  autopilot: string; // e.g. "PX4 Autopilot v1.14"
  companionComputer: string; // e.g. "NVIDIA Jetson Nano 4GB"
  status: DroneStatus;
  mode: FlightMode;
  battery: number; // percentage 0-100
  voltage: number; // Volts e.g. 22.8
  current: number; // Amps e.g. 14.2
  altitude: number; // meters
  groundSpeed: number; // m/s
  verticalSpeed: number; // m/s
  heading: number; // degrees 0-359
  latitude: number;
  longitude: number;
  homeLatitude: number;
  homeLongitude: number;
  distanceFromHome: number; // meters
  satellites: number;
  gpsFix: GPSFixStatus;
  signalStrength: number; // percentage 0-100
  signalRssi: number; // dBm e.g. -64
  aiStatus: 'ONLINE' | 'STANDBY' | 'ERROR' | 'THROTTLED';
  aiInferenceMs: number;
  aiFps: number;
  cameraStatus: 'STREAMING' | 'RECORDING' | 'OFFLINE';
  thermalStatus: 'NOT_INSTALLED' | 'ONLINE' | 'OFFLINE';
  obstacleDistance: number; // meters
  obstacleStatus: 'CLEAR' | 'WARNING' | 'CRITICAL';
  roll: number; // degrees
  pitch: number; // degrees
  yaw: number; // degrees
  cpuUsage: number; // percentage
  gpuUsage: number; // percentage
  temperature: number; // Celsius
  mavlinkHeartbeat: boolean;
  mavlinkLatencyMs: number;
  mavlinkPacketDropRate: number; // percentage
  missionTimeSeconds: number;
}

export interface Waypoint {
  id: string;
  order: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  action: 'SEARCH' | 'LOITER' | 'PHOTO' | 'RTL' | 'PASS';
  status: 'PENDING' | 'CURRENT' | 'PASSED';
}

export interface SearchCell {
  id: string; // e.g. "A1", "B2"
  row: string;
  col: number;
  bounds: [number, number][]; // Polygon coordinates [[lat, lng], ...]
  status: CellStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  coveragePercent: number;
  detectionsCount: number;
  searchedAt?: string;
}

export interface AIDetection {
  id: string;
  type: DetectionType;
  label: string;
  confidence: number; // 0.0 - 1.0
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  priority: PriorityLevel;
  status: VerificationStatus;
  imageUrl?: string;
  thumbnailUrl?: string;
  bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized
  visualAssessment: string;
  nearestSafeRouteDistance: number; // meters
  nearbyHazards: string[];
  assignedTeam?: string;
  notes?: string;
  droneId: string;
}

export interface HazardZone {
  id: string;
  type: DetectionType;
  title: string;
  severity: PriorityLevel;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygon?: [number, number][];
  description: string;
  detectedAt: string;
  isActive: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  timestamp: string;
  droneId: string;
  latitude?: number;
  longitude?: number;
  acknowledged: boolean;
  relatedDetectionId?: string;
  actionRequired?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  timestamp: number;
  title: string;
  description: string;
  type: 'TAKEOFF' | 'GRID_CELL' | 'DETECTION' | 'HAZARD' | 'VERIFIED' | 'DISPATCH' | 'RTL' | 'COMPLETE' | 'ALERT' | 'MODE_CHANGE';
  severity?: PriorityLevel;
  coordinates?: [number, number];
}

export interface CommsMessage {
  id: string;
  time: string;
  sender: 'DRONE-01' | 'AI_CORE' | 'COMMAND_GCS' | 'RESCUE_ALPHA' | 'RESCUE_BRAVO';
  senderRole: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'COMMAND' | 'ACK';
}

export interface SystemComponentHealth {
  name: string;
  role: string;
  hardware: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  latencyMs?: number;
  details: string;
  isFlightCritical: boolean; // Differentiates PX4 flight safety from Jetson Edge AI
}

export interface MissionReportData {
  missionId: string;
  missionName: string;
  operationType: string;
  startTime: string;
  endTime: string;
  durationFormatted: string;
  totalAreaKm2: number;
  areaCoveredKm2: number;
  coveragePercent: number;
  cellsCompleted: number;
  totalCells: number;
  survivorsDetected: number;
  survivorsVerified: number;
  hazardsDetected: number;
  highRiskZonesCount: number;
  batteryConsumedPercent: number;
  distanceFlownKm: number;
  maxAltitudeMeters: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  keyDetections: AIDetection[];
  sitrepSummary: string;
}

export interface SafetyCheckItem {
  id: string;
  title: string;
  category: 'AUTOPILOT' | 'COMMUNICATION' | 'SENSORS' | 'AI_PAYLOAD' | 'ENVIRONMENT';
  status: 'PASS' | 'WARN' | 'FAIL' | 'CHECKING';
  value: string;
  critical: boolean;
}
