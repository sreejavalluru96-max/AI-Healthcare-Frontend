import { useEffect, useState, useCallback } from 'react';
import { Siren, Brain, ArrowRight, Clock, User, RefreshCw } from 'lucide-react';
import type { Page, Patient, ClinicalData, RiskAssessment, PriorityQueueItem } from '@/types';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/Loading';
import { ErrorState, EmptyState } from '@/components/ui/ErrorState';
import { SkeletonRow } from '@/components/ui/Loading';

interface PriorityQueueProps {
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

const priorityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Normal: 4,
};

export function PriorityQueue({ onNavigate }: PriorityQueueProps) {
  const [items, setItems] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patients = await api.getPatients();
      const clinicalResults = await Promise.all(
        patients.map((p) =>
          api.getClinicalData(p.patient_id).catch(() => []),
        ),
      );

      const encounterPairs: { encounterId: number; patient: Patient }[] = [];
      patients.forEach((patient, i) => {
        const encounters = clinicalResults[i];
        if (encounters && encounters.length > 0) {
          encounterPairs.push({ encounterId: encounters[0].encounter_id, patient });
        }
      });

      const assessments = await Promise.all(
        encounterPairs.map((pair) =>
          api.getAssessment(pair.encounterId).catch(() => null),
        ),
      );

      const queueItems: PriorityQueueItem[] = [];
      encounterPairs.forEach((pair, i) => {
        const assessment = assessments[i];
        if (assessment) {
          queueItems.push({
            encounter_id: pair.encounterId,
            patient_id: pair.patient.patient_id,
            patient_name: pair.patient.name,
            risk_level: assessment.risk_level,
            risk_score: assessment.risk_score,
            priority_level: assessment.priority_level,
            priority_score: assessment.priority_score,
            explanation: assessment.explanation,
          });
        }
      });

      queueItems.sort((a, b) => {
        const pOrder = (priorityOrder[a.priority_level] ?? 5) - (priorityOrder[b.priority_level] ?? 5);
        if (pOrder !== 0) return pOrder;
        return b.priority_score - a.priority_score;
      });

      setItems(queueItems);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load priority queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const id = setInterval(fetchQueue, 15000);
    return () => clearInterval(id);
  }, [fetchQueue]);

  const criticalCount = items.filter((i) => i.priority_level === 'Critical').length;
  const highCount = items.filter((i) => i.priority_level === 'High').length;

  if (loading && items.length === 0) return <LoadingOverlay message="Building priority queue from AI assessments…" />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={fetchQueue} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-5 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center gap-3">
            <Siren className="w-6 h-6" />
            <div>
              <p className="text-3xl font-bold">{criticalCount}</p>
              <p className="text-sm text-white/80">Critical Priority</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl p-5 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <p className="text-3xl font-bold">{highCount}</p>
              <p className="text-sm text-white/80">High Risk</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-3xl font-bold text-slate-900">{items.length}</p>
              <p className="text-sm text-slate-500">Total in Queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()} · Auto-refresh: 15s`}
        </p>
        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Queue */}
      <Card>
        <CardHeader
          title="Emergency Priority Queue"
          subtitle="Sorted by AI priority score — most critical first"
          icon={<Siren className="w-4 h-4" />}
        />
        <CardBody className="p-0">
          {loading && items.length === 0 ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Siren className="w-7 h-7" />}
              title="Queue is empty"
              message="No AI assessments available. Ensure encounters exist and the assessment endpoint is reachable."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <div
                  key={item.encounter_id}
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 ${
                    idx === 0 ? 'bg-red-50/50' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    idx === 0 ? 'bg-red-500 text-white' :
                    idx === 1 ? 'bg-orange-500 text-white' :
                    idx === 2 ? 'bg-amber-500 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-sm text-slate-900">{item.patient_name}</p>
                      <RiskBadge level={item.priority_level} size="sm" />
                      <RiskBadge level={item.risk_level} score={item.risk_score} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      Patient ID: {item.patient_id} · Encounter: #{item.encounter_id} · Priority Score: {item.priority_score}/100
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-1 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('patient-detail', { patientId: item.patient_id })}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                      <User className="w-3 h-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => onNavigate('ai-assessment', { encounterId: item.encounter_id })}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 rounded-md hover:bg-brand-100 transition-colors whitespace-nowrap"
                    >
                      <Brain className="w-3 h-3" />
                      Assess
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
