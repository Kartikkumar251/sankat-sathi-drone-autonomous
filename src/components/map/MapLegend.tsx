import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'rgba(11, 16, 26, 0.92)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #1c283c',
        borderRadius: '6px',
        fontSize: '11px',
        maxWidth: '260px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
        className="font-tactical"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} color="#38bdf8" />
          <span>TACTICAL MAP LAYERS</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isOpen && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid #1c283c', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>Survivor Pin (AI Verified)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>Active Fire / Thermal Zone</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>Flood / Water Inundation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>11kV Power Line Hazard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '8px', border: '1px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.25)', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>Searched Sector (100%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '8px', border: '1px solid #38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.35)', display: 'inline-block' }} />
            <span style={{ color: '#f8fafc' }}>Searching (Active Sweep)</span>
          </div>
        </div>
      )}
    </div>
  );
};
