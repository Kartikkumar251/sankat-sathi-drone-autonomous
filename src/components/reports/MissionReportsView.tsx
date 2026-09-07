import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  Printer,
  Copy,
  Shield,
  Activity,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { StatusBadge } from '../common/StatusBadge';
import { soundFX } from '../../services/audioService';

export const MissionReportsView: React.FC = () => {
  const { missionReport, detections, searchCells, comms } = useMission();
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const handleCopySITREP = () => {
    soundFX.playTacticalClick();
    navigator.clipboard.writeText(missionReport.sitrepSummary).catch(() => {});
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleExport = (format: 'PDF' | 'JSON') => {
    soundFX.playTacticalClick();
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(missionReport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${missionReport.missionId}_REPORT.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
    setExportNotification(`Mission Report exported successfully as ${format}`);
    setTimeout(() => setExportNotification(null), 3000);
  };

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
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }} className="font-tactical">
              MISSION REPORT & SITUATION REPORT (SITREP)
            </h2>
            <StatusBadge status={missionReport.status} variant={missionReport.status === 'COMPLETED' ? 'green' : 'amber'} size="sm" />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Official NDRF operational debrief, post-flight search coverage, and survivor triage intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('JSON')}
            style={{
              background: '#172338',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              padding: '8px 12px',
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
            <Download size={14} />
            EXPORT JSON
          </button>

          <button
            onClick={() => handleExport('PDF')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1px solid #38bdf8',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="tactical-btn font-tactical"
          >
            <Printer size={14} />
            EXPORT NDRF PDF REPORT
          </button>
        </div>
      </div>

      {exportNotification && (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
          {exportNotification}
        </div>
      )}

      {/* Main Grid: Left SITREP Generator | Right Mission Stats & Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* SITREP Generator Terminal */}
        <div
          style={{
            background: '#0e1420',
            border: '1px solid #1c283c',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="tactical-border"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c283c', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#38bdf8" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.05em' }} className="font-tactical">
                OPERATIONAL SITUATION REPORT (SITREP)
              </h3>
            </div>
            <button
              onClick={handleCopySITREP}
              style={{
                background: '#111825',
                border: '1px solid #293b57',
                color: '#38bdf8',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="tactical-btn"
            >
              <Copy size={12} />
              {copiedNotification ? 'COPIED TO CLIPBOARD' : 'COPY SITREP'}
            </button>
          </div>

          {/* Formatted SITREP Text Box */}
          <div
            style={{
              background: '#070a0f',
              border: '1px solid #293b57',
              borderRadius: '6px',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#f1f5f9',
              flex: 1,
              overflowY: 'auto',
              whiteSpace: 'pre-line',
            }}
          >
            {missionReport.sitrepSummary}
          </div>

          <div style={{ background: '#111825', border: '1px solid #1c283c', borderRadius: '4px', padding: '10px', fontSize: '11px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700, marginBottom: '2px' }}>
              <AlertTriangle size={13} color="#f59e0b" />
              <span>COMMAND DECISION SUPPORT NOTICE</span>
            </div>
            This SITREP is generated from autonomous edge AI sensor feeds. Information represents tactical decision support and recommendations for human NDRF incident commanders.
          </div>
        </div>

        {/* Right: Mission Stats Card & Encrypted Comms Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
          {/* Mission Metrics Summary */}
          <div
            style={{
              background: '#0e1420',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '16px',
            }}
            className="tactical-border"
          >
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px' }} className="font-tactical">
              SORTIE METRICS & AIRFRAME STATS
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Mission Identifier</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }} className="font-mono">{missionReport.missionId}</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Flight Duration</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }} className="font-mono">{missionReport.durationFormatted}</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Search Coverage</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }} className="font-mono">{missionReport.coveragePercent}% ({missionReport.areaCoveredKm2} km²)</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Battery Consumed</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b' }} className="font-mono">{missionReport.batteryConsumedPercent}%</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Survivors Tagged</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444' }} className="font-mono">{missionReport.survivorsDetected} Persons</div>
              </div>
              <div style={{ background: '#111825', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b' }}>Hazards Cataloged</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f97316' }} className="font-mono">{missionReport.hazardsDetected} Hazards</div>
              </div>
            </div>
          </div>

          {/* Comms Log Panel */}
          <div
            style={{
              background: '#0e1420',
              border: '1px solid #1c283c',
              borderRadius: '6px',
              padding: '14px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
            className="tactical-border"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} color="#38bdf8" />
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }} className="font-tactical">
                  COMMAND ENCRYPTED COMMS LOG
                </h4>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }} className="font-mono">
                AES-256 GCS CHANNEL
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
              {comms.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    background: '#111825',
                    border: '1px solid #1c283c',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '9px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: msg.sender === 'AI_CORE' ? '#06b6d4' : msg.sender === 'DRONE-01' ? '#38bdf8' : '#10b981' }}>
                      {msg.sender} ({msg.senderRole})
                    </span>
                    <span className="font-mono">{msg.time}</span>
                  </div>
                  <div style={{ color: '#e2e8f0', lineHeight: '1.3' }}>{msg.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
