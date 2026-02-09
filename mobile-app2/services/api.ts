import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.1.17:5000/api'
    : 'http://localhost:5000/api'

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const authAPI = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

export const expenseAPI = {
    getAll: () => api.get('/expenses'),
    create: (data: any) => api.post('/expenses', data),
    update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
    delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const categoryAPI = {
    getAll: () => api.get('/categories'),
    setBudget: (id: string, data: any) => api.put(`/categories/${id}/budget`, data),
};

export const accountAPI = {
    getAll: () => api.get('/accounts'),
    getBalance: (id: string) => api.get(`/accounts/${id}/balance`),
};

export const debtAPI = {
    getAll: () => api.get('/debts'),
    create: (data: any) => api.post('/debts', data),
    addPayment: (id: string, data: any) => api.post(`/debts/${id}/payments`, data),
    update: (id: string, data: any) => api.put(`/debts/${id}`, data),
    delete: (id: string) => api.delete(`/debts/${id}`),
};

export const analyticsAPI = {
    getStats: (range: string) => api.get(`/analytics/stats?range=${range}`),
    getRecentActivity: () => api.get('/analytics/recent'),
};

export default api;
