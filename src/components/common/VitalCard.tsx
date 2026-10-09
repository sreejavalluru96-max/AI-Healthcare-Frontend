import React from 'react';
import { VitalSigns } from '../../types';
import { Heart, Activity, Wind, Thermometer, Droplet, Gauge } from 'lucide-react';

interface VitalCardProps {
  vitals: VitalSigns;
  compact?: boolean;
}

export const VitalCard: React.FC<VitalCardProps> = ({ vitals, compact = false }) => {
  const getHeartRateStatus = (hr: number) => {
    if (hr > 120 || hr < 50) return { label: 'CRITICAL', color: 'var(--critical-badge)' };
    if (hr > 100 || hr < 60) return { label: 'HIGH', color: 'var(--high-badge)' };
    return { label: 'NORMAL', color: 'var(--stable-badge)' };
  };

  const getSpO2Status = (spO2: number) => {
    if (spO2 < 88) return { label: 'CRITICAL', color: 'var(--critical-badge)' };
    if (spO2 <= 93) return { label: 'WARNING', color: 'var(--high-badge)' };
    return { label: 'OPTIMAL', color: 'var(--stable-badge)' };
  };

  const getBPStatus = (sys: number) => {
    if (sys >= 160) return { label: 'HIGH STAGE 2', color: 'var(--critical-badge)' };
    if (sys >= 140) return { label: 'ELEVATED', color: 'var(--high-badge)' };
    return { label: 'NORMAL', color: 'var(--stable-badge)' };
  };

  const hrStat = getHeartRateStatus(vitals.heartRate);
  const spO2Stat = getSpO2Status(vitals.spO2);
  const bpStat = getBPStatus(vitals.systolicBP);

  if (compact) {
    return (
      <div className="vitals-compact-strip">
        <div className="vital-chip">
          <Heart size={14} className="icon-pulse" />
          <span className="vital-chip-val">{vitals.heartRate} bpm</span>
        </div>
        <div className="vital-chip">
          <Activity size={14} />
          <span className="vital-chip-val">{vitals.bloodPressure}</span>
        </div>
        <div className="vital-chip">
          <Wind size={14} />
          <span className="vital-chip-val">{vitals.spO2}% SpO2</span>
        </div>
        <div className="vital-chip">
          <Thermometer size={14} />
          <span className="vital-chip-val">{vitals.temperature}°C</span>
        </div>

        <style>{`
          .vitals-compact-strip {
            display: flex;
            flex-wrap: wrap;
            gap: 0.625rem;
          }
          .vital-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-primary);
          }
          .icon-pulse {
            color: #e11d48;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="vitals-grid">
      {/* Heart Rate */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Heart size={16} className="text-red" /> Heart Rate</span>
          <span className="vital-tag" style={{ backgroundColor: hrStat.color }}>{hrStat.label}</span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.heartRate}</span>
          <span className="vital-unit">bpm</span>
        </div>
        <div className="vital-sub">Normal: 60–100 bpm</div>
      </div>

      {/* Blood Pressure */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Gauge size={16} className="text-blue" /> Blood Pressure</span>
          <span className="vital-tag" style={{ backgroundColor: bpStat.color }}>{bpStat.label}</span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.bloodPressure}</span>
          <span className="vital-unit">mmHg</span>
        </div>
        <div className="vital-sub">Normal: &lt;120/80 mmHg</div>
      </div>

      {/* SpO2 */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Wind size={16} className="text-teal" /> SpO2</span>
          <span className="vital-tag" style={{ backgroundColor: spO2Stat.color }}>{spO2Stat.label}</span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.spO2}%</span>
          <span className="vital-unit">Saturation</span>
        </div>
        <div className="vital-sub">Normal: 95–100%</div>
      </div>

      {/* Temperature */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Thermometer size={16} className="text-orange" /> Temp</span>
          <span className="vital-tag" style={{ backgroundColor: vitals.temperature > 38 ? 'var(--critical-badge)' : 'var(--stable-badge)' }}>
            {vitals.temperature > 38 ? 'FEVER' : 'NORMAL'}
          </span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.temperature}</span>
          <span className="vital-unit">°C</span>
        </div>
        <div className="vital-sub">Normal: 36.5–37.5°C</div>
      </div>

      {/* Respiratory Rate */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Activity size={16} className="text-indigo" /> Resp Rate</span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.respiratoryRate}</span>
          <span className="vital-unit">/min</span>
        </div>
        <div className="vital-sub">Normal: 12–20 /min</div>
      </div>

      {/* Blood Glucose */}
      <div className="vital-tile">
        <div className="vital-tile-header">
          <span className="vital-name"><Droplet size={16} className="text-purple" /> Blood Glucose</span>
        </div>
        <div className="vital-value-row">
          <span className="vital-value">{vitals.bloodGlucose}</span>
          <span className="vital-unit">mg/dL</span>
        </div>
        <div className="vital-sub">Normal: 70–140 mg/dL</div>
      </div>

      <style>{`
        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .vital-tile {
          background-color: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .vital-tile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vital-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .vital-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #ffffff;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
        }
        .vital-value-row {
          display: flex;
          align-baseline;
          gap: 0.375rem;
        }
        .vital-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }
        .vital-unit {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .vital-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .text-red { color: #dc2626; }
        .text-blue { color: #0284c7; }
        .text-teal { color: #0d9488; }
        .text-orange { color: #ea580c; }
        .text-indigo { color: #4f46e5; }
        .text-purple { color: #9333ea; }
      `}</style>
    </div>
  );
};
