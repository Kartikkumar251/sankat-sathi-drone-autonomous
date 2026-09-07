import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation2,
  AlertTriangle,
  Flame,
  Shield,
  Home,
  Crosshair,
  Layers,
  MapPin,
  Eye,
  Maximize2,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { AIDetection, HazardZone, SearchCell } from '../../types';
import { soundFX } from '../../services/audioService';

interface TacticalMapProps {
  className?: string;
  showAllLayers?: boolean;
  selectedLayerTypes?: string[];
  onSelectDetection?: (det: AIDetection) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  className = '',
  showAllLayers = true,
  selectedLayerTypes,
  onSelectDetection,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  const flightPathLayerRef = useRef<L.Polyline | null>(null);
  const cellsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const detectionsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const safeCorridorsGroupRef = useRef<L.LayerGroup | null>(null);

  const [followDrone, setFollowDrone] = useState(true);
  const [flightHistory, setFlightHistory] = useState<[number, number][]>([]);

  const {
    telemetry,
    searchCells,
    detections,
    hazardZones,
    setSelectedDetection,
    focusedCoordinates,
    highlightUnsurveyed,
    executeFlightCommand,
  } = useMission();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Tactical Leaflet Map - Delhi Technical Campus, Greater Noida
    const map = L.map(mapContainerRef.current, {
      center: [28.4746766, 77.4764806],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Standard OpenStreetMap with CSS dark tactical filter
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Geofence Circle (Knowledge Park-III Deployment Zone)
    L.circle([28.4746766, 77.4764806], {
      radius: 1200,
      color: '#0284c7',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: 'transparent',
    }).addTo(map);

    // Home Position Base Marker - Delhi Technical Campus Ground Post
    const homeIcon = L.divIcon({
      className: 'custom-home-icon',
      html: `
        <div style="
          background: #0284c7;
          border: 2px solid #38bdf8;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([telemetry.homeLatitude, telemetry.homeLongitude], { icon: homeIcon })
      .bindPopup(
        `<div style="font-family: monospace; font-size: 12px; padding: 4px; min-width: 220px;">
          <strong style="color: #38bdf8; font-size: 13px;">DELHI TECHNICAL CAMPUS (DTC)</strong><br/>
          <span style="color: #94a3b8; font-size: 11px;">Plot 28/1, Knowledge Park-III, Greater Noida</span><br/>
          <strong>NDRF Drone Command Base & Helipad</strong><br/>
          Lat: ${telemetry.homeLatitude.toFixed(5)}°N, Lng: ${telemetry.homeLongitude.toFixed(5)}°E
        </div>`
      )
      .addTo(map);

    // Create Layer Groups
    const cellsGroup = L.layerGroup().addTo(map);
    const hazardsGroup = L.layerGroup().addTo(map);
    const detectionsGroup = L.layerGroup().addTo(map);
    const corridorsGroup = L.layerGroup().addTo(map);

    cellsLayerGroupRef.current = cellsGroup;
    hazardsLayerGroupRef.current = hazardsGroup;
    detectionsLayerGroupRef.current = detectionsGroup;
    safeCorridorsGroupRef.current = corridorsGroup;

    // Flight Path Polyline
    const pathLine = L.polyline([], {
      color: '#38bdf8',
      weight: 2.5,
      opacity: 0.8,
      dashArray: '3, 6',
    }).addTo(map);
    flightPathLayerRef.current = pathLine;

    // Drone Marker
    const droneIcon = L.divIcon({
      className: 'custom-drone-icon',
      html: `
        <div id="drone-heading-icon" style="
          width: 36px;
          height: 36px;
          transform: rotate(${telemetry.heading}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background: #0284c7;
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px #06b6d4;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" stroke="#000000" stroke-width="1.5">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([telemetry.latitude, telemetry.longitude], { icon: droneIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: monospace; font-size: 12px; min-width: 180px;">
        <div style="font-weight: bold; color: #38bdf8; margin-bottom: 4px; font-size: 13px;">${telemetry.id} (${telemetry.mode})</div>
        <div>Altitude: <strong>${telemetry.altitude} m</strong></div>
        <div>Speed: <strong>${telemetry.groundSpeed} m/s</strong></div>
        <div>Battery: <strong style="color: #10b981;">${telemetry.battery}%</strong></div>
        <div>GPS: <strong>${telemetry.satellites} SAT</strong></div>
        <div>AI Inference: <strong>${telemetry.aiInferenceMs}ms</strong></div>
      </div>
    `);

    droneMarkerRef.current = marker;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Drone Marker & Flight Path on Telemetry Change
  useEffect(() => {
    if (!droneMarkerRef.current || !mapInstanceRef.current) return;

    const newPos: [number, number] = [telemetry.latitude, telemetry.longitude];
    droneMarkerRef.current.setLatLng(newPos);

    // Update heading rotation
    const iconEl = document.getElementById('drone-heading-icon');
    if (iconEl) {
      iconEl.style.transform = `rotate(${telemetry.heading}deg)`;
    }

    setFlightHistory((prev) => {
      const next = [...prev, newPos];
      if (next.length > 80) next.shift();
      if (flightPathLayerRef.current) {
        flightPathLayerRef.current.setLatLngs(next);
      }
      return next;
    });

    if (followDrone) {
      mapInstanceRef.current.panTo(newPos, { animate: true, duration: 0.5 });
    }
  }, [telemetry.latitude, telemetry.longitude, telemetry.heading, followDrone]);

  // Handle focus coordinates (e.g. clicking View on Map)
  useEffect(() => {
    if (focusedCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView(focusedCoordinates, 17, { animate: true });
      setFollowDrone(false);
    }
  }, [focusedCoordinates]);

  // Render Search Grid Cells
  useEffect(() => {
    if (!cellsLayerGroupRef.current || !mapInstanceRef.current) return;
    cellsLayerGroupRef.current.clearLayers();

    searchCells.forEach((cell) => {
      let fillColor = 'transparent';
      let strokeColor = '#293b57';
      let fillOpacity = 0.1;

      if (highlightUnsurveyed && cell.status === 'PENDING') {
        fillColor = '#8b5cf6';
        strokeColor = '#a855f7';
        fillOpacity = 0.35;
      } else if (cell.status === 'SEARCHED') {
        fillColor = '#059669';
        strokeColor = '#10b981';
        fillOpacity = 0.22;
      } else if (cell.status === 'SEARCHING') {
        fillColor = '#0284c7';
        strokeColor = '#38bdf8';
        fillOpacity = 0.35;
      } else if (cell.riskLevel === 'HIGH') {
        fillColor = '#b91c1c';
        strokeColor = '#ef4444';
        fillOpacity = 0.25;
      }

      const polygon = L.polygon(cell.bounds, {
        color: strokeColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
      });

      polygon.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">
          <strong>Sector ${cell.id}</strong> [${cell.status}]<br/>
          Coverage: ${cell.coveragePercent}%
        </div>`,
        { permanent: false, direction: 'center', className: 'cell-tooltip' }
      );

      cellsLayerGroupRef.current?.addLayer(polygon);
    });
  }, [searchCells, highlightUnsurveyed]);

