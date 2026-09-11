import {
  ArrowLeft,
  HeartPulse,
  Droplet,
  Wind,
  Thermometer,
  Activity,
  Brain,
  FileText,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import type { Page, Patient, ClinicalData } from '@/types';
import { api } from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';

interface PatientDetailProps {
  patientId: number;
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

function VitalRow({ icon, label, value, unit, normal }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  normal: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${normal ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">
          {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
        </p>
      </div>
      <span className={`w-2 h-2 rounded-full ${normal ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
    </div>
  );
}

function checkNormal(vital: string, value: number | undefined): boolean {
  if (value === undefined) return true;
  switch (vital) {
    case 'heart_rate': return value >= 60 && value <= 100;
    case 'systolic_bp': return value >= 90 && value <= 140;
    case 'diastolic_bp': return value >= 60 && value <= 90;
    case 'oxygen_saturation': return value >= 95;
    case 'respiratory_rate': return value >= 12 && value <= 20;
    case 'temperature': return value >= 36.1 && value <= 37.5;
    default: return true;
  }
}

export function PatientDetail({ patientId, onNavigate }: PatientDetailProps) {
  const { data: patient, loading: pLoading, error: pError, refresh: refreshPatient } = useFetch<Patient>(
    () => api.getPatient(patientId),
    [patientId],
  );
  const { data: clinicalData, loading: cLoading, error: cError, refresh: refreshClinical } = useFetch<ClinicalData[]>(
    () => api.getClinicalData(patientId),
    [patientId],
  );

  if (pLoading && !patient) return <LoadingOverlay message="Loading patient…" />;
  if (pError && !patient) return <ErrorState message={pError} onRetry={refreshPatient} />;

  const latestEncounter = clinicalData && clinicalData.length > 0 ? clinicalData[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate('patients')}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Patient header */}
      <Card>
        <CardBody className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {patient?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patient?.name}</h2>
              <p className="text-sm text-slate-500">
                Patient ID: {patient?.patient_id} · {patient?.age} years · {patient?.gender}
              </p>
              {patient?.blood_type && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full ring-1 ring-red-200">
                  <Droplet className="w-3 h-3" />
                  Blood Type: {patient.blood_type}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:ml-auto flex-1 md:max-w-md">
            {patient?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" /> {patient.phone}
              </div>
            )}
            {patient?.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" /> {patient.email}
              </div>
            )}
            {patient?.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600 col-span-full">
                <MapPin className="w-4 h-4 text-slate-400" /> {patient.address}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Medical info + Latest vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical info */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Medical History" icon={<FileText className="w-4 h-4" />} />
            <CardBody>
              <p className="text-sm text-slate-600 leading-relaxed">
                {patient?.medical_history || 'No medical history recorded.'}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Allergies" icon={<AlertCircle className="w-4 h-4" />} />
            <CardBody>
              {patient?.allergies ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg ring-1 ring-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  {patient.allergies}
                </span>
              ) : (
                <p className="text-sm text-slate-500">No known allergies.</p>
              )}
            </CardBody>
          </Card>
          {patient?.emergency_contact && (
            <Card>
              <CardHeader title="Emergency Contact" icon={<User className="w-4 h-4" />} />
              <CardBody>
                <p className="text-sm text-slate-600">{patient.emergency_contact}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Latest vitals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Latest Vital Signs"
              subtitle={latestEncounter ? `Encounter #${latestEncounter.encounter_id}` : 'No clinical data'}
              icon={<Activity className="w-4 h-4" />}
              action={
                latestEncounter && (
                  <button
                    onClick={() => onNavigate('ai-assessment', { encounterId: latestEncounter.encounter_id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg hover:bg-brand-100 transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    AI Assess
                  </button>
                )
              }
            />
            <CardBody>
              {cLoading && !clinicalData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-lg" />
                  ))}
                </div>
              ) : cError ? (
                <ErrorState message={cError} onRetry={refreshClinical} />
              ) : latestEncounter ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <VitalRow icon={<HeartPulse className="w-4 h-4" />} label="Heart Rate" value={latestEncounter.heart_rate ?? '—'} unit="bpm" normal={checkNormal('heart_rate', latestEncounter.heart_rate)} />
                  <VitalRow icon={<Droplet className="w-4 h-4" />} label="Systolic BP" value={latestEncounter.systolic_bp ?? '—'} unit="mmHg" normal={checkNormal('systolic_bp', latestEncounter.systolic_bp)} />
                  <VitalRow icon={<Droplet className="w-4 h-4" />} label="Diastolic BP" value={latestEncounter.diastolic_bp ?? '—'} unit="mmHg" normal={checkNormal('diastolic_bp', latestEncounter.diastolic_bp)} />
                  <VitalRow icon={<Wind className="w-4 h-4" />} label="Oxygen Sat." value={latestEncounter.oxygen_saturation ?? '—'} unit="%" normal={checkNormal('oxygen_saturation', latestEncounter.oxygen_saturation)} />
                  <VitalRow icon={<Activity className="w-4 h-4" />} label="Resp. Rate" value={latestEncounter.respiratory_rate ?? '—'} unit="/min" normal={checkNormal('respiratory_rate', latestEncounter.respiratory_rate)} />
                  <VitalRow icon={<Thermometer className="w-4 h-4" />} label="Temperature" value={latestEncounter.temperature ?? '—'} unit="°C" normal={checkNormal('temperature', latestEncounter.temperature)} />
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No clinical data available for this patient.</p>
              )}

              {/* Symptoms */}
              {latestEncounter?.symptoms && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 ring-1 ring-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-1">Reported Symptoms</p>
                  <p className="text-sm text-amber-900">{latestEncounter.symptoms}</p>
                </div>
              )}
              {latestEncounter?.chief_complaint && (
                <div className="mt-2 p-3 rounded-lg bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 mb-1">Chief Complaint</p>
                  <p className="text-sm text-slate-700">{latestEncounter.chief_complaint}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Encounter history */}
          {clinicalData && clinicalData.length > 1 && (
            <Card className="mt-6">
              <CardHeader title="Encounter History" subtitle={`${clinicalData.length} encounters`} icon={<Calendar className="w-4 h-4" />} />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {clinicalData.map((enc) => (
                    <div key={enc.encounter_id} className="flex items-center gap-4 p-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-600">
                        #{enc.encounter_id}
                      </div>
                      <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                        <div><span className="text-slate-400">HR</span> <span className="font-medium text-slate-700">{enc.heart_rate ?? '—'}</span></div>
                        <div><span className="text-slate-400">SBP</span> <span className="font-medium text-slate-700">{enc.systolic_bp ?? '—'}</span></div>
                        <div><span className="text-slate-400">DBP</span> <span className="font-medium text-slate-700">{enc.diastolic_bp ?? '—'}</span></div>
                        <div><span className="text-slate-400">O2</span> <span className="font-medium text-slate-700">{enc.oxygen_saturation ?? '—'}</span></div>
                        <div><span className="text-slate-400">RR</span> <span className="font-medium text-slate-700">{enc.respiratory_rate ?? '—'}</span></div>
                        <div><span className="text-slate-400">Temp</span> <span className="font-medium text-slate-700">{enc.temperature ?? '—'}</span></div>
                      </div>
                      <button
                        onClick={() => onNavigate('ai-assessment', { encounterId: enc.encounter_id })}
                        className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded-md hover:bg-brand-100 transition-colors whitespace-nowrap"
                      >
                        Assess
                      </button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
