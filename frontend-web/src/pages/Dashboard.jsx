import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, expenseAPI } from '../services/api';
import {
    formatCurrency,
    getCategoryColor,
    getCategoryIcon,
    getPaymentMethodIcon,
    formatDate,
    getInitials
} from '../utils/helpers';
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
                    {isAdmin && <Route path="/members" element={<MemberManagement />} />}
                </Routes>
            </div>
        </div>
    );
};

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, user, isAdmin, onLogout }) => {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <i className="fa-solid fa-wallet"></i>
                    {isOpen && <span className="logo-text">Expense Manager</span>}
                </div>
                <button className="sidebar-toggle" onClick={onToggle} title={isOpen ? 'Collapse' : 'Expand'}>
                    <i className={`fa-solid ${isOpen ? 'fa-angles-left' : 'fa-angles-right'}`}></i>
                </button>
            </div>

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

                {isAdmin && (
                    <NavLink to="/dashboard/members" className="nav-item">
                        <i className="fa-solid fa-users"></i>
                        {isOpen && <span className="nav-text">Members</span>}
                    </NavLink>
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

// Dashboard Home Component
const DashboardHome = ({ user, isAdmin }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

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
            title: 'Total Income',
            value: formatCurrency(analytics?.totalIncome || 0),
            icon: 'fa-solid fa-arrow-trend-up',
            color: 'success',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(analytics?.totalExpense || 0),
            icon: 'fa-solid fa-arrow-trend-down',
            color: 'danger',
        },
        {
            title: 'Balance',
            value: formatCurrency(analytics?.balance || 0),
            icon: 'fa-solid fa-wallet',
            color: analytics?.balance >= 0 ? 'success' : 'danger',
        },
        {
            title: 'Transactions',
            value: analytics?.expenseCount || 0,
            icon: 'fa-solid fa-list-check',
            color: 'primary',
        },
    ];

    return (
        <div className="dashboard-home">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.name}!</h1>
                    <p className="text-secondary">Here's your financial overview for this month</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card card">
                        <div className={`stat-icon stat-icon-${stat.color}`}>
                            <i className={stat.icon}></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-title">{stat.title}</div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa-solid fa-chart-pie"></i> Category Breakdown
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="category-list">
                            {analytics?.categoryBreakdown?.map((cat, index) => (
                                <div key={index} className="category-item">
                                    <div className="category-info">
                                        <i className={getCategoryIcon(cat._id)}></i>
                                        <span className="category-name">{cat._id}</span>
                                    </div>
                                    <div className="category-amount">
                                        <span className="amount">{formatCurrency(cat.total)}</span>
                                        <div className="category-bar-container">
                                            <div
                                                className={`category-bar category-bar-${getCategoryColor(cat._id)}`}
                                                style={{
                                                    width: `${(cat.total / analytics.totalExpense) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa-solid fa-clock-rotate-left"></i> Recent Expenses
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="expense-list">
                            {analytics?.recentExpenses?.map((expense) => (
                                <div key={expense._id} className="expense-item">
                                    <div className={`expense-icon expense-icon-${getCategoryColor(expense.category)}`}>
                                        <i className={getCategoryIcon(expense.category)}></i>
                                    </div>
                                    <div className="expense-details">
                                        <div className="expense-title">{expense.title}</div>
                                        <div className="expense-meta">
                                            <i className="fa-solid fa-calendar"></i> {formatDate(expense.date)}
                                            <span className="separator">•</span>
                                            {expense.category}
                                        </div>
                                    </div>
                                    <div className="expense-amount text-danger">
                                        -{formatCurrency(expense.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Expense List Component
const ExpenseList = ({ user, isAdmin }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await expenseAPI.getAll();
            setExpenses(response.data.expenses);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseAPI.delete(id);
                setExpenses(expenses.filter((e) => e._id !== id));
            } catch (error) {
                alert('Failed to delete expense');
            }
        }
    };

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
                <h1>
                    <i className="fa-solid fa-receipt"></i> All Expenses
                </h1>
                <NavLink to="/dashboard/add-expense" className="btn btn-primary">
                    <i className="fa-solid fa-plus"></i> Add New
                </NavLink>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                {isAdmin && <th>Member</th>}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{formatDate(expense.date)}</td>
                                    <td>{expense.title}</td>
                                    <td>
                                        <span className={`badge badge-${getCategoryColor(expense.category)}`}>
                                            <i className={getCategoryIcon(expense.category)}></i> {expense.category}
                                        </span>
                                    </td>
                                    <td className="text-danger font-semibold">{formatCurrency(expense.amount)}</td>
                                    <td>
                                        <i className={getPaymentMethodIcon(expense.paymentMethod)}></i> {expense.paymentMethod}
                                    </td>
                                    {isAdmin && <td>{expense.user?.name}</td>}
                                    <td>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(expense._id)}
                                            title="Delete expense"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Add Expense Component
const AddExpense = ({ user }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Groceries',
        paymentMethod: 'Cash',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await expenseAPI.create(formData);
            navigate('/dashboard/expenses');
        } catch (error) {
            alert('Failed to add expense');
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

    const categories = [
        { value: 'Groceries', icon: 'fa-cart-shopping' },
        { value: 'Bills', icon: 'fa-file-invoice-dollar' },
        { value: 'Medical', icon: 'fa-kit-medical' },
        { value: 'Entertainment', icon: 'fa-film' },
        { value: 'Shopping', icon: 'fa-bag-shopping' },
        { value: 'Transport', icon: 'fa-car' },
        { value: 'Education', icon: 'fa-graduation-cap' },
        { value: 'Food', icon: 'fa-utensils' },
        { value: 'Other', icon: 'fa-ellipsis' },
    ];

    const paymentMethods = [
        { value: 'Cash', icon: 'fa-money-bill-wave' },
        { value: 'UPI', icon: 'fa-mobile-screen-button' },
        { value: 'Card', icon: 'fa-credit-card' },
        { value: 'Net Banking', icon: 'fa-building-columns' },
    ];

    return (
        <div className="add-expense-page">
            <div className="page-header">
                <h1>
                    <i className="fa-solid fa-plus-circle"></i> Add New Expense
                </h1>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-heading"></i> Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    placeholder="e.g., Grocery Shopping"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-indian-rupee-sign"></i> Amount *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-tag"></i> Category *
                                </label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-wallet"></i> Payment Method *
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
                                    <i className="fa-solid fa-calendar"></i> Date *
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
                                    <i className="fa-solid fa-note-sticky"></i> Description
                                </label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Optional notes about this expense..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard/expenses')}
                            >
                                <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span> Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-floppy-disk"></i> Save Expense
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

// Analytics Component (Placeholder)
const Analytics = ({ user, isAdmin }) => {
    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1>
                    <i className="fa-solid fa-chart-pie"></i> Analytics & Insights
                </h1>
            </div>
            <div className="card">
                <div className="card-body text-center" style={{ padding: '3rem' }}>
                    <i className="fa-solid fa-chart-line" style={{ fontSize: '3rem', color: 'var(--slate-300)' }}></i>
                    <p className="text-secondary mt-2">Advanced analytics with charts coming soon!</p>
                </div>
            </div>
        </div>
    );
};

// Member Management Component (Placeholder)
const MemberManagement = () => {
    return (
        <div className="members-page">
            <div className="page-header">
                <h1>
                    <i className="fa-solid fa-users"></i> Family Members
                </h1>
            </div>
            <div className="card">
                <div className="card-body text-center" style={{ padding: '3rem' }}>
                    <i className="fa-solid fa-users" style={{ fontSize: '3rem', color: 'var(--slate-300)' }}></i>
                    <p className="text-secondary mt-2">Member management features coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
