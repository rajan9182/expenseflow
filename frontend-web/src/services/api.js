import axios from 'axios';

const API_URL = 'https://expenseflow-fvo0.onrender.com/api';

// Create axios instance with default config
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
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// User API
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    updateRole: (id, role) => api.put(`/users/${id}`, { role }),
    delete: (id) => api.delete(`/users/${id}`),
    getBalance: (id) => api.get(`/users/${id}/balance`),
};

// Account API
export const accountAPI = {
    getAll: () => api.get('/accounts'),
    getById: (id) => api.get(`/accounts/${id}`),
    create: (accountData) => api.post('/accounts', accountData),
    update: (id, accountData) => api.put(`/accounts/${id}`, accountData),
    delete: (id) => api.delete(`/accounts/${id}`),
    getBalance: (id) => api.get(`/accounts/${id}/balance`),
};

// Category API
export const categoryAPI = {
    getAll: (type) => api.get('/categories', { params: { type } }),
    getIncome: () => api.get('/categories/income'),
    getExpense: () => api.get('/categories/expense'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    setBudget: (id, monthlyBudget) => api.put(`/categories/${id}/budget`, { monthlyBudget }),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Expense API
export const expenseAPI = {
    getAll: () => api.get('/expenses'),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (expenseData) => api.post('/expenses', expenseData),
    update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
    delete: (id) => api.delete(`/expenses/${id}`),
    transfer: (transferData) => api.post('/expenses/transfer', transferData),
};

// Transaction API (for new income/expense/transfer system)
export const transactionAPI = {
    getAll: () => api.get('/transactions'),
    getById: (id) => api.get(`/transactions/${id}`),
    getByUser: (userId) => api.get(`/transactions/user/${userId}`),
    getByAccount: (accountId) => api.get(`/transactions/account/${accountId}`),
    create: (transactionData) => api.post('/transactions', transactionData),
    update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
    delete: (id) => api.delete(`/transactions/${id}`),
};

// Debt API
export const debtAPI = {
    getAll: () => api.get('/debts'),
    create: (debtData) => api.post('/debts', debtData),
    update: (id, debtData) => api.put(`/debts/${id}`, debtData),
    addPayment: (id, paymentData) => api.post(`/debts/${id}/payments`, paymentData),
    delete: (id) => api.delete(`/debts/${id}`),

};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getByUser: (userId) => api.get(`/analytics/user/${userId}`),
    getByCategory: (categoryId) => api.get(`/analytics/category/${categoryId}`),
    getByAccount: (accountId) => api.get(`/analytics/account/${accountId}`),

    getBudgetVsActual: () => api.get('/analytics/budget-vs-actual'),
};

export default api;
