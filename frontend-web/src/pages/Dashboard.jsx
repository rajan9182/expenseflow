import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, expenseAPI, categoryAPI, accountAPI, debtAPI } from '../services/api';

import {
    formatCurrency,
    getCategoryColor,
    getCategoryIcon,
    getPaymentMethodIcon,
    formatDate,
    getInitials
} from '../utils/helpers';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import MemberManagement from './admin/MemberManagement';
import AccountManagement from './admin/AccountManagement';
import CategoryManagement from './admin/CategoryManagement';
import BudgetManagement from './admin/BudgetManagement';
import DebtManagement from './admin/DebtManagement';

import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Mobile Header */}
            <div className="mobile-header">
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle Menu"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="mobile-header-title">
                    <i className="fa-solid fa-wallet"></i>
                    <span>Expense Manager</span>
                </div>
                <div className="mobile-header-actions">
                    {/* Placeholder for notifications, etc */}
                </div>
            </div>

            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                user={user}
                isAdmin={isAdmin}
                onLogout={handleLogout}
            />

            <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Routes>

                    <Route path="/" element={<DashboardHome user={user} isAdmin={isAdmin} />} />
                    <Route path="/expenses" element={<ExpenseList user={user} isAdmin={isAdmin} />} />
                    <Route path="/add-expense" element={<AddExpense user={user} />} />
                    <Route path="/analytics" element={<Analytics user={user} isAdmin={isAdmin} />} />
                    <Route path="/budgets" element={<BudgetManagement />} />
                    <Route path="/debts" element={<DebtManagement user={user} isAdmin={isAdmin} />} />
                    <Route path="/accounts" element={<AccountManagement isAdmin={isAdmin} />} />

                    {isAdmin && <Route path="/members" element={<MemberManagement />} />}
                    {isAdmin && <Route path="/categories" element={<CategoryManagement />} />}
                </Routes>
            </div>
        </div>
    );
};

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, user, isAdmin, onLogout }) => {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button
                className="desktop-sidebar-toggle"
                onClick={onToggle}
                title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
                <i className={`fa-solid ${isOpen ? 'fa-angles-left' : 'fa-bars'}`}></i>
            </button>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {getInitials(user?.name || 'User')}
                </div>
                {isOpen && (
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">
                            {isAdmin ? (
                                <span className="badge badge-primary">
                                    <i className="fa-solid fa-shield-halved"></i> Admin
                                </span>
                            ) : (
                                <span className="badge badge-secondary">
                                    <i className="fa-solid fa-user"></i> Member
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" end className="nav-item">
                    <i className="fa-solid fa-chart-line"></i>
                    {isOpen && <span className="nav-text">Dashboard</span>}
                </NavLink>

                <NavLink to="/dashboard/expenses" className="nav-item">
                    <i className="fa-solid fa-receipt"></i>
                    {isOpen && <span className="nav-text">Expenses</span>}
                </NavLink>

                <NavLink to="/dashboard/add-expense" className="nav-item">
                    <i className="fa-solid fa-plus-circle"></i>
                    {isOpen && <span className="nav-text">Add Expense</span>}
                </NavLink>

                <NavLink to="/dashboard/analytics" className="nav-item">
                    <i className="fa-solid fa-chart-pie"></i>
                    {isOpen && <span className="nav-text">Analytics</span>}
                </NavLink>

                <NavLink to="/dashboard/budgets" className="nav-item">
                    <i className="fa-solid fa-sack-dollar"></i>
                    {isOpen && <span className="nav-text">Budgets</span>}
                </NavLink>

                <NavLink to="/dashboard/debts" className="nav-item">
                    <i className="fa-solid fa-handshake-angle"></i>
                    {isOpen && <span className="nav-text">Debt & Loans</span>}
                </NavLink>

                <NavLink to="/dashboard/accounts" className="nav-item">
                    <i className="fa-solid fa-building-columns"></i>
                    {isOpen && <span className="nav-text">Accounts</span>}
                </NavLink>

                {isAdmin && (
                    <>
                        <NavLink to="/dashboard/members" className="nav-item">
                            <i className="fa-solid fa-users"></i>
                            {isOpen && <span className="nav-text">Members</span>}
                        </NavLink>
                        <NavLink to="/dashboard/categories" className="nav-item">
                            <i className="fa-solid fa-tag"></i>
                            {isOpen && <span className="nav-text">Categories</span>}
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={onLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    {isOpen && <span className="nav-text">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

const DashboardHome = ({ user, isAdmin }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('This month');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getDashboard();
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Revenue',
            value: formatCurrency(analytics?.totalIncome || 0),
            icon: 'fa-solid fa-arrow-trend-up',
            color: 'success',
            subtitle: 'Total income',
            trend: '+12.5%',
            trendDir: 'up'
        },
        {
            title: 'Expenses',
            value: formatCurrency(analytics?.totalExpense || 0),
            icon: 'fa-solid fa-arrow-trend-down',
            color: 'danger',
            subtitle: 'Total spent',
            trend: '+8.2%',
            trendDir: 'up'
        },
        {
            title: 'Net Balance',
            value: formatCurrency(analytics?.balance || 0),
            icon: 'fa-solid fa-wallet',
            color: analytics?.balance >= 0 ? 'success' : 'danger',
            subtitle: 'Available funds',
            trend: 'Stable',
            trendDir: 'flat'
        },
        {
            title: 'Transactions',
            value: analytics?.expenseCount || 0,
            icon: 'fa-solid fa-receipt',
            color: 'primary',
            subtitle: 'Monthly volume',
            trend: 'Active',
            trendDir: 'up'
        },
        {
            title: 'Borrowed',
            value: formatCurrency(analytics?.totalBorrowed || 0),
            icon: 'fa-solid fa-hand-holding-dollar',
            color: 'danger',
            subtitle: 'Total debt',
            trend: 'Repay soon',
            trendDir: 'down'
        },
        {
            title: 'Lent',
            value: formatCurrency(analytics?.totalLent || 0),
            icon: 'fa-solid fa-hand-holding-hand',
            color: 'success',
            subtitle: 'Money owed to you',
            trend: 'Collect back',
            trendDir: 'up'
        },
        {
            title: 'Savings Rate',
            value: `${analytics?.totalIncome > 0 ? Math.round((analytics.balance / analytics.totalIncome) * 100) : 0}%`,
            icon: 'fa-solid fa-piggy-bank',
            color: 'info',
            subtitle: 'Percentage of income saved',
            trend: 'Keep it up!',
            trendDir: 'up',
            progress: analytics?.totalIncome > 0 ? (analytics.balance / analytics.totalIncome) * 100 : 0
        },
        {
            title: 'Budget Used',
            value: `${user?.monthlyBudget > 0 ? Math.round((analytics?.totalExpense / user.monthlyBudget) * 100) : 0}%`,
            icon: 'fa-solid fa-clock-rotate-left',
            color: 'warning',
            subtitle: `of ₹${user?.monthlyBudget?.toLocaleString()}`,
            trend: (analytics?.totalExpense / user.monthlyBudget) > 0.8 ? 'Near limit' : 'On track',
            trendDir: (analytics?.totalExpense / user.monthlyBudget) > 0.8 ? 'down' : 'up',
            progress: (analytics?.totalExpense / user.monthlyBudget) * 100
        },
    ];

    const categoryData = analytics?.categoryBreakdown?.map(cat => ({
        name: cat.name || cat._id,
        value: cat.total,
        color: cat.color || '#64748b',
        icon: cat.icon || 'fa-solid fa-tag'
    })) || [];


    const CHART_COLORS = {
        blue: '#3b82f6',
        teal: '#14b8a6',
        rose: '#f43f5e',
        amber: '#f59e0b',
        indigo: '#6366f1',
        violet: '#8b5cf6',
        emerald: '#10b981',
        slate: '#64748b'
    };

    // Color mapper for categories
    const getChartColor = (colorName) => {
        const mapping = {
            'primary': CHART_COLORS.blue,
            'success': CHART_COLORS.emerald,
            'warning': CHART_COLORS.amber,
            'danger': CHART_COLORS.rose,
            'info': CHART_COLORS.teal,
            'secondary': CHART_COLORS.slate
        };
        return mapping[colorName] || CHART_COLORS.blue;
    };

    const trendData = [
        { month: '1 Jun', value: 30000, income: 45000 },
        { month: '2 Jun', value: 35000, income: 42000 },
        { month: '3 Jun', value: 32000, income: 48000 },
        { month: '4 Jun', value: 38000, income: 51000 },
        { month: '5 Jun', value: 42000, income: 55000 },
        { month: '6 Jun', value: 45000, income: 52000 },
        { month: '7 Jun', value: 48000, income: 60000 },
        { month: '8 Jun', value: 52000, income: 63000 },
    ];

    return (
        <div className="dashboard-home-page">
            <div className="page-header">
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h1>Financial Overview</h1>
                        <p className="text-secondary">Hello {user?.name.split(' ')[0]}, here's what's happening with your money.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="time-range-picker">
                        {['1 Week', 'This month', '3 Months'].map(range => (
                            <button
                                key={range}
                                className={`range-btn ${timeRange === range ? 'active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Advanced Quick Actions Row */}
            <div className="quick-actions-bar">
                <NavLink to="/dashboard/add-expense" className="quick-action-item">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <i className="fa-solid fa-plus"></i>
                    </div>
                    <span>Add Expense</span>
                </NavLink>
                <div className="qa-divider"></div>
                <NavLink to="/dashboard/accounts" className="quick-action-item">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <i className="fa-solid fa-repeat"></i>
                    </div>
                    <span>Transfer</span>
                </NavLink>
                <div className="qa-divider"></div>
                <NavLink to="/dashboard/analytics" className="quick-action-item">
                    <div className="qa-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                        <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <span>View Reports</span>
                </NavLink>
                <div className="qa-divider"></div>
                <div className="financial-health-tag">
                    <div className="health-score-mini">
                        <span className="health-label">Health Score</span>
                        <div className="score-pill success">
                            <i className="fa-solid fa-shield-heart"></i> 85/100
                        </div>
                    </div>
                </div>
            </div>

            <div className="premium-stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="premium-stat-card">
                        <div className="stat-card-glow"></div>
                        <div className="stat-card-content">
                            <div className="stat-card-header">
                                <div className={`stat-card-icon icon-${stat.color}`}>
                                    <i className={stat.icon}></i>
                                </div>
                                <div className={`stat-card-trend trend-${stat.trendDir}`}>
                                    <i className={`fa-solid fa-arrow-trend-${stat.trendDir === 'flat' ? 'up' : stat.trendDir}`}></i>
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="stat-card-body">
                                <span className="stat-card-label">{stat.title}</span>
                                <h2 className="stat-card-value">{stat.value}</h2>
                                {stat.progress !== undefined && (
                                    <div className="stat-progress-bar">
                                        <div
                                            className={`stat-progress-fill color-${stat.color}`}
                                            style={{ width: `${Math.min(stat.progress, 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                                <p className="stat-card-subtitle">{stat.subtitle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                {/* Main Content Area - Left Side (Charts) */}
                <div className="dashboard-main-column">
                    <div className="dashboard-main-chart card-premium">
                        <div className="card-header">
                            <div>
                                <h3 className="card-heading">Cash Flow Insights</h3>
                                <p className="card-subheading">Income vs Expenses Analysis</p>
                            </div>
                            <div className="chart-legend-custom">
                                <div className="legend-entry"><span className="dot dot-income"></span> Income</div>
                                <div className="legend-entry"><span className="dot dot-expense"></span> Expense</div>
                            </div>
                        </div>
                        <div className="card-body chart-container-large">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-insights-block card-premium">
                        <div className="card-header">
                            <div>
                                <h3 className="card-heading">Spending Deep Dive</h3>
                                <p className="card-subheading">Analysis of your top spending areas</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="insights-split-layout">
                                <div className="insights-chart-section">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-center-info">
                                        <span className="cc-label">Total spent</span>
                                        <span className="cc-value">{formatCurrency(analytics?.totalExpense || 0)}</span>
                                    </div>
                                </div>
                                <div className="insights-list-section">
                                    <div className="premium-distribution-list">
                                        {categoryData.slice(0, 5).map((cat, idx) => (
                                            <div key={idx} className="p-dist-item">
                                                <div className="p-dist-icon" style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                                                    <i className={cat.icon || 'fa-solid fa-tag'}></i>
                                                </div>
                                                <div className="p-dist-info">
                                                    <div className="p-dist-meta">
                                                        <span className="p-dist-name">{cat.name}</span>
                                                        <span className="p-dist-amount">{formatCurrency(cat.value)}</span>
                                                    </div>
                                                    <div className="p-dist-progress-bg">
                                                        <div
                                                            className="p-dist-progress-fill"
                                                            style={{
                                                                width: `${analytics?.totalExpense > 0 ? (cat.value / analytics.totalExpense) * 100 : 0}%`,
                                                                backgroundColor: cat.color
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="p-dist-percent">
                                                    {analytics?.totalExpense > 0 ? Math.round((cat.value / analytics.totalExpense) * 100) : 0}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Column - Right Side (Activity & Widgets) */}
                <div className="dashboard-side-column">
                    <div className="side-widget card-premium">
                        <div className="card-header">
                            <h3 className="card-heading">Recent Activity</h3>
                            <NavLink to="/dashboard/expenses" className="btn-text-link">All</NavLink>
                        </div>
                        <div className="card-body no-padding">
                            <div className="mini-activity-list">
                                {analytics.recentExpenses.slice(0, 5).map((expense) => (
                                    <div key={expense._id} className="mini-activity-item">
                                        <div className="mini-icon" style={{
                                            backgroundColor: (expense.type === 'income' ? '#10b981' : '#ef4444') + '15',
                                            color: expense.type === 'income' ? '#10b981' : '#ef4444'
                                        }}>
                                            <i className={expense.type === 'income' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'}></i>
                                        </div>
                                        <div className="mini-details">
                                            <span className="mini-title">{expense.title}</span>
                                            <span className="mini-meta">{formatDate(expense.date)}</span>
                                        </div>
                                        <span className={`mini-val ${expense.type === 'income' ? 'income' : 'expense'}`}>
                                            {formatCurrency(expense.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {analytics?.upcomingDebts?.length > 0 && (
                        <div className="side-widget card-premium">
                            <div className="card-header">
                                <h3 className="card-heading">Upcoming Dues</h3>
                            </div>
                            <div className="card-body no-padding">
                                <div className="mini-due-list">
                                    {analytics.upcomingDebts.slice(0, 3).map((debt) => (
                                        <div key={debt._id} className="mini-due-item">
                                            <div className="due-main">
                                                <span className="due-name">{debt.person}</span>
                                                <span className="due-date">Due: {formatDate(debt.dueDate)}</span>
                                            </div>
                                            <span className={`due-val ${debt.type === 'lent' ? 'income' : 'expense'}`}>
                                                {formatCurrency(debt.remainingAmount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Expense List Component
// Enhanced Expense List Component
const ExpenseList = ({ user, isAdmin }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editCategories, setEditCategories] = useState([]);
    const [editAccounts, setEditAccounts] = useState([]);
    const [editFormData, setEditFormData] = useState({
        title: '',
        amount: '',
        category: '',
        account: '',
        paymentMethod: 'Cash',
        description: '',
        date: '',
        type: 'expense'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchExpenses();
        fetchEditResources();
    }, []);

    const fetchEditResources = async () => {
        try {
            const [catRes, accRes] = await Promise.all([
                categoryAPI.getAll(),
                accountAPI.getAll()
            ]);
            setEditCategories(catRes.data.categories || []);
            setEditAccounts(accRes.data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch edit resources:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const response = await expenseAPI.getAll();
            setExpenses(response.data.expenses || []);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await expenseAPI.delete(id);
                setExpenses(expenses.filter((e) => e._id !== id));
            } catch (error) {
                alert('Failed to delete transaction');
            }
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense._id);
        setEditFormData({
            title: expense.title,
            amount: expense.amount,
            category: typeof expense.category === 'object' ? expense.category?._id : expense.category,
            account: typeof expense.account === 'object' ? expense.account?._id : expense.account,
            paymentMethod: expense.paymentMethod || 'Cash',
            description: expense.description || '',
            date: new Date(expense.date).toISOString().split('T')[0],
            type: expense.type || 'expense'
        });
        setShowEditModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await expenseAPI.update(editingId, editFormData);
            setShowEditModal(false);
            fetchExpenses();
        } catch (error) {
            alert('Failed to update transaction');
        }
    };

    // Filter expenses
    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
        const catValue = typeof expense.category === 'object' ? expense.category?._id : expense.category;
        const matchesCategory = filterCategory === 'all' || catValue === filterCategory;
        const matchesPayment = filterPayment === 'all' || expense.paymentMethod === filterPayment;
        return matchesSearch && matchesCategory && matchesPayment;
    });

    // Get unique categories and payment methods
    const uniqueCategories = [];
    const catMap = new Map();
    expenses.forEach(e => {
        const cat = e.category;
        if (cat && typeof cat === 'object') {
            if (!catMap.has(cat._id)) {
                catMap.set(cat._id, cat.name);
                uniqueCategories.push({ id: cat._id, name: cat.name });
            }
        } else if (cat) {
            if (!catMap.has(cat)) {
                catMap.set(cat, cat);
                uniqueCategories.push({ id: cat, name: cat });
            }
        }
    });

    const categories = ['all', ...uniqueCategories];
    const paymentMethods = ['all', ...new Set(expenses.map(e => e.paymentMethod))];


    // Calculate totals
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="expense-list-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-receipt"></i> Transactions
                    </h1>
                    <p className="text-secondary">
                        {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalAmount)}
                    </p>
                </div>
                <NavLink to="/dashboard/add-expense" className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Transaction
                </NavLink>
            </div>

            {/* Filters */}
            <div className="expense-filters">
                <div className="filter-search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Categories</option>
                        {uniqueCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}

                    </select>
                    <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Payment Methods</option>
                        {paymentMethods.filter(p => p !== 'all').map((method) => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expense Cards */}
            <div className="expense-cards">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No transactions found</p>
                    </div>
                ) : (
                    filteredExpenses.map((expense) => (
                        <div key={expense._id} className="expense-card">
                            <div className="expense-card-header">
                                <div className="expense-category-badge" style={{
                                    backgroundColor: typeof expense.category === 'object' ? expense.category?.color : 'var(--slate-400)'
                                }}>
                                    <i className={typeof expense.category === 'object' ? (expense.category?.icon || 'fa-solid fa-receipt') : 'fa-solid fa-receipt'}></i>
                                </div>
                                <div className="expense-card-info">
                                    <h3 className="expense-card-title">{expense.title}</h3>
                                    <div className="expense-card-meta">
                                        <span>
                                            <i className="fa-solid fa-calendar"></i>
                                            {formatDate(expense.date)}
                                        </span>
                                        <span className="separator">•</span>
                                        <span>
                                            <i className={getPaymentMethodIcon(expense.paymentMethod)}></i>
                                            {expense.paymentMethod}
                                        </span>
                                        {expense.account?.name && (
                                            <>
                                                <span className="separator">•</span>
                                                <span>
                                                    <i className="fa-solid fa-building-columns"></i>
                                                    {expense.account.name}
                                                </span>
                                            </>
                                        )}
                                        {expense.user?.name && (
                                            <>
                                                <span className="separator">•</span>
                                                <span>
                                                    <i className="fa-solid fa-user"></i>
                                                    {expense.user.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="expense-card-amount">
                                    <span className={`amount-value ${expense.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                                    </span>
                                    <span className="badge badge-secondary">{typeof expense.category === 'object' ? expense.category?.name : expense.category}</span>
                                </div>
                            </div>

                            {expense.description && (
                                <div className="expense-card-description">
                                    <i className="fa-solid fa-note-sticky"></i>
                                    {expense.description}
                                </div>
                            )}
                            {(isAdmin || expense.user?._id === user?._id || expense.user === user?._id) && (
                                <div className="expense-card-actions">
                                    <button
                                        className="btn-icon btn-icon-primary"
                                        onClick={() => handleEdit(expense)}
                                        title="Edit"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        onClick={() => handleDelete(expense._id)}
                                        title="Delete"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Transaction</h2>
                        <form onSubmit={handleUpdateSubmit} className="modern-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editFormData.title}
                                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={editFormData.amount}
                                        onChange={e => setEditFormData({ ...editFormData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={editFormData.date}
                                        onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="form-select"
                                        value={editFormData.category}
                                        onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {editCategories.filter(c => c.type === editFormData.type).map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Account</label>
                                    <select
                                        className="form-select"
                                        value={editFormData.account}
                                        onChange={e => setEditFormData({ ...editFormData, account: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {editAccounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    className="form-select"
                                    value={editFormData.paymentMethod}
                                    onChange={e => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Upi">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Net Banking">Net Banking</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    className="form-input"
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Transaction</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Add Transaction Component
const AddExpense = ({ user }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transactionType, setTransactionType] = useState('expense');
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        account: '',
        paymentMethod: 'Cash',
        description: '',
        date: new Date().toISOString().split('T')[0],
        // Debt specific
        debtType: 'payment', // 'new' or 'payment'
        selectedDebt: '',
        person: '',
        debtAction: 'lent' // 'lent' or 'borrowed'
    });
    const [activeDebts, setActiveDebts] = useState([]);


    useEffect(() => {
        fetchCategories();
        fetchAccounts();
        if (transactionType === 'debt') {
            fetchDebts();
        }
    }, [transactionType, formData.debtType, formData.debtAction, formData.selectedDebt, activeDebts.length]);


    const fetchCategories = async () => {
        try {
            let typeToFetch = transactionType;
            if (transactionType === 'debt') {
                if (formData.debtType === 'new') {
                    typeToFetch = formData.debtAction === 'lent' ? 'expense' : 'income';
                } else if (formData.debtType === 'payment' && formData.selectedDebt) {
                    const debt = activeDebts.find(d => d._id === formData.selectedDebt);
                    if (debt) {
                        typeToFetch = debt.type === 'lent' ? 'income' : 'expense';
                    }
                }
            }
            const response = await categoryAPI.getAll(typeToFetch);
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setCategories([]);
        }
    };


    const fetchAccounts = async () => {
        try {
            const response = await accountAPI.getAll();
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setAccounts([]);
        }
    };

    const fetchDebts = async () => {
        try {
            const response = await debtAPI.getAll();
            setActiveDebts(response.data.debts?.filter(d => d.status === 'active') || []);
        } catch (error) {
            console.error('Failed to fetch debts:', error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (transactionType === 'debt') {
                if (formData.debtType === 'payment') {
                    await debtAPI.addPayment(formData.selectedDebt, {
                        amount: formData.amount,
                        accountId: formData.account,
                        categoryId: formData.category,
                        date: formData.date,
                        description: formData.description
                    });
                } else {
                    await debtAPI.create({
                        person: formData.person,
                        type: formData.debtAction,
                        amount: formData.amount,
                        accountId: formData.account,
                        categoryId: formData.category,
                        date: formData.date,
                        description: formData.description
                    });
                }
            } else {
                const transactionData = {
                    ...formData,
                    type: transactionType
                };
                await expenseAPI.create(transactionData);
            }
            navigate('/dashboard/expenses');
        } catch (error) {
            console.error('Failed to add transaction:', error.response?.data || error.message);
            alert(`Failed to add transaction: ${error.response?.data?.error || error.message}`);
        } finally {

            setLoading(false);
        }
    };


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTypeChange = (type) => {
        setTransactionType(type);
        setFormData({ ...formData, category: '' });
    };

    const paymentMethods = [
        { value: 'Cash', icon: 'fa-money-bill-wave' },
        { value: 'UPI', icon: 'fa-mobile-screen-button' },
        { value: 'Card', icon: 'fa-credit-card' },
        { value: 'Net Banking', icon: 'fa-building-columns' },
    ];

    return (
        <div className="add-expense-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-circle-plus"></i> Add New Transaction
                    </h1>
                    <p className="text-secondary">Record your financial activities</p>
                </div>
                <div className="header-badge">
                    <span className="badge badge-primary">New Entry</span>
                </div>
            </div>

            <div className="card-premium">
                <div className="card-header">
                    <div className="icon-title">
                        <div className="header-icon"><i className="fa-solid fa-file-invoice-dollar"></i></div>
                        <div>
                            <h3 className="card-heading">Transaction Details</h3>
                            <p className="card-subheading">Select type and fill in the information below</p>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {/* Transaction Type Selector - Modern Tabs Style */}
                    <div className="modern-tabs transaction-type-tabs">
                        <button
                            type="button"
                            className={`modern-tab ${transactionType === 'expense' ? 'active expense' : ''}`}
                            onClick={() => handleTypeChange('expense')}
                        >
                            <i className="fa-solid fa-arrow-trend-down"></i>
                            <span>Expense</span>
                        </button>
                        <button
                            type="button"
                            className={`modern-tab ${transactionType === 'income' ? 'active income' : ''}`}
                            onClick={() => handleTypeChange('income')}
                        >
                            <i className="fa-solid fa-arrow-trend-up"></i>
                            <span>Income</span>
                        </button>
                        <button
                            type="button"
                            className={`modern-tab ${transactionType === 'debt' ? 'active debt' : ''}`}
                            onClick={() => handleTypeChange('debt')}
                        >
                            <i className="fa-solid fa-handshake-angle"></i>
                            <span>Debt</span>
                        </button>
                        <div
                            className={`modern-tabs-track ${transactionType}`}
                            style={{
                                width: '33.33%',
                                left: transactionType === 'expense' ? '0' : transactionType === 'income' ? '33.33%' : '66.66%',
                                backgroundColor: transactionType === 'expense' ? 'var(--danger-500)' : transactionType === 'income' ? 'var(--success-500)' : 'var(--primary-500)'
                            }}
                        ></div>

                    </div>

                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="form-grid">
                            {transactionType !== 'debt' ? (
                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-pen-nib"></i> Transaction Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        placeholder={transactionType === 'income' ? 'e.g., Monthly Salary' : 'e.g., Grocery Shopping'}
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="form-group form-group-full debt-type-selection">
                                    <div className="modern-tabs sub-tabs">
                                        <button
                                            type="button"
                                            className={`modern-tab ${formData.debtType === 'payment' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, debtType: 'payment' })}
                                        >
                                            Existing Debt Payment
                                        </button>
                                        <button
                                            type="button"
                                            className={`modern-tab ${formData.debtType === 'new' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, debtType: 'new' })}
                                        >
                                            New Debt Record
                                        </button>
                                    </div>
                                </div>
                            )}

                            {transactionType === 'debt' && formData.debtType === 'payment' && (
                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-handshake-angle"></i> Select Active Debt *
                                    </label>
                                    <select
                                        name="selectedDebt"
                                        className="form-select"
                                        value={formData.selectedDebt}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose a debt...</option>
                                        {activeDebts.map(debt => (
                                            <option key={debt._id} value={debt._id}>
                                                {debt.person} - {debt.type === 'lent' ? 'They owe you' : 'You owe them'} ({formatCurrency(debt.remainingAmount)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {transactionType === 'debt' && formData.debtType === 'new' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="fa-solid fa-user"></i> Person Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="person"
                                            className="form-input"
                                            placeholder="e.g. Rajan Goswami"
                                            value={formData.person}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="fa-solid fa-circle-info"></i> Debt Type *
                                        </label>
                                        <select
                                            name="debtAction"
                                            className="form-select"
                                            value={formData.debtAction}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="lent">Lent (Give money)</option>
                                            <option value="borrowed">Borrowed (Take money)</option>
                                        </select>
                                    </div>
                                </>
                            )}


                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-coins"></i> Amount *
                                </label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-building-columns"></i> Selected Account *
                                </label>
                                <select
                                    name="account"
                                    className="form-select"
                                    value={formData.account}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map((acc) => (
                                        <option key={acc._id} value={acc._id}>
                                            {acc.name} ({formatCurrency(acc.balance)})
                                        </option>
                                    ))}
                                </select>
                                <small className="form-hint">
                                    <i className="fa-solid fa-circle-info"></i> {transactionType === 'income'
                                        ? 'Where is the money going?'
                                        : 'Where is the money coming from?'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-shapes"></i> Category *
                                </label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <small className="form-hint text-warning">
                                        <i className="fa-solid fa-triangle-exclamation"></i> No {transactionType} categories found.
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-credit-card"></i> Payment Method *
                                </label>
                                <select
                                    name="paymentMethod"
                                    className="form-select"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    required
                                >
                                    {paymentMethods.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-calendar-day"></i> Transaction Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group form-group-full">
                                <label className="form-label">
                                    <i className="fa-solid fa-comment-dots"></i> Additional Description
                                </label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Add any notes or details about this transaction..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-actions-premium">
                            <button
                                type="button"
                                className="btn btn-slate-light"
                                onClick={() => navigate('/dashboard/expenses')}
                            >
                                <i className="fa-solid fa-arrow-left"></i> Back to History
                            </button>
                            <button
                                type="submit"
                                className={`btn-premium ${transactionType === 'income' ? 'btn-success-premium' : 'btn-danger-premium'}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner spinner-white"></span> Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check-double"></i> Confirm {transactionType === 'income' ? 'Income' : 'Expense'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Analytics Component
const Analytics = ({ user, isAdmin }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('overview');

    useEffect(() => {
        const fetchAllAnalytics = async () => {
            try {
                const response = await analyticsAPI.getDashboard();
                setAnalytics(response.data.analytics);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    const categoryData = analytics?.categoryBreakdown?.map(cat => ({
        name: cat.name || cat._id,
        value: cat.total,
        count: cat.count,
        color: cat.color || '#64748b',
        icon: cat.icon || 'fa-solid fa-tag'
    })) || [];

    const topCategories = categoryData.slice(0, 5);
    const totalSpent = analytics?.totalExpense || 0;

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-chart-line"></i> Advanced Analytics
                    </h1>
                    <p className="text-secondary">Deep insights into your financial behavior</p>
                </div>
                <div className="analytics-view-tabs">
                    <button
                        className={`view-tab ${viewType === 'overview' ? 'active' : ''}`}
                        onClick={() => setViewType('overview')}
                    >
                        <i className="fa-solid fa-grid-2"></i> Overview
                    </button>
                    <button
                        className={`view-tab ${viewType === 'detailed' ? 'active' : ''}`}
                        onClick={() => setViewType('detailed')}
                    >
                        <i className="fa-solid fa-chart-bar"></i> Detailed
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="analytics-premium-stats">
                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <div className="stat-details">
                        <span className="stat-label">Avg. Daily Spend</span>
                        <h3 className="stat-value">{formatCurrency((totalSpent) / 30)}</h3>
                        <span className="stat-trend up">+12% vs last month</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div className="stat-details">
                        <span className="stat-label">Money Lent</span>
                        <h3 className="stat-value">{formatCurrency(analytics?.totalLent || 0)}</h3>
                        <span className="stat-trend">Receivable</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <i className="fa-solid fa-receipt"></i>
                    </div>
                    <div className="stat-details">
                        <span className="stat-label">Money Borrowed</span>
                        <h3 className="stat-value">{formatCurrency(analytics?.totalBorrowed || 0)}</h3>
                        <span className="stat-trend down">Payable</span>
                    </div>
                </div>
                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <i className="fa-solid fa-bell"></i>
                    </div>
                    <div className="stat-details">
                        <span className="stat-label">Upcoming Dues</span>
                        <h3 className="stat-value">{analytics?.upcomingDebts?.length || 0}</h3>
                        <span className="stat-trend">This month</span>
                    </div>
                </div>
            </div>

            {viewType === 'overview' ? (
                <div className="analytics-overview-grid">
                    {/* Top Spending Categories */}
                    <div className="analytics-block card-premium">
                        <div className="card-header">
                            <div>
                                <h3 className="card-heading">Top Spending Categories</h3>
                                <p className="card-subheading">Your biggest expense areas this month</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="top-categories-list">
                                {topCategories.map((cat, idx) => (
                                    <div key={idx} className="top-cat-item">
                                        <div className="top-cat-rank">#{idx + 1}</div>
                                        <div className="top-cat-icon" style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                                            <i className={cat.icon}></i>
                                        </div>
                                        <div className="top-cat-info">
                                            <div className="top-cat-meta">
                                                <span className="top-cat-name">{cat.name}</span>
                                                <span className="top-cat-amount">{formatCurrency(cat.value)}</span>
                                            </div>
                                            <div className="top-cat-stats">
                                                <span className="top-cat-count">{cat.count} transactions</span>
                                                <span className="top-cat-percent">{totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0}% of total</span>
                                            </div>
                                            <div className="top-cat-bar">
                                                <div
                                                    className="top-cat-bar-fill"
                                                    style={{
                                                        width: `${totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0}%`,
                                                        backgroundColor: cat.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Category Distribution Pie */}
                    <div className="analytics-block card-premium">
                        <div className="card-header">
                            <div>
                                <h3 className="card-heading">Distribution Overview</h3>
                                <p className="card-subheading">Expense allocation by category</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="analytics-pie-section">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-center-label">
                                    <span className="pie-label">Total</span>
                                    <span className="pie-value">{formatCurrency(totalSpent)}</span>
                                </div>
                            </div>
                            <div className="analytics-legend">
                                {categoryData.slice(0, 6).map((cat, idx) => (
                                    <div key={idx} className="legend-item">
                                        <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                                        <span className="legend-name">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="analytics-detailed-view">
                    <div className="analytics-block card-premium">
                        <div className="card-header">
                            <h3 className="card-heading">Detailed Category Analysis</h3>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={450}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

