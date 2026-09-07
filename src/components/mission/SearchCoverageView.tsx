import React, { useState } from 'react';
import {
  Grid,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Layers,
  MapPin,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { SearchCell } from '../../types';
import { TacticalMap } from '../map/TacticalMap';
import { soundFX } from '../../services/audioService';

export const SearchCoverageView: React.FC = () => {
  const {
    searchCells,
    highlightUnsurveyed,
    setHighlightUnsurveyed,
    setFocusedCoordinates,
  } = useMission();

  const [selectedCell, setSelectedCell] = useState<SearchCell>(searchCells[0]);

  const completedCells = searchCells.filter((c) => c.status === 'SEARCHED').length;
  const searchingCells = searchCells.filter((c) => c.status === 'SEARCHING').length;
  const pendingCells = searchCells.filter((c) => c.status === 'PENDING').length;
  const highRiskCells = searchCells.filter((c) => c.riskLevel === 'HIGH').length;

  const totalCells = searchCells.length;
  const coveragePercent = Math.round((completedCells / totalCells) * 100);
  const areaCoveredKm2 = (completedCells * 0.4).toFixed(1);
  const areaRemainingKm2 = ((totalCells - completedCells) * 0.4).toFixed(1);

  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4];

  const getCellColor = (cell: SearchCell) => {
    if (highlightUnsurveyed && cell.status === 'PENDING') {
      return { bg: 'rgba(168, 85, 247, 0.35)', border: '#c084fc', text: '#f3e8ff' };
    }
    if (cell.status === 'SEARCHED') {
      return { bg: 'rgba(16, 185, 129, 0.25)', border: '#10b981', text: '#6ee7b7' };
    }
    if (cell.status === 'SEARCHING') {
      return { bg: 'rgba(56, 189, 248, 0.35)', border: '#38bdf8', text: '#bae6fd' };
    }
    if (cell.riskLevel === 'HIGH') {
      return { bg: 'rgba(239, 68, 68, 0.25)', border: '#ef4444', text: '#fca5a5' };
    }
    return { bg: 'rgba(30, 41, 59, 0.4)', border: '#334155', text: '#94a3b8' };
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 440px',
        height: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: '#070a0f',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Tactical Map with Grid Overlay */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <TacticalMap />
        </div>

        {/* Coverage Statistics Bar */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
          }}
          className="tactical-border"
        >
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Search Coverage</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }} className="font-mono">
              {coveragePercent}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Area Covered</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }} className="font-mono">
              {areaCoveredKm2} km²
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Area Remaining</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }} className="font-mono">
              {areaRemainingKm2} km²
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Cells Completed</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
              {completedCells} / {totalCells}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Est. Completion</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#c084fc' }} className="font-mono">
              08:42
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Grid Sector Matrix & Cell Inspector */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* Grid Matrix View */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '14px',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid size={16} color="#38bdf8" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                SEARCH SECTOR MATRIX (A1 - D4)
              </h3>
            </div>
            <button
              onClick={() => {
                soundFX.playTacticalClick();
                setHighlightUnsurveyed(!highlightUnsurveyed);
              }}
              style={{
                background: highlightUnsurveyed ? '#7c3aed' : '#172338',
                border: `1px solid ${highlightUnsurveyed ? '#c084fc' : '#293b57'}`,
                color: highlightUnsurveyed ? '#ffffff' : '#38bdf8',
                padding: '4px 8px',
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
              <Eye size={12} />
              {highlightUnsurveyed ? 'UNSURVEYED ON' : 'SHOW UNSURVEYED'}
            </button>
          </div>

          {/* Interactive 4x4 Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
            {searchCells.map((cell) => {
              const colors = getCellColor(cell);
              const isSelected = selectedCell.id === cell.id;
              return (
                <button
                  key={cell.id}
                  onClick={() => {
                    soundFX.playTacticalClick();
                    setSelectedCell(cell);
                    if (cell.bounds && cell.bounds.length > 0) {
                      setFocusedCoordinates(cell.bounds[0]);
                    }
                  }}
                  style={{
                    background: colors.bg,
                    border: `1.5px solid ${isSelected ? '#ffffff' : colors.border}`,
                    borderRadius: '6px',
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="tactical-btn"
                >
                  <span style={{ fontSize: '14px', fontWeight: 800, color: colors.text }} className="font-mono">
                    {cell.id}
                  </span>
                  <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    {cell.status}
                  </span>
                  <span style={{ fontSize: '10px', color: colors.text, fontWeight: 700 }} className="font-mono">
                    {cell.coveragePercent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', paddingTop: '8px', borderTop: '1px solid #1c283c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
              <span>Searched ({completedCells})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '2px' }} />
              <span>Searching ({searchingCells})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#475569', borderRadius: '2px' }} />
              <span>Pending ({pendingCells})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }} />
              <span>High Risk ({highRiskCells})</span>
            </div>
          </div>
        </div>

        {/* Selected Cell Detail Inspector */}
        {selectedCell && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c283c', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }} className="font-mono">
                SECTOR {selectedCell.id} INTELLIGENCE
              </h4>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: selectedCell.status === 'SEARCHED' ? '#065f46' : '#1e293b',
                  color: selectedCell.status === 'SEARCHED' ? '#34d399' : '#94a3b8',
                  fontWeight: 700,
                }}
                className="font-mono"
              >
                {selectedCell.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Coverage Progress</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">
                  {selectedCell.coveragePercent}%
                </div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Risk Category</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: selectedCell.riskLevel === 'HIGH' ? '#ef4444' : '#10b981' }} className="font-mono">
                  {selectedCell.riskLevel} RISK
                </div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Detections Found</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }} className="font-mono">
                  {selectedCell.detectionsCount} Targets
                </div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Completed Timestamp</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">
                  {selectedCell.searchedAt || 'In Progress'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playTacticalClick();
                if (selectedCell.bounds && selectedCell.bounds.length > 0) {
                  setFocusedCoordinates(selectedCell.bounds[0]);
                }
              }}
              style={{
                marginTop: 'auto',
                background: '#172338',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              className="tactical-btn"
            >
              <Crosshair size={14} />
              CENTER MAP ON SECTOR {selectedCell.id}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
