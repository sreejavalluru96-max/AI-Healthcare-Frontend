import { useState, useCallback } from 'react';
import { Brain, Search, Sparkles, AlertCircle, Activity, User } from 'lucide-react';
import type { Page, RiskAssessment, Patient, ClinicalData } from '@/types';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';

interface AIAssessmentProps {
  initialEncounterId?: number;
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

function ScoreGauge({ score, label, level }: { score: number; label: string; level: string }) {
  const color =
    level === 'Critical' ? 'text-red-600' :
    level === 'High' ? 'text-orange-600' :
    level === 'Medium' ? 'text-amber-600' :
    'text-emerald-600';
  const ringColor =
    level === 'Critical' ? 'stroke-red-500' :
    level === 'High' ? 'stroke-orange-500' :
    level === 'Medium' ? 'stroke-amber-500' :
    'stroke-emerald-500';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-slate-100" />
          <circle
            cx="50" cy="50" r="45" fill="none" strokeWidth="8"
            className={`${ringColor} transition-all duration-700`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700 mt-2">{label}</p>
      <RiskBadge level={level} size="sm" />
    </div>
  );
}

export function AIAssessment({ initialEncounterId, onNavigate }: AIAssessmentProps) {
  const [encounterId, setEncounterId] = useState(initialEncounterId?.toString() || '');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounter, setEncounter] = useState<ClinicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssess = useCallback(async () => {
    const id = parseInt(encounterId, 10);
    if (!id || isNaN(id)) {
      setError('Please enter a valid encounter ID (a number).');
      return;
    }
    setLoading(true);
    setError(null);
    setAssessment(null);
    setPatient(null);
    setEncounter(null);
    try {
      const result = await api.getAssessment(id);
      setAssessment(result);
      try {
        const p = await api.getPatient(result.patient_id);
        setPatient(p);
      } catch { /* non-fatal */ }
      try {
        const clinical = await api.getClinicalData(result.patient_id);
        const match = clinical.find((c) => c.encounter_id === id);
        if (match) setEncounter(match);
      } catch { /* non-fatal */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI assessment');
    } finally {
      setLoading(false);
    }
  }, [encounterId]);

  // Auto-run if initialEncounterId provided
  useState(() => {
    if (initialEncounterId) handleAssess();
  });

  const explanationPoints = assessment?.explanation
    ? assessment.explanation.split(/[,.]/).map((s) => s.trim()).filter((s) => s.length > 3)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search bar */}
      <Card>
        <CardHeader
          title="AI Risk Assessment"
          subtitle="Enter an encounter ID to get the AI-generated risk score and explanation"
          icon={<Brain className="w-4 h-4" />}
        />
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={encounterId}
                onChange={(e) => setEncounterId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAssess()}
                placeholder="Encounter ID (e.g. 4)…"
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={handleAssess}
              disabled={loading || !encounterId}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing…' : 'Run Assessment'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Tip: try encounter IDs from the Priority Queue or a patient's clinical records.
          </p>
        </CardBody>
      </Card>

      {/* Error */}
      {error && (
        <ErrorState title="Assessment Failed" message={error} onRetry={handleAssess} />
      )}

      {/* Results */}
      {assessment && (
        <div className="space-y-6 animate-slide-up">
          {/* Patient banner */}
          {patient && (
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {patient.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-900">{patient.name}</p>
                <p className="text-xs text-slate-500">
                  Patient ID: {patient.patient_id} · {patient.age}y · {patient.gender}
                </p>
              </div>
              <button
                onClick={() => onNavigate('patient-detail', { patientId: patient.patient_id })}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                View Profile
              </button>
            </div>
          )}

          {/* Score gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Risk Score" subtitle="AI-computed clinical risk" icon={<AlertCircle className="w-4 h-4" />} />
              <CardBody className="flex justify-center py-8">
                <ScoreGauge score={assessment.risk_score} label="Risk Level" level={assessment.risk_level} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Priority Score" subtitle="Triage urgency ranking" icon={<Activity className="w-4 h-4" />} />
              <CardBody className="flex justify-center py-8">
                <ScoreGauge score={assessment.priority_score} label="Priority Level" level={assessment.priority_level} />
              </CardBody>
            </Card>
          </div>

          {/* Explanation */}
          <Card>
            <CardHeader
              title="AI Explanation"
              subtitle="Factors contributing to this assessment"
              icon={<Brain className="w-4 h-4" />}
            />
            <CardBody>
              <div className="space-y-2">
                {explanationPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      point.toLowerCase().includes('severe') || point.toLowerCase().includes('very') || point.toLowerCase().includes('chest pain')
                        ? 'bg-red-500'
                        : point.toLowerCase().includes('high') || point.toLowerCase().includes('low')
                        ? 'bg-orange-500'
                        : 'bg-slate-400'
                    }`} />
                    <p className="text-sm text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Encounter vitals snapshot */}
          {encounter && (
            <Card>
              <CardHeader title="Encounter Vitals" subtitle={`Encounter #${encounter.encounter_id}`} icon={<Activity className="w-4 h-4" />} />
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Heart Rate', value: encounter.heart_rate, unit: 'bpm' },
                    { label: 'Systolic BP', value: encounter.systolic_bp, unit: 'mmHg' },
                    { label: 'Diastolic BP', value: encounter.diastolic_bp, unit: 'mmHg' },
                    { label: 'Oxygen', value: encounter.oxygen_saturation, unit: '%' },
                    { label: 'Resp. Rate', value: encounter.respiratory_rate, unit: '/min' },
                    { label: 'Temperature', value: encounter.temperature, unit: '°C' },
                  ].map((v) => (
                    <div key={v.label} className="p-3 rounded-lg bg-slate-50 text-center">
                      <p className="text-xs text-slate-400 mb-1">{v.label}</p>
                      <p className="text-lg font-bold text-slate-900">
                        {v.value ?? '—'}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">{v.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
                {encounter.symptoms && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 ring-1 ring-amber-200">
                    <p className="text-xs font-medium text-amber-700 mb-1">Symptoms</p>
                    <p className="text-sm text-amber-900">{encounter.symptoms}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Idle state */}
      {!assessment && !error && !loading && (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Ready to assess</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Enter an encounter ID above and click "Run Assessment" to get the AI risk score,
              priority level, and detailed explanation.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
