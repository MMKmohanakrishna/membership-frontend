import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export const memberService = {
  getAll: async (params) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  getByMemberId: async (memberId) => {
    const response = await api.get(`/members/member-id/${memberId}`);
    return response.data;
  },

  create: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },

  update: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  regenerateQR: async (id) => {
    const response = await api.post(`/members/${id}/regenerate-qr`);
    return response.data;
  },

  renew: async (id, data) => {
    const response = await api.post(`/members/${id}/renew`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/members/stats');
    return response.data;
  },
};

export const attendanceService = {
  scanQR: async (qrData) => {
    const response = await api.post('/attendance/scan', { qrData });
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  getMemberAttendance: async (memberId, params) => {
    const response = await api.get(`/attendance/member/${memberId}`, { params });
    return response.data;
  },

  checkOut: async (attendanceId) => {
    const response = await api.post('/attendance/checkout', { attendanceId });
    return response.data;
  },

  getTodayStats: async () => {
    const response = await api.get('/attendance/stats/today');
    return response.data;
  },
};

export const alertService = {
  getAll: async (params) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/alerts/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/alerts/unread-count');
    return response.data;
  },
};

export const planService = {
  getAll: async (params) => {
    const response = await api.get('/plans', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  create: async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
  },

  update: async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  },
};

export const userService = {
  getAll: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const gymService = {
  getAll: async () => {
    const response = await api.get('/gyms');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/gyms/${id}`);
    return response.data;
  },

  getMyGym: async () => {
    const response = await api.get('/gyms/me');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/gyms', data);
    return response.data;
  },

  update: async (id, gymData) => {
    const response = await api.put(`/gyms/${id}`, gymData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/gyms/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/gyms/stats');
    return response.data;
  },

  getSystemAnalytics: async () => {
    const response = await api.get('/gyms/analytics/system');
    return response.data;
  },

  getAuditLogs: async (params) => {
    const response = await api.get('/gyms/analytics/audit-logs', { params });
    return response.data;
  },
};
