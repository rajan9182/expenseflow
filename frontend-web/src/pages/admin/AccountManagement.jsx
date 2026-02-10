import { useState, useEffect } from 'react';
import { accountAPI, expenseAPI } from '../../services/api';
import './AccountManagement.css';

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Cash', icon: 'fa-solid fa-money-bill-wave' },
    { value: 'bank', label: 'Bank Account', icon: 'fa-solid fa-building-columns' },
    { value: 'investment', label: 'Investment', icon: 'fa-solid fa-chart-line' },
    { value: 'other', label: 'Other', icon: 'fa-solid fa-wallet' }
];

const ACCOUNT_ICONS = [
    'fa-solid fa-wallet',
    'fa-solid fa-piggy-bank',
    'fa-solid fa-building-columns',
    'fa-solid fa-money-bill-wave',
    'fa-solid fa-chart-line',
    'fa-solid fa-coins',
    'fa-solid fa-credit-card',
    'fa-solid fa-landmark',
    'fa-solid fa-sack-dollar',
    'fa-solid fa-hand-holding-dollar'
];

const COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'
];

const AccountManagement = ({ isAdmin }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [transferData, setTransferData] = useState({
        fromAccount: '',
        toAccount: '',
        amount: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank',
        icon: 'fa-solid fa-wallet',
        color: '#2563eb',
        description: ''
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await accountAPI.getAll();
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await accountAPI.update(editingId, formData);
            } else {
                await accountAPI.create(formData);
            }
            resetForm();
            fetchAccounts();
        } catch (error) {
            alert('Failed to save account');
        }
    };

    const handleEdit = (account) => {
        setFormData({
            name: account.name,
            type: account.type,
            icon: account.icon,
            color: account.color,
            description: account.description || ''
        });
        setEditingId(account._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await accountAPI.delete(id);
                fetchAccounts();
            } catch (error) {
                alert('Failed to delete account');
            }
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (transferData.fromAccount === transferData.toAccount) {
            alert('Source and destination accounts must be different');
            return;
        }
        try {
            await expenseAPI.transfer(transferData);
            setShowTransferForm(false);
            setTransferData({
                fromAccount: '',
                toAccount: '',
                amount: '',
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchAccounts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to transfer funds');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'bank',
            icon: 'fa-solid fa-wallet',
            color: '#2563eb',
            description: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="account-management-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-building-columns"></i> Accounts
                    </h1>
                    <p className="text-secondary">Manage and track your various financial accounts</p>
                </div>
                {isAdmin && (
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => setShowTransferForm(true)}>
                            <i className="fa-solid fa-right-left"></i> Transfer Funds
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <i className="fa-solid fa-plus"></i> Add New Account
                        </button>
                    </div>
                )}
            </div>

            {showTransferForm && (
                <div className="modal-overlay" onClick={() => setShowTransferForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Transfer Funds</h2>
                                <p className="text-secondary text-sm">Move money between your accounts</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowTransferForm(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleTransferSubmit} className="modal-body">
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label className="form-label">Title (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Monthly Savings Transfer"
                                        value={transferData.title}
                                        onChange={(e) => setTransferData({ ...transferData, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">From Account</label>
                                    <select
                                        className="form-select"
                                        value={transferData.fromAccount}
                                        onChange={(e) => setTransferData({ ...transferData, fromAccount: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Source</option>
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">To Account</label>
                                    <select
                                        className="form-select"
                                        value={transferData.toAccount}
                                        onChange={(e) => setTransferData({ ...transferData, toAccount: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Destination</option>
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={transferData.amount}
                                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={transferData.date}
                                        onChange={(e) => setTransferData({ ...transferData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group form-group-full">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add context for this transfer..."
                                        value={transferData.description}
                                        onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Complete Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{editingId ? 'Edit Account' : 'New Account'}</h2>
                                <p className="text-secondary text-sm">Define account details and visuals</p>
                            </div>
                            <button className="modal-close" onClick={resetForm}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-tag"></i> Account Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. HDFC Savings"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-layer-group"></i> Account Type
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {ACCOUNT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-icons"></i> Choose Icon
                                    </label>
                                    <div className="icon-grid-picker">
                                        {ACCOUNT_ICONS.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                className={`icon-choice ${formData.icon === icon ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, icon })}
                                                style={{ color: formData.icon === icon ? formData.color : 'inherit' }}
                                            >
                                                <i className={icon}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-palette"></i> Select Theme Color
                                    </label>
                                    <div className="color-grid-picker">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`color-choice ${formData.color === color ? 'selected' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setFormData({ ...formData, color })}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-align-left"></i> Notes
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add some details about this account..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Update Account' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="accounts-display-grid">
                {accounts.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-building-columns"></i>
                        <p>No accounts found. Start by adding one!</p>
                    </div>
                ) : (
                    accounts.map((account) => (
                        <div key={account._id} className="account-display-card" style={{ '--account-color': account.color }}>
                            <div className="account-card-glow"></div>
                            <div className="account-display-header">
                                <div className="account-display-icon">
                                    <i className={account.icon}></i>
                                </div>
                                {isAdmin && (
                                    <div className="account-display-actions">
                                        <button
                                            className="btn-icon-soft"
                                            onClick={() => handleEdit(account)}
                                            title="Edit"
                                        >
                                            <i className="fa-solid fa-pencil"></i>
                                        </button>
                                        <button
                                            className="btn-icon-soft btn-icon-soft-danger"
                                            onClick={() => handleDelete(account._id)}
                                            title="Delete"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="account-display-body">
                                <div className="account-type-tag">
                                    <i className={ACCOUNT_TYPES.find(t => t.value === account.type)?.icon}></i>
                                    {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                                </div>
                                <h3 className="account-display-name">{account.name}</h3>
                                <div className="account-display-balance">
                                    <span className="balance-label">Current Balance</span>
                                    <span className="balance-value">{formatCurrency(account.balance)}</span>
                                </div>
                                {account.description && (
                                    <p className="account-display-desc">{account.description}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AccountManagement;
