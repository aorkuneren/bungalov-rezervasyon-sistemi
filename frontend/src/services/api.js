import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        await api.get('/sanctum/csrf-cookie');
      } catch (error) {
        // CSRF token fetch failed - continue without it
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getCsrfCookie: () => api.get('/sanctum/csrf-cookie'),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  forgotPassword: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
  getUser: () => api.get('/user'),
  autoLogin: (data) => api.post('/auto-login', data),
  revokeRememberToken: (data) => api.post('/revoke-remember-token', data),
};

export const settingsAPI = {
  // Company Settings
  getCompanySettings: () => api.get('/settings/company'),
  updateCompanySettings: (data) => api.put('/settings/company', data),
  uploadCompanyLogo: (formData) => api.post('/settings/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeCompanyLogo: () => api.delete('/settings/company/logo'),
  
  // Reservation Settings
  getReservationSettings: () => api.get('/settings/reservation'),
  updateReservationSettings: (data) => api.put('/settings/reservation', data),
  
  // General Settings (legacy)
  getSettings: () => api.get('/settings'),
  getPublicSettings: () => api.get('/settings/public'),
  updateSettings: (data) => api.put('/settings', data),
  getEkHizmetler: () => api.get('/ek-hizmetler'),
  saveEkHizmetler: (data) => api.post('/settings/ek-hizmetler', data),
  getSartlarKurallar: () => api.get('/settings/sartlar-kurallar'),
  saveSartlarKurallar: (data) => api.post('/settings/sartlar-kurallar', data),
  testEmail: (data) => api.post('/settings/test-email', data),
};

export const bungalowAPI = {
  getBungalows: (params = {}) => api.get('/bungalows', { params }),
  getBungalow: (id) => api.get(`/bungalows/${id}`),
  createBungalow: (data) => api.post('/bungalows', data),
  updateBungalow: (id, data) => api.put(`/bungalows/${id}`, data),
  deleteBungalow: (id) => api.delete(`/bungalows/${id}`),
};

export const customerAPI = {
  getCustomers: (params = {}) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

export const reservationAPI = {
  getReservations: (params = {}) => api.get('/reservations', { params }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  createReservation: (data) => api.post('/reservations', data),
  updateReservation: (id, data) => api.put(`/reservations/${id}`, data),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
  getReservationByConfirmationCode: (confirmationCode) => api.get(`/reservations/confirm/${confirmationCode}`),
  confirmReservation: (confirmationCode) => api.post(`/reservations/confirm/${confirmationCode}`),
  addPayment: (id, data) => api.post(`/reservations/${id}/payment`, data),
  updateCustomer: (id, data) => api.put(`/reservations/${id}/customer`, data),
  addService: (id, data) => api.post(`/reservations/${id}/service`, data),
  removeService: (id, data) => api.delete(`/reservations/${id}/service`, { data }),
  delayReservation: (id, data) => api.post(`/reservations/${id}/delay`, data),
};

export const templateAPI = {
  getTemplates: () => api.get('/templates'),
  getTemplate: (type, templateId) => api.get(`/templates/${type}/${templateId}`),
  updateTemplate: (type, templateId, data) => api.put(`/templates/${type}/${templateId}`, data),
  resetTemplate: (type, templateId) => api.post(`/templates/${type}/${templateId}/reset`),
  resetAllTemplates: () => api.post('/templates/reset-all'),
};

export const mailAPI = {
  getConfig: () => api.get('/mail/config'),
  updateConfig: (data) => api.put('/mail/config', data),
  sendTestEmail: (email) => api.post('/mail/test', { email }),
  sendReservationConfirmation: (data) => api.post('/mail/send-reservation-confirmation', data),
};

export const ekHizmetlerAPI = {
  getEkHizmetler: (params = {}) => api.get('/ek-hizmetler', { params }),
  createEkHizmet: (data) => api.post('/ek-hizmetler', data),
  getEkHizmet: (id) => api.get(`/ek-hizmetler/${id}`),
  updateEkHizmet: (id, data) => api.put(`/ek-hizmetler/${id}`, data),
  deleteEkHizmet: (id) => api.delete(`/ek-hizmetler/${id}`),
};

export const termsConditionsAPI = {
  getTermsConditions: () => api.get('/terms-conditions'),
  getTermsCondition: (type) => api.get(`/terms-conditions/${type}`),
  createTermsCondition: (data) => api.post('/terms-conditions', data),
  updateTermsCondition: (type, data) => api.put(`/terms-conditions/${type}`, data),
  deleteTermsCondition: (type) => api.delete(`/terms-conditions/${type}`),
  previewTermsCondition: (data) => api.post('/terms-conditions/preview', data),
};

export const systemSettingsAPI = {
  getSettings: () => api.get('/system/settings'),
  updateSettings: (data) => api.put('/system/settings', data),
};

export const mailTemplateAPI = {
  getTemplates: () => api.get('/mail/templates'),
  getTemplate: (type) => api.get(`/mail/templates/${type}`),
  updateTemplate: (type, data) => api.put(`/mail/templates/${type}`, data),
};

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
};

export const reportsAPI = {
  getGeneralReport: (params = {}) => api.get('/reports/general', { params }),
  getYearlyReport: (params = {}) => api.get('/reports/yearly', { params }),
  getSeasonalReport: (params = {}) => api.get('/reports/seasonal', { params }),
  getMonthlyReport: (params = {}) => api.get('/reports/monthly', { params }),
  getBungalowBasedReport: (params = {}) => api.get('/reports/bungalow-based', { params }),
  getCustomerBasedReport: (params = {}) => api.get('/reports/customer-based', { params }),
};

export default api;
