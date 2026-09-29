import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const signup = (name: string, email: string, password: string) =>
  api.post('/auth/signup', { name, email, password });

export const logout = () => api.post('/auth/logout');

export const wells = () => api.get('/wells');
export const wellDetail = (id: string) => api.get(`/wells/${id}`);

export const dashboard = (id: string) => api.get(`/dashboard/${id}`);

export const cssData = (id: string) => api.get(`/css/${id}`);
export const srpData = (id: string) => api.get(`/srp/${id}`);

export const predict = (id: string) => api.get(`/predictions/${id}`);
export const anomalies = (id: string) => api.get(`/anomalies/${id}`);

export const optimizeCSS = (id: string) => api.post(`/optimization/css/${id}`);
export const optimizeSRP = (id: string) => api.post(`/optimization/srp/${id}`);

// Virtual Well Digital Twin Endpoints
export const twinState = () => api.get('/twin/state');
export const twinStart = () => api.post('/twin/start');
export const twinPause = () => api.post('/twin/pause');
export const twinReset = () => api.post('/twin/reset');
export const twinPhase = (phase: string) => api.post('/twin/phase', { phase });
export const twinHighSpeedDisturbance = () => api.post('/twin/disturbance/high-speed');
export const twinRecommendation = () => api.get('/twin/recommendation');
export const twinApplyRecommendation = () => api.post('/twin/apply-recommendation');
export const twinPrediction = () => api.get('/twin/prediction');
export const twinSrpOptimization = () => api.get('/twin/optimize-srp');

// BAGHETWIN Copilot AI
export const copilotQuery = (query: string, wellId = 'BGW-001', history: any[] = []) =>
  api.post('/copilot/query', { query, well_id: wellId, history });

// Historical Operational Records & Audit Logs
export const getHistory = (params?: {
  well_id?: string;
  category?: string;
  severity?: string;
  time_range?: string;
  search?: string;
  limit?: number;
}) => api.get('/history', { params });

export const getHistoryTrends = (wellId = 'BGW-001') =>
  api.get('/history/trends', { params: { well_id: wellId } });

export const getHistorySummary = () => api.get('/history/summary');

export const logHistoryEvent = (payload: {
  well_id: string;
  category: string;
  event_type: string;
  message: string;
  severity?: string;
  operator?: string;
  metrics?: Record<string, any>;
}) => api.post('/history/log', payload);