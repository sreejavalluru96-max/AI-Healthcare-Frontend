import type {
  HealthStatus,
  Patient,
  ClinicalData,
  RiskAssessment,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { accept: 'application/json' },
    });
  } catch {
    throw new ApiError(
      `Cannot reach the FastAPI server at ${API_BASE}. Make sure it is running and CORS is configured.`,
      0,
    );
  }
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<HealthStatus>('/health'),
  getPatients: () => request<Patient[]>('/patients'),
  getPatient: (id: number) => request<Patient>(`/patients/${id}`),
  getClinicalData: (id: number) =>
    request<ClinicalData[]>(`/patients/${id}/clinical-data`),
  getAssessment: (encounterId: number) =>
    request<RiskAssessment>(`/ai-assessment/${encounterId}`),
};