  // Render Hazard Zones & Polygons
  useEffect(() => {
    if (!hazardsLayerGroupRef.current) return;
    hazardsLayerGroupRef.current.clearLayers();

    hazardZones.forEach((hz) => {
      const isFire = hz.type === 'FIRE';
      const isFlood = hz.type === 'FLOOD';
      const isElectric = hz.type === 'ELECTRICAL_HAZARD';

      const color = isFire ? '#f97316' : isFlood ? '#06b6d4' : isElectric ? '#eab308' : '#ef4444';

      if (hz.polygon) {
        const poly = L.polygon(hz.polygon, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.35,
          dashArray: '4, 4',
        });
        poly.bindPopup(`
          <div style="font-family: monospace; font-size: 12px;">
            <strong style="color: ${color};">${hz.title}</strong><br/>
            Severity: <strong style="color: #ef4444;">${hz.severity}</strong><br/>
            ${hz.description}
          </div>
        `);
        hazardsLayerGroupRef.current?.addLayer(poly);
      } else {
        const circle = L.circle([hz.latitude, hz.longitude], {
          radius: hz.radiusMeters,
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.3,
        });
        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 12px;">
            <strong style="color: ${color};">${hz.title}</strong><br/>
            Severity: <strong style="color: #ef4444;">${hz.severity}</strong><br/>
            ${hz.description}
          </div>
        `);
        hazardsLayerGroupRef.current?.addLayer(circle);
      }
    });
  }, [hazardZones]);

  // Render AI Detections & Survivor Pins
  useEffect(() => {
    if (!detectionsLayerGroupRef.current) return;
    detectionsLayerGroupRef.current.clearLayers();

    detections.forEach((det) => {
      const isPerson = det.type === 'PERSON';
      const isCritical = det.priority === 'CRITICAL';

      const icon = L.divIcon({
        className: 'custom-detection-marker',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
          ">
            <div style="
              width: ${isPerson ? '32px' : '24px'};
              height: ${isPerson ? '32px' : '24px'};
              background: ${isPerson ? '#dc2626' : '#ea580c'};
              border: 2px solid ${isCritical ? '#ffffff' : '#fca5a5'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 ${isCritical ? '18px' : '10px'} ${isPerson ? '#ef4444' : '#f97316'};
            " class="${isPerson ? 'bbox-survivor-glow' : ''}">
              <span style="font-size: 11px; font-weight: 800; color: white;">
                ${isPerson ? '👤' : '⚠️'}
              </span>
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: #0f172a;
              border: 1px solid #334155;
              color: white;
              font-size: 9px;
              font-family: monospace;
              padding: 1px 4px;
              border-radius: 3px;
              white-space: nowrap;
              font-weight: 700;
            ">
              ${det.label} (${(det.confidence * 100).toFixed(0)}%)
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([det.latitude, det.longitude], { icon: icon });

      // Click opens detailed popup
      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'monospace';
      popupContent.style.fontSize = '12px';
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: bold; color: ${isPerson ? '#ef4444' : '#38bdf8'};">
            ${det.label}
          </div>
          <div style="font-size: 10px; color: #94a3b8;">Confidence: ${(det.confidence * 100).toFixed(0)}% | Time: ${det.timestamp}</div>
        </div>
        <div style="margin-bottom: 4px;">Priority: <strong style="color: #ef4444;">${det.priority}</strong></div>
        <div style="margin-bottom: 4px;">Status: <strong>${det.status}</strong></div>
        <div style="margin-bottom: 4px;">Location: <strong>${det.latitude.toFixed(5)}°N, ${det.longitude.toFixed(5)}°E</strong></div>
        <div style="margin-bottom: 4px;">Safe Route Dist: <strong>${det.nearestSafeRouteDistance} m</strong></div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; margin-bottom: 10px; font-family: sans-serif;">
          ${det.visualAssessment}
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-select-${det.id}" style="
            flex: 1;
            background: #0284c7;
            border: 1px solid #38bdf8;
            color: white;
            padding: 5px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
          ">SELECT / VERIFY</button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${det.id}`);
        if (btn) {
          btn.onclick = () => {
            soundFX.playTacticalClick();
            setSelectedDetection(det);
            if (onSelectDetection) onSelectDetection(det);
          };
        }
      });

      detectionsLayerGroupRef.current?.addLayer(marker);
    });
  }, [detections, setSelectedDetection, onSelectDetection]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#070a0f',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
      className={`tactical-border ${className}`}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Tactical Map Controls Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          background: 'rgba(11, 16, 26, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #1c283c',
          padding: '6px',
          borderRadius: '6px',
        }}
      >
        <button
          onClick={() => {
            soundFX.playTacticalClick();
            setFollowDrone(!followDrone);
          }}
          style={{
            background: followDrone ? '#0284c7' : '#172338',
            border: `1px solid ${followDrone ? '#38bdf8' : '#293b57'}`,
            color: '#ffffff',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          className="tactical-btn font-mono"
        >
          <Crosshair size={13} />
          {followDrone ? 'FOLLOWING DRONE' : 'FREE CAM'}
        </button>

        <button
          onClick={() => {
            soundFX.playTacticalClick();
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([telemetry.latitude, telemetry.longitude], 16);
            }
          }}
          style={{
            background: '#172338',
            border: '1px solid #293b57',
            color: '#94a3b8',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className="tactical-btn"
        >
          <MapPin size={13} />
          RECENTER
        </button>
      </div>

      {/* Mini Drone Telemetry HUD in Top Right of Map */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(11, 16, 26, 0.9)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #293b57',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          minWidth: '170px',
        }}
        className="font-mono"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
          <span>{telemetry.id}</span>
          <span>{telemetry.mode}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
          <span>HDG / YAW</span>
          <span style={{ color: '#f1f5f9' }}>{telemetry.heading}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
          <span>DIST HOME</span>
          <span style={{ color: '#f1f5f9' }}>{telemetry.distanceFromHome} m</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
          <span>OBSTACLE</span>
          <span style={{ color: telemetry.obstacleStatus === 'CRITICAL' ? '#ef4444' : '#10b981', fontWeight: 700 }}>
            {telemetry.obstacleDistance}m ({telemetry.obstacleStatus})
          </span>
        </div>
      </div>
    </div>
  );
};
