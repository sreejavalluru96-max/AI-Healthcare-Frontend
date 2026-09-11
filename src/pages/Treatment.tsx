import { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  X,
  User,
  Brain,
  Activity,
  Trash2,
  FileText,
} from 'lucide-react';
import type { Page } from '@/types';
import { useTreatments } from '@/context/TreatmentContext';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/ErrorState';

interface TreatmentProps {
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ago`;
}

function duration(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${mins}m`;
}

const outcomes = [
  'Stabilized',
  'Admitted',
  'Discharged',
  'Transferred',
  'Deceased',
  'Observation',
];

export function TreatmentPage({ onNavigate }: TreatmentProps) {
  const { activeTreatments, completedTreatments, completeTreatment, removeFromTreatment } = useTreatments();
  const [modalTreatmentId, setModalTreatmentId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('Stabilized');
  const [notes, setNotes] = useState('');

  const modalTreatment = activeTreatments.find((t) => t.treatment_id === modalTreatmentId);

  const handleComplete = () => {
    if (modalTreatmentId) {
      completeTreatment(modalTreatmentId, outcome, notes);
      setModalTreatmentId(null);
      setOutcome('Stabilized');
      setNotes('');
    }
  };

  const handleCloseModal = () => {
    setModalTreatmentId(null);
    setOutcome('Stabilized');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-5 text-white shadow-lg shadow-brand-500/20">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6" />
            <div>
              <p className="text-3xl font-bold">{activeTreatments.length}</p>
              <p className="text-sm text-white/80">Active Treatments</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="text-3xl font-bold">{completedTreatments.length}</p>
              <p className="text-sm text-white/80">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {activeTreatments.length + completedTreatments.length}
              </p>
              <p className="text-sm text-slate-500">Total Cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active treatments */}
      <Card>
        <CardHeader
          title="Active Treatments"
          subtitle={`${activeTreatments.length} patient${activeTreatments.length !== 1 ? 's' : ''} currently being treated`}
          icon={<Stethoscope className="w-4 h-4" />}
        />
        <CardBody className="p-0">
          {activeTreatments.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="w-7 h-7" />}
              title="No active treatments"
              message="Start treating patients from the Emergency Priority Queue by clicking 'Treat' on a case."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {activeTreatments.map((t) => (
                <div key={t.treatment_id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                  {/* Status indicator */}
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 bg-brand-500 rounded-full animate-pulse" />
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-medium text-sm text-slate-900">{t.patient_name}</p>
                      <RiskBadge level={t.priority_level} size="sm" />
                      <RiskBadge level={t.risk_level} score={t.risk_score} size="sm" />
                      <span className="inline-flex items-center gap-1 text-xs text-brand-600 font-medium">
                        <Clock className="w-3 h-3" />
                        {duration(t.started_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      Patient ID: {t.patient_id} · Encounter: #{t.encounter_id} · Started {timeAgo(t.started_at)}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-1 leading-relaxed">
                      {t.explanation}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('patient-detail', { patientId: t.patient_id })}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                      <User className="w-3 h-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => setModalTreatmentId(t.treatment_id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Completed treatments */}
      {completedTreatments.length > 0 && (
        <Card>
          <CardHeader
            title="Completed Treatments"
            subtitle={`${completedTreatments.length} case${completedTreatments.length !== 1 ? 's' : ''} resolved — removed from active queue`}
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {completedTreatments.map((t) => (
                <div key={t.treatment_id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-medium text-sm text-slate-900">{t.patient_name}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full ring-1 ring-emerald-200">
                        {t.outcome || 'Completed'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Completed {timeAgo(t.completed_at || t.started_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Patient ID: {t.patient_id} · Encounter: #{t.encounter_id}
                    </p>
                    {t.treatment_notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-1 leading-relaxed flex items-start gap-2">
                        <FileText className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        {t.treatment_notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromTreatment(t.treatment_id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    title="Remove from records"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Complete treatment modal */}
      {modalTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Complete Treatment</h3>
                  <p className="text-xs text-slate-500">{modalTreatment.patient_name} · Encounter #{modalTreatment.encounter_id}</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Outcome selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Treatment Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  {outcomes.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOutcome(o)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        outcome === o
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Treatment Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the treatment provided, medications administered, follow-up instructions…"
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              {/* Risk recap */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Activity className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <RiskBadge level={modalTreatment.priority_level} size="sm" />
                  <RiskBadge level={modalTreatment.risk_level} score={modalTreatment.risk_score} size="sm" />
                </div>
                <span className="text-xs text-slate-400 ml-auto">
                  In treatment {duration(modalTreatment.started_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-5 border-t border-slate-100">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
