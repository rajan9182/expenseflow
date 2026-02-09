import axios from 'axios';

const API_URL = 'https://expenseflow-fvo0.onrender.com/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

// Expense API
export const expenseAPI = {
    getAll: (params) => api.get('/expenses', { params }),
    getOne: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

// Analytics API
export const analyticsAPI = {
    getDashboard: (userId) => api.get('/analytics/dashboard', { params: { user: userId } }),
    getFamily: () => api.get('/analytics/family'),
    getTrends: (months) => api.get('/analytics/trends', { params: { months } })
};

// User API
export const userAPI = {
    getAll: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`)
};

export default api;
