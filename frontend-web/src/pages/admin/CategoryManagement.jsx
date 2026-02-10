import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import './CategoryManagement.css';

const CATEGORY_ICONS = [
    'fa-solid fa-cart-shopping',
    'fa-solid fa-file-invoice-dollar',
    'fa-solid fa-kit-medical',
    'fa-solid fa-film',
    'fa-solid fa-bag-shopping',
    'fa-solid fa-car',
    'fa-solid fa-graduation-cap',
    'fa-solid fa-utensils',
    'fa-solid fa-house',
    'fa-solid fa-plane',
    'fa-solid fa-gamepad',
    'fa-solid fa-dumbbell',
    'fa-solid fa-shirt',
    'fa-solid fa-mobile-screen-button',
    'fa-solid fa-gift',
    'fa-solid fa-paw',
    'fa-solid fa-money-bill-trend-up',
    'fa-solid fa-briefcase',
    'fa-solid fa-hand-holding-dollar',
    'fa-solid fa-chart-line'
];

const COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'
];

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('expense');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        icon: 'fa-solid fa-circle',
        color: '#2563eb',
        monthlyBudget: 0,
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await categoryAPI.update(editingId, formData);
            } else {
                await categoryAPI.create(formData);
            }
            resetForm();
            fetchCategories();
        } catch (error) {
            alert('Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
            monthlyBudget: category.monthlyBudget || 0,
            description: category.description || ''
        });
        setEditingId(category._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryAPI.delete(id);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete category');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: activeTab,
            icon: 'fa-solid fa-circle',
            color: '#2563eb',
            monthlyBudget: 0,
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

    const filteredCategories = categories.filter(cat => cat.type === activeTab);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="category-management-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-tags"></i> Categories
                    </h1>
                    <p className="text-secondary">Organize your finances with custom categories</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setFormData({ ...formData, type: activeTab }); setShowForm(true); }}
                >
                    <i className="fa-solid fa-plus"></i> New {activeTab === 'expense' ? 'Expense' : 'Income'} Category
                </button>
            </div>

            <div className="modern-tabs">
                <button
                    className={`modern-tab ${activeTab === 'expense' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    <i className="fa-solid fa-arrow-trend-down"></i>
                    <span>Expenses</span>
                </button>
                <button
                    className={`modern-tab ${activeTab === 'income' ? 'active' : ''}`}
                    onClick={() => setActiveTab('income')}
                >
                    <i className="fa-solid fa-arrow-trend-up"></i>
                    <span>Income</span>
                </button>
                <div className="modern-tabs-track" style={{ left: activeTab === 'expense' ? '0' : '50%' }}></div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{editingId ? 'Edit Category' : 'New Category'}</h2>
                                <p className="text-secondary text-sm">Set up your category visuals and budget</p>
                            </div>
                            <button className="modal-close" onClick={resetForm}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-tag"></i> Category Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Groceries"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fa-solid fa-layer-group"></i> Type
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fa-solid fa-sack-dollar"></i> Monthly Budget
                                    </label>
                                    <div className="amount-input-wrapper">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={formData.monthlyBudget}
                                            onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group form-group-full">
                                    <label className="form-label">
                                        <i className="fa-solid fa-icons"></i> Choose Icon
                                    </label>
                                    <div className="icon-grid-picker">
                                        {CATEGORY_ICONS.map(icon => (
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
                                        <i className="fa-solid fa-palette"></i> Theme Color
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
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="categories-display-grid">
                {filteredCategories.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-tags"></i>
                        <p>No {activeTab} categories found.</p>
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div key={category._id} className="category-display-card" style={{ '--cat-color': category.color }}>
                            <div className="category-card-accent"></div>
                            <div className="category-display-icon">
                                <i className={category.icon}></i>
                            </div>
                            <div className="category-display-content">
                                <h3 className="category-display-name">{category.name}</h3>
                                {category.monthlyBudget > 0 && (
                                    <div className="category-display-budget">
                                        <span className="budget-label">Target Budget</span>
                                        <span className="budget-value">{formatCurrency(category.monthlyBudget)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="category-display-actions">
                                <button
                                    className="btn-icon-soft"
                                    onClick={() => handleEdit(category)}
                                    title="Edit"
                                >
                                    <i className="fa-solid fa-pencil"></i>
                                </button>
                                <button
                                    className="btn-icon-soft btn-icon-soft-danger"
                                    onClick={() => handleDelete(category._id)}
                                    title="Delete"
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;
