// src/utils/api.js
const BASE = 'http://localhost:3000'; // Explicitly target your running Hono server

async function request(path, options = {}) {
  // Ensure session cookies are sent/received across origins (ports 3001/3002 <-> 3000)
  const fetchOptions = {
    ...options,
    credentials: 'include',
  };

  const res = await fetch(BASE + path, fetchOptions);
  const json = await res.json();
  return json;
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  getUserInfo: () => request('/user/info'),

  // SMTP Configs
  getConfigs: () => request('/config/smtp'),
  createConfig: (data) => request('/config/smtp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateConfig: (id, data) => request(`/config/smtp/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteConfig: (id) => request(`/config/smtp/${id}`, { method: 'DELETE' }),
  setDefaultConfig: (id) => request(`/config/smtp/${id}/default`, { method: 'POST' }),
  testConfig: (data) => request('/config/smtp/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),

  // Email (Updated with credentials flag for attachments and templates)
  send: (formData) => fetch(BASE + '/send', { method: 'POST', body: formData, credentials: 'include' }).then(r => r.json()),
  parseExcel: (formData) => fetch(BASE + '/parse-excel', { method: 'POST', body: formData, credentials: 'include' }).then(r => r.json()),

  // Reports
  getReport: () => request('/report'),
  exportReport: (format) => fetch(BASE + `/report/export/${format}`, { credentials: 'include' }),
  clearLogs: () => request('/report/clear', { method: 'DELETE' }),

  // Batch
  getBatchStatus: () => request('/batch-status'),
  pauseBatch: () => request('/batch-pause', { method: 'POST' }),
  resumeBatch: () => request('/batch-resume', { method: 'POST' }),
  cancelBatch: () => request('/batch-cancel', { method: 'DELETE' }),

  // Scheduled jobs
  getScheduledJobs: () => request('/scheduled-jobs'),
  cancelScheduledJob: (id) => request(`/scheduled-jobs/${id}`, { method: 'DELETE' }),

  // Dashboard
  getPollStatus: () => request('/dashboard/poll-status'),
  getDashboardData: () => request('/dashboard/data'),

  // Notifications
  testNotification: (data) => request('/test-notification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
};

export function processPassword(password, host) {
  if (!password) return password;
  const clean = password.trim();
  if (host?.toLowerCase().includes('gmail')) return clean.replace(/\s+/g, '');
  return clean;
}

export function validateGmailPassword(password, host) {
  if (!host?.toLowerCase().includes('gmail')) return { valid: true };
  const clean = password.replace(/\s+/g, '');
  if (clean.length !== 16) return { valid: false, message: `Gmail App Password should be 16 characters. Current: ${clean.length}.` };
  if (!/^[a-zA-Z0-9]+$/.test(clean)) return { valid: false, message: 'Gmail App Password should only contain letters and numbers.' };
  return { valid: true };
}