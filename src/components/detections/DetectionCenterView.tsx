import React, { useState } from 'react';
import {
  Crosshair,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Zap,
  Building,
  Truck,
  MapPin,
  Send,
  Share2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { AIDetection, DetectionType, PriorityLevel, VerificationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const DetectionCenterView: React.FC = () => {
  const {
    detections,
    selectedDetection,
    setSelectedDetection,
    setFocusedCoordinates,
    verifyDetection,
    dispatchRescueTeam,
    setActiveTab,
  } = useMission();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRIORITY' | 'CONFIDENCE' | 'DISTANCE'>('PRIORITY');
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('NDRF Quick Response Team Alpha-1');

  // Filter logic
  const filtered = detections.filter((d) => {
    if (filterType !== 'ALL') {
      if (filterType === 'SURVIVORS' && d.type !== 'PERSON') return false;
      if (filterType === 'FIRE' && d.type !== 'FIRE') return false;
      if (filterType === 'FLOOD' && d.type !== 'FLOOD') return false;
      if (filterType === 'STRUCTURAL' && d.type !== 'DAMAGED_STRUCTURE') return false;
      if (filterType === 'ELECTRICAL' && d.type !== 'ELECTRICAL_HAZARD') return false;
      if (filterType === 'DEBRIS' && d.type !== 'DEBRIS') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q) ||
        d.visualAssessment.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort logic
  const priorityScore: Record<PriorityLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    INFO: 0,
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'PRIORITY') return priorityScore[b.priority] - priorityScore[a.priority];
    if (sortBy === 'CONFIDENCE') return b.confidence - a.confidence;
    if (sortBy === 'DISTANCE') return a.nearestSafeRouteDistance - b.nearestSafeRouteDistance;
    return b.timestamp.localeCompare(a.timestamp);
  });

  const getDetectionIcon = (type: DetectionType) => {
    switch (type) {
      case 'PERSON':
        return <span style={{ color: '#ef4444' }}>👤</span>;
      case 'FIRE':
        return <Flame size={15} color="#f97316" />;
      case 'FLOOD':
        return <Droplets size={15} color="#06b6d4" />;
      case 'ELECTRICAL_HAZARD':
        return <Zap size={15} color="#eab308" />;
      case 'DAMAGED_STRUCTURE':
        return <Building size={15} color="#ef4444" />;
      case 'VEHICLE':
        return <Truck size={15} color="#38bdf8" />;
      default:
        return <AlertTriangle size={15} color="#94a3b8" />;
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        height: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Detection Search, Filter Chips, Table / Cards */}
      <div
        style={{
          background: '#0e1420',
          border: '1px solid #1c283c',
          borderRadius: '6px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: 0,
        }}
        className="tactical-border"
      >
        {/* Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={18} color="#ef4444" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.06em' }} className="font-tactical">
              AI DETECTION & TRIAGE INTELLIGENCE CENTER
            </h2>
            <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '3px' }} className="font-mono">
              {detections.length} GEO-TAGGED
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search ID, tag, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#070a0f',
                border: '1px solid #293b57',
                color: '#f1f5f9',
                padding: '6px 10px 6px 30px',
                borderRadius: '4px',
                fontSize: '11px',
                outline: 'none',
              }}
              className="font-mono"
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'ALL', label: 'All Detections' },
            { id: 'SURVIVORS', label: 'Survivors / Persons' },
            { id: 'FIRE', label: 'Fire & Heat' },
            { id: 'FLOOD', label: 'Flood Regions' },
            { id: 'STRUCTURAL', label: 'Structural Collapse' },
            { id: 'ELECTRICAL', label: 'Electrical Hazard' },
            { id: 'DEBRIS', label: 'Road Obstructions' },
          ].map((cat) => {
            const isSelected = filterType === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFX.playTacticalClick();
                  setFilterType(cat.id);
                }}
                style={{
                  background: isSelected ? '#172338' : '#111825',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1c283c'}`,
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                className="tactical-btn"
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
          <span>Showing {sorted.length} detected targets</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={12} />
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: '#111825',
                border: '1px solid #293b57',
                color: '#38bdf8',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                outline: 'none',
              }}
              className="font-mono"
            >
              <option value="PRIORITY">Highest Priority</option>
              <option value="CONFIDENCE">AI Confidence</option>
              <option value="DISTANCE">Nearest Safe Route</option>
              <option value="NEWEST">Newest First</option>
            </select>
          </div>
        </div>

        {/* Detection Cards Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {sorted.map((det) => {
            const isSelected = selectedDetection?.id === det.id;
            const isPerson = det.type === 'PERSON';
            const isCritical = det.priority === 'CRITICAL';
            return (
              <div
                key={det.id}
                onClick={() => {
                  soundFX.playTacticalClick();
                  setSelectedDetection(det);
                }}
                style={{
                  background: isSelected ? '#172338' : isPerson ? '#181216' : '#111825',
                  border: `1.5px solid ${
                    isSelected ? '#38bdf8' : isCritical ? '#ef4444' : isPerson ? '#b91c1c' : '#1c283c'
                  }`,
                  borderRadius: '6px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className={isCritical ? 'bbox-survivor-glow' : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: isPerson ? '#2c1216' : '#1c283c',
                      border: `1px solid ${isPerson ? '#ef4444' : '#38bdf8'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    {getDetectionIcon(det.type)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#f1f5f9' }} className="font-mono">
                        {det.label}
                      </span>
                      <StatusBadge
                        status={det.priority}
                        variant={isCritical ? 'red' : det.priority === 'HIGH' ? 'amber' : 'cyan'}
                        size="sm"
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#38bdf8',
                          fontWeight: 700,
                          background: 'rgba(56, 189, 248, 0.15)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                        className="font-mono"
                      >
                        {(det.confidence * 100).toFixed(0)}% CONF
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {det.visualAssessment.slice(0, 80)}...
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background:
                        det.status === 'VERIFIED'
                          ? '#065f46'
                          : det.status === 'RESCUE_DISPATCHED'
                          ? '#1e3a8a'
                          : '#334155',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                    className="font-mono"
                  >
                    {det.status}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                    {det.timestamp} // {det.nearestSafeRouteDistance}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detailed Target Dossier Side Panel */}
      {selectedDetection ? (
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            minHeight: 0,
          }}
          className="tactical-border"
        >
          {/* Dossier Header */}
          <div style={{ borderBottom: '1px solid #1c283c', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                TARGET ID: {selectedDetection.id}
              </span>
              <StatusBadge
                status={selectedDetection.status}
                variant={selectedDetection.status === 'VERIFIED' ? 'green' : 'amber'}
                size="sm"
              />
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: selectedDetection.type === 'PERSON' ? '#ef4444' : '#38bdf8',
                marginTop: '4px',
              }}
              className="font-tactical"
            >
              {selectedDetection.label}
            </h3>
          </div>

          {/* AI Confidence & Priority Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>AI Confidence</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
                {(selectedDetection.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Priority Level</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }} className="font-mono">
                {selectedDetection.priority}
              </div>
            </div>
            <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Nearest Route</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }} className="font-mono">
                {selectedDetection.nearestSafeRouteDistance}m
              </div>
            </div>
          </div>

          {/* Visual Assessment Details (Decision Support) */}
          <div style={{ background: '#111825', padding: '10px', borderRadius: '4px', border: '1px solid #1c283c' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
              VISUAL ASSESSMENT (DECISION SUPPORT)
            </div>
            <p style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: '1.4' }}>
              {selectedDetection.visualAssessment}
            </p>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
              *Automated edge visual inference; requires ground NDRF tactical team verification.
            </div>
          </div>

          {/* Geo-Location Tagging */}
          <div style={{ background: '#111825', padding: '10px', borderRadius: '4px', border: '1px solid #1c283c' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
              GEO-SPATIAL COORDINATES
            </div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }} className="font-mono">
              {selectedDetection.latitude.toFixed(6)}° N, {selectedDetection.longitude.toFixed(6)}° E
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }} className="font-mono">
              Altitude: {selectedDetection.altitude}m AGL | Sensor: Sony IMX477 RGB
            </div>
          </div>

          {/* Assigned Team info */}
          {selectedDetection.assignedTeam && (
            <div style={{ background: '#111825', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Assigned Rescue Unit</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                {selectedDetection.assignedTeam}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                setFocusedCoordinates([selectedDetection.latitude, selectedDetection.longitude]);
                setActiveTab('command-center');
              }}
              style={{
                background: '#172338',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                padding: '9px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              className="tactical-btn"
            >
              <MapPin size={15} />
              LOCATE ON TACTICAL MAP
            </button>

            {selectedDetection.status === 'UNVERIFIED' && (
              <button
                onClick={() => verifyDetection(selectedDetection.id, 'VERIFIED')}
                style={{
                  background: '#065f46',
                  border: '1px solid #10b981',
                  color: '#ffffff',
                  padding: '9px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                className="tactical-btn"
              >
                <CheckCircle2 size={15} />
                MARK AS VERIFIED SURVIVOR
              </button>
            )}

            <button
              onClick={() => {
                soundFX.playWarningBeep();
                dispatchRescueTeam(selectedDetection.id, selectedTeam);
              }}
              style={{
                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                border: '1px solid #ef4444',
                color: '#ffffff',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                letterSpacing: '0.05em',
              }}
              className="tactical-btn font-tactical"
            >
              <Send size={15} />
              DISPATCH NDRF RESCUE TEAM
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Select a detection from the list to view tactical dossier.
        </div>
      )}
    </div>
  );
};
