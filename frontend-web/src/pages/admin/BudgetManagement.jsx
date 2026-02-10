import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import './BudgetManagement.css';

const BudgetManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear] = useState(new Date().getFullYear());

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

    const handleBudgetUpdate = async (categoryId, newBudget) => {
        try {
            await categoryAPI.setBudget(categoryId, parseFloat(newBudget));
            fetchCategories();
        } catch (error) {
            alert('Failed to update budget');
        }
    };

    const getBudgetStatus = (spent, budget) => {
        if (budget === 0) return 'none';
        const percentage = (spent / budget) * 100;
        if (percentage >= 100) return 'exceeded';
        if (percentage >= 80) return 'warning';
        return 'good';
    };

    const getBudgetPercentage = (spent, budget) => {
        if (budget === 0) return 0;
        return Math.min((spent / budget) * 100, 100);
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const expenseCategories = categories.filter(cat => cat.type === 'expense');

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="budget-management-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-chart-pie"></i> Budget Planner
                    </h1>
                    <p className="text-secondary">
                        Set and track monthly spending targets for {getMonthName(currentMonth)} {currentYear}
                    </p>
                </div>
            </div>

            <div className="budget-overview-grid">
                <div className="budget-overview-card primary">
                    <div className="overview-icon">
                        <i className="fa-solid fa-sack-dollar"></i>
                    </div>
                    <div className="overview-content">
                        <span className="overview-label">Total Allocated</span>
                        <h2 className="overview-value">
                            {formatCurrency(expenseCategories.reduce((sum, cat) => sum + (cat.monthlyBudget || 0), 0))}
                        </h2>
                    </div>
                </div>

                <div className="budget-overview-card success">
                    <div className="overview-icon">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                    <div className="overview-content">
                        <span className="overview-label">Used This Month</span>
                        <h2 className="overview-value">{formatCurrency(0)}</h2>
                    </div>
                </div>

                <div className="budget-overview-card warning">
                    <div className="overview-icon">
                        <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <div className="overview-content">
                        <span className="overview-label">Remaining Balance</span>
                        <h2 className="overview-value">
                            {formatCurrency(expenseCategories.reduce((sum, cat) => sum + (cat.monthlyBudget || 0), 0))}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="budget-items-list">
                {expenseCategories.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-chart-pie"></i>
                        <p>No expense categories found. Create categories first!</p>
                    </div>
                ) : (
                    expenseCategories.map((category) => {
                        const spent = 0;
                        const budget = category.monthlyBudget || 0;
                        const status = getBudgetStatus(spent, budget);
                        const percentage = getBudgetPercentage(spent, budget);

                        return (
                            <div key={category._id} className={`budget-planning-card status-${status}`}>
                                <div className="budget-card-header">
                                    <div className="budget-category">
                                        <div
                                            className="budget-cat-icon"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            <i className={category.icon}></i>
                                        </div>
                                        <div className="budget-cat-info">
                                            <h3>{category.name}</h3>
                                            <p className="budget-summary-text">
                                                {budget > 0 ? (
                                                    spent > 0 ? `${formatCurrency(spent)} of ${formatCurrency(budget)} used` : `Budget: ${formatCurrency(budget)}`
                                                ) : 'No budget set'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="budget-edit-group">
                                        <div className="budget-input-wrapper">
                                            <span className="currency-label">₹</span>
                                            <input
                                                type="number"
                                                className="budget-input-field"
                                                value={budget}
                                                onChange={(e) => handleBudgetUpdate(category._id, e.target.value)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {budget > 0 && (
                                    <div className="budget-card-progress">
                                        <div className="progress-track">
                                            <div
                                                className={`progress-bar-fill fill-${status}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="progress-details">
                                            <span className="progress-status-chip">
                                                {percentage.toFixed(0)}% Utilized
                                            </span>
                                            <span className="progress-diff">
                                                {formatCurrency(Math.max(0, budget - spent))} Left
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BudgetManagement;
