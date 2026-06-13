/**
 * Numera — Axios REST client
 *
 * All endpoints are backend-controlled.
 * Frontend only calls these; it never owns tutoring logic.
 */
import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const api = axios.create({
  baseURL: BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth token injection ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('numera_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Error normalisation ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number = error.response?.status ?? 0;
    if (status === 401 || status === 403) {
      // Token expired — clear and redirect to login (adjust to your auth flow)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('numera_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Endpoint helpers ──────────────────────────────────────────────────────────

export interface StartSessionPayload {
  studentId: string;
  topicId: string;
}

export interface StartSessionResponse {
  sessionId: string;
  state: string;
  consentRequired: boolean;
}

/** POST /session/start */
export async function startSession(payload: StartSessionPayload) {
  const res = await api.post<StartSessionResponse>('/session/start', payload);
  return res.data;
}

/** POST /session/end */
export async function endSession(sessionId: string) {
  await api.post('/session/end', { sessionId });
}

export interface InteractionPayload {
  sessionId: string;
  type: 'text' | 'canvas';
  text?: string;
  /** base64 PNG for canvas submissions */
  png?: string;
  strokes?: object[];
}

/** POST /interaction — student answer or canvas submission */
export async function sendInteraction(payload: InteractionPayload) {
  const res = await api.post('/interaction', payload);
  return res.data;
}

/** POST /hint — request a hint */
export async function requestHint(sessionId: string) {
  const res = await api.post('/hint', { sessionId });
  return res.data;
}

/** GET /consent/status */
export async function getConsentStatus(studentId: string) {
  const res = await api.get('/consent/status', { params: { studentId } });
  return res.data;
}

/** POST /consent/acknowledge */
export async function acknowledgeConsent(studentId: string) {
  await api.post('/consent/acknowledge', { studentId });
}
