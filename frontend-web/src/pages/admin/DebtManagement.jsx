import { useState, useEffect } from 'react';
import { debtAPI, accountAPI, categoryAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './DebtManagement.css';

const DebtManagement = ({ user, isAdmin }) => {
    const [debts, setDebts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all'
    });
    const [formData, setFormData] = useState({
        person: '',
        type: 'borrowed',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        interestRate: '',
        interestType: 'none'
    });
    const [paymentData, setPaymentData] = useState({
        amount: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [debtRes, accRes, catRes] = await Promise.all([
                debtAPI.getAll(),
                accountAPI.getAll(),
                categoryAPI.getAll()
            ]);
            setDebts(debtRes.data.debts || []);
            setAccounts(accRes.data.accounts || []);
            setCategories(catRes.data.categories || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDebtSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await debtAPI.update(selectedDebt._id, formData);
            } else {
                await debtAPI.create(formData);
            }
            setShowForm(false);
            setIsEditing(false);
            setFormData({ person: '', type: 'borrowed', amount: '', date: new Date().toISOString().split('T')[0], description: '', interestRate: '', interestType: 'none' });
            fetchData();
        } catch (error) {
            alert(`Failed to ${isEditing ? 'update' : 'save'} debt`);
        }
    };

    const handleEditClick = (debt) => {
        setFormData({
            person: debt.person,
            type: debt.type,
            amount: debt.amount,
            date: new Date(debt.date || debt.createdAt).toISOString().split('T')[0],
            description: debt.description || '',
            interestRate: debt.interestRate || '',
            interestType: debt.interestType || 'none'
        });
        setSelectedDebt(debt);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this debt?')) {
            try {
                await debtAPI.delete(id);
                fetchData();
            } catch (error) {
                alert('Failed to delete debt');
            }
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await debtAPI.addPayment(selectedDebt._id, paymentData);
            setShowPaymentForm(false);
            setPaymentData({ amount: '', accountId: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '' });
            fetchData();
        } catch (error) {
            alert('Failed to process payment');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    const totalBorrowed = debts.filter(d => d.type === 'borrowed').reduce((acc, d) => acc + (d.remainingAmount !== undefined ? d.remainingAmount : d.amount), 0);
    const totalLent = debts.filter(d => d.type === 'lent').reduce((acc, d) => acc + (d.remainingAmount !== undefined ? d.remainingAmount : d.amount), 0);

    const filteredDebts = debts.filter(debt => {
        const matchesSearch = debt.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (debt.description && debt.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filters.type === 'all' || debt.type === filters.type;
        const matchesStatus = filters.status === 'all' || debt.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="debt-management-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-handshake-angle"></i> Debt Management
                    </h1>
                    <p className="text-secondary">Track who you owe and who owes you</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setIsEditing(false);
                    setFormData({ person: '', type: 'borrowed', amount: '', date: new Date().toISOString().split('T')[0], description: '', interestRate: '', interestType: 'none' });
                    setShowForm(true);
                }}>
                    <i className="fa-solid fa-plus"></i> Add New Debt/Loan
                </button>
            </div>

            <div className="debt-summary-grid">
                <div className="debt-summary-card borrowed">
                    <div className="summary-icon">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total Borrowed</span>
                        <span className="summary-value">{formatCurrency(totalBorrowed)}</span>
                    </div>
                </div>
                <div className="debt-summary-card lent">
                    <div className="summary-icon">
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total Lent</span>
                        <span className="summary-value">{formatCurrency(totalLent)}</span>
                    </div>
                </div>
            </div>

            <div className="debt-filters-container">
                <div className="search-bar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Search by person or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="form-select"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="all">All Types</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="lent">Lent</option>
                    </select>
                    <select
                        className="form-select"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="settled">Settled</option>
                    </select>
                </div>
            </div>

            <div className="debt-list-header">
                <div>
                    <i className="fa-solid fa-list-check"></i> Showing {filteredDebts.length} Records
                </div>
            </div>

            <div className="debt-list">
                {filteredDebts.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <p>No records match your filters.</p>
                    </div>
                ) : (
                    filteredDebts.map(debt => (
                        <div key={debt._id} className={`debt-card ${debt.status}`}>
                            <div className="debt-info">
                                <div className="debt-main-info">
                                    <h3>{debt.person}</h3>
                                    <span className={`debt-type-badge ${debt.type}`}>
                                        {debt.type === 'lent' ? 'Lent' : 'Borrowed'}
                                    </span>
                                    <span className={`status-badge ${debt.status}`}>
                                        {debt.status}
                                    </span>
                                </div>
                                <div className="debt-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Original Amount</span>
                                        <span className="detail-value amount">{formatCurrency(debt.amount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Remaining</span>
                                        <span className="detail-value remaining">{formatCurrency(debt.remainingAmount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">
                                            Interest ({debt.interestType === 'monthly' ? 'Monthly' : 'One-time'} {debt.interestRate}%)
                                        </span>
                                        <span className="detail-value">
                                            {formatCurrency(((debt.originalPrincipal || debt.amount) * (debt.interestRate || 0)) / 100)}
                                            {debt.interestType === 'one-time' && <small className="ml-1 opacity-70">(Included in Total)</small>}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Transaction Date</span>
                                        <span className="detail-value">{formatDate(debt.date || debt.createdAt)}</span>
                                    </div>
                                    {debt.dueDate && (
                                        <div className="detail-item">
                                            <span className="detail-label">Due Date</span>
                                            <span className="detail-value">{formatDate(debt.dueDate)}</span>
                                        </div>
                                    )}
                                    {debt.user && (
                                        <div className="detail-item">
                                            <span className="detail-label">Created By</span>
                                            <span className="detail-value text-primary font-weight-bold">
                                                <i className="fa-solid fa-user-circle mr-1"></i>
                                                {debt.user?._id === user?._id ? 'Me' : (debt.user?.name || 'Unknown')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {debt.description && (
                                    <div className="debt-description">
                                        <i className="fa-solid fa-quote-left mr-2 opacity-50"></i>
                                        {debt.description}
                                    </div>
                                )}
                            </div>
                            {(isAdmin || debt.user === user?._id || debt.user?._id === user?._id) && (
                                <div className="debt-actions">
                                    {debt.status === 'active' && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                setSelectedDebt(debt);
                                                setShowPaymentForm(true);
                                            }}
                                        >
                                            <i className="fa-solid fa-receipt"></i> Add Payment
                                        </button>
                                    )}
                                    <div className="action-row">
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(debt)}>
                                            <i className="fa-solid fa-pen-to-square"></i> Edit
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(debt._id)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Debt Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Edit Debt/Loan' : 'Add New Debt/Loan'}</h2>
                        <form onSubmit={handleDebtSubmit}>
                            <div className="form-group">
                                <label>Person Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.person}
                                    onChange={e => setFormData({ ...formData, person: e.target.value })}
                                    placeholder="Enter person name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Transaction Type</label>
                                <select
                                    className="form-select"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="borrowed">Borrowed (I owe them)</option>
                                    <option value="lent">Lent (They owe me)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Transaction Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add details about this debt..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Interest Setup</label>
                                <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select
                                        className="form-select"
                                        value={formData.interestType}
                                        onChange={e => setFormData({ ...formData, interestType: e.target.value })}
                                    >
                                        <option value="none">No Interest</option>
                                        <option value="one-time">One-time (%)</option>
                                        <option value="monthly">Monthly (%)</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.interestRate}
                                        onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                                        placeholder="Rate (%)"
                                        disabled={formData.interestType === 'none'}
                                    />
                                </div>
                                {formData.amount && formData.interestRate && formData.interestType !== 'none' && (
                                    <small className="text-secondary mt-1 block">
                                        {formData.interestType === 'one-time'
                                            ? `Total will be ${formatCurrency(parseFloat(formData.amount) + (parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100))} (Add ${formatCurrency(parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100)})`
                                            : `Interest: ${formatCurrency((parseFloat(formData.amount) * parseFloat(formData.interestRate)) / 100)} per month.`
                                        }
                                    </small>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Debt</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Payment Form Modal */}
            {showPaymentForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Record Payment for {selectedDebt?.person}</h2>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="form-group">
                                <label>Payment Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={paymentData.amount}
                                    onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    max={selectedDebt?.remainingAmount}
                                    required
                                />
                                <div className="payment-validation mt-2">
                                    <span className="text-danger font-weight-bold">
                                        Remaining Balance: {formatCurrency(selectedDebt?.remainingAmount)}
                                    </span>
                                    {selectedDebt?.interestRate > 0 && (
                                        <div className="text-secondary small">
                                            {selectedDebt.interestType === 'monthly'
                                                ? `Monthly Interest Due: ${formatCurrency(((selectedDebt.originalPrincipal || selectedDebt.amount) * selectedDebt.interestRate) / 100)}`
                                                : `(Total includes ${selectedDebt.interestRate}% interest)`
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Select Account</label>
                                <select
                                    className="form-select"
                                    value={paymentData.accountId}
                                    onChange={e => setPaymentData({ ...paymentData, accountId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose an account</option>
                                    {accounts.map(acc => (
                                        <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Category (for transaction tracking)</label>
                                <select
                                    className="form-select"
                                    value={paymentData.categoryId}
                                    onChange={e => setPaymentData({ ...paymentData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a category</option>
                                    {categories.filter(c => c.type === (selectedDebt?.type === 'lent' ? 'income' : 'expense')).map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Payment Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={paymentData.date}
                                    onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Record Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtManagement;
