import { useState, useMemo } from 'react';
import { Users, Search, ArrowRight, UserPlus, Filter } from 'lucide-react';
import type { Page, Patient } from '@/types';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/Loading';
import { ErrorState, EmptyState } from '@/components/ui/ErrorState';
import { SkeletonRow } from '@/components/ui/Loading';

interface PatientsProps {
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

export function Patients({ onNavigate }: PatientsProps) {
  const { data: patients, loading, error, refresh } = usePolling<Patient[]>(
    () => api.getPatients(),
    15000,
  );
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!patients) return [];
    return patients.filter((p) => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.patient_id).includes(search);
      const matchGender = genderFilter === 'all' || p.gender === genderFilter;
      return matchSearch && matchGender;
    });
  }, [patients, search, genderFilter]);

  if (loading && !patients) return <LoadingOverlay message="Loading patients…" />;
  if (error && !patients) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg flex-1 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or patient ID…"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm outline-none cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patient list */}
      <Card>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="text-brand-600"><Users className="w-4 h-4" /></div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">All Patients</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} of {patients?.length || 0} patients · auto-refresh 15s
              </p>
            </div>
          </div>
        </div>

        {loading && !patients ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No patients found"
            message={search || genderFilter !== 'all' ? 'Try adjusting your filters.' : 'No patients are registered in the system yet.'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <button
                key={p.patient_id}
                onClick={() => onNavigate('patient-detail', { patientId: p.patient_id })}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {p.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="font-medium text-sm text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">ID: {p.patient_id}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-slate-400">Age</p>
                    <p className="text-sm text-slate-700">{p.age}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-slate-400">Gender</p>
                    <p className="text-sm text-slate-700">{p.gender}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-slate-400">Blood Type</p>
                    <p className="text-sm text-slate-700">{p.blood_type || '—'}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
