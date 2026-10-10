
export let API_BASE_URL = 'https://mediqueueai-backend.onrender.com';

export interface ApiErrorResponse {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Candidates to try: direct 127.0.0.1:8000, direct localhost:8000, and relative URL (Vite proxy)
const BACKEND_CANDIDATES = [
  'https://mediqueueai-backend.onrender.com',
  'http://localhost:8000',
  '',
];

let workingBaseUrl: string | null = null;

/**
 * Generic helper for making HTTP fetch requests to the FastAPI backend.
 * Tries direct http://127.0.0.1:8000 base URL and candidate fallback URLs.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const candidatesToTry = workingBaseUrl
    ? [workingBaseUrl, ...BACKEND_CANDIDATES.filter((c) => c !== workingBaseUrl)]
    : BACKEND_CANDIDATES;

  let lastError: any = null;

  for (const base of candidatesToTry) {
    const url = `${base}${cleanEndpoint}`;

    if (cleanEndpoint.includes('prescriptions')) {
      console.log('[Prescription] Request URL:', url);
      console.log('[Prescription] Payload:', options?.body);
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (cleanEndpoint.includes('prescriptions')) {
        console.log('[Prescription] Response status:', response.status);
        console.log('[Prescription] Response:', responseData);
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

        if (responseData) {
          if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else if (Array.isArray(responseData.detail)) {
            errorMessage = responseData.detail
              .map((e: any) => `${e.loc ? e.loc.join('.') : 'field'}: ${e.msg}`)
              .join('; ');
          } else if (responseData.message && typeof responseData.message === 'string') {
            errorMessage = responseData.message;
          }
        }

        const error: Error & ApiErrorResponse = new Error(errorMessage);
        error.status = response.status;

        // If candidate relative URL (base === '') returned 404, try direct backend URL
        if (base === '' && response.status === 404) {
          lastError = error;
          continue;
        }

        if (cleanEndpoint.includes('prescriptions')) {
          console.error('[Prescription] Actual error:', error);
        }

        throw error;
      }

      if (response.status === 204) {
        workingBaseUrl = base;
        return {} as T;
      }

      if (workingBaseUrl !== base) {
        console.log(`[MediQueue API] Backend connected successfully via: ${base}`);
        workingBaseUrl = base;
        API_BASE_URL = base.startsWith('http') ? base : 'http://127.0.0.1:8000';
      }

      return (responseData ?? {}) as T;
    } catch (err: any) {
      lastError = err;

      // If backend returned an HTTP status (e.g. 400, 422, 500), throw immediately!
      if (err.status !== undefined && !(base === '' && err.status === 404)) {
        if (cleanEndpoint.includes('prescriptions')) {
          console.error('[Prescription] Actual error:', err);
        }
        throw err;
      }

      console.warn(`[MediQueue API] Candidate request to ${url} failed (network/CORS):`, err?.message || err);
    }
  }

  console.error(`[MediQueue API] All backend endpoints failed for ${endpoint}. Last error:`, lastError);
  if (cleanEndpoint.includes('prescriptions')) {
    console.error('[Prescription] Actual error:', lastError);
  }
  const error: Error & ApiErrorResponse = new Error(`FastAPI backend is unavailable at https://mediqueueai-backend.onrender.com`);
  error.isNetworkError = true;
  throw error;
}