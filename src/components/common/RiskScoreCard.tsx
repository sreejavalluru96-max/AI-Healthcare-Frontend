import React from 'react';
import { PriorityLevel } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { ShieldAlert, Info } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  priority: PriorityLevel;
  riskFactors?: string[];
  explanation?: string;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score,
  priority,
  riskFactors = [],
  explanation,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'var(--critical-badge)';
    if (val >= 65) return 'var(--high-badge)';
    if (val >= 45) return 'var(--moderate-badge)';
    return 'var(--stable-badge)';
  };

  const color = getScoreColor(score);

  return (
    <div className="risk-score-card card">
      <div className="risk-score-top">
        <div className="risk-score-gauge">
          <div className="score-number-box" style={{ borderColor: color, color }}>
            <span className="score-val">{score}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-label-box">
            <span className="score-title">AI Risk Score</span>
            <div className="badge-row">
              <PriorityBadge priority={priority} size="md" />
            </div>
          </div>
        </div>

        {/* Progress meter bar */}
        <div className="risk-meter-wrapper">
          <div className="risk-meter-bar">
            <div
              className="risk-meter-fill"
              style={{ width: `${score}%`, backgroundColor: color }}
            ></div>
          </div>
          <div className="risk-meter-labels">
            <span>0 (Low Risk)</span>
            <span>50</span>
            <span>100 (Critical)</span>
          </div>
        </div>
      </div>

      {riskFactors.length > 0 && (
        <div className="risk-factors-section">
          <h4 className="factors-heading">
            <ShieldAlert size={16} /> Key Clinical Risk Factors
          </h4>
          <ul className="factors-list">
            {riskFactors.map((factor, idx) => (
              <li key={idx} className="factor-item">
                <span className="bullet-dot" style={{ backgroundColor: color }}></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {explanation && (
        <div className="risk-explanation-box">
          <div className="explanation-title">
            <Info size={15} /> AI Clinical Assessment Summary
          </div>
          <p className="explanation-text">{explanation}</p>
        </div>
      )}

      <style>{`
        .risk-score-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .risk-score-top {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .risk-score-gauge {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .score-number-box {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md);
          border: 3px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          box-shadow: var(--shadow-sm);
        }
        .score-val {
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1;
        }
        .score-max {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .score-label-box {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .score-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .badge-row {
          display: flex;
          align-items: center;
        }
        .risk-meter-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .risk-meter-bar {
          width: 100%;
          height: 10px;
          background-color: #e2e8f0;
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .risk-meter-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .risk-meter-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .risk-factors-section {
          background-color: #f8fafc;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }
        .factors-heading {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.625rem;
        }
        .factors-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .factor-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.84rem;
          color: var(--text-secondary);
        }
        .bullet-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .risk-explanation-box {
          background-color: var(--primary-50);
          border: 1px solid var(--primary-100);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }
        .explanation-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--primary-700);
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-bottom: 0.375rem;
        }
        .explanation-text {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
