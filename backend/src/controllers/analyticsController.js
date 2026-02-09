const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');
const Debt = require('../models/Debt');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
    try {
        // Default to no user filter (family-wide) unless admin specifies a user
        const filter = req.query.user && req.user.role === 'admin'
            ? { user: new (require('mongoose')).Types.ObjectId(req.query.user) }
            : {};

        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Total expenses this month (exclude income type)
        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    ...filter,
                    type: { $ne: 'income' },
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total income this month (include income type from Expense collection + Income collection)
        const expenseIncomes = await Expense.aggregate([
            {
                $match: {
                    ...filter,
                    type: 'income',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const legacyIncomes = await Income.aggregate([
            {
                $match: {
                    ...filter,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Category-wise breakdown
        const categoryBreakdown = await Expense.aggregate([
            {
                $match: {
                    ...filter,
                    type: { $ne: 'income' },
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    total: 1,
                    count: 1,
                    name: { $ifNull: ['$categoryInfo.name', '$_id'] },
                    color: '$categoryInfo.color',
                    icon: '$categoryInfo.icon'
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // Debt summaries
        const debtStats = await Debt.aggregate([
            { $match: { ...filter, status: 'active', isActive: true } },
            {
                $group: {
                    _id: '$type',
                    totalRemaining: { $sum: '$remainingAmount' }
                }
            }
        ]);

        const upcomingDebts = await Debt.find({
            ...filter,
            status: 'active',
            isActive: true,
            dueDate: { $exists: true, $ne: null }
        })
            .sort({ dueDate: 1 })
            .limit(5);

        const totalBorrowed = debtStats.find(s => s._id === 'borrowed')?.totalRemaining || 0;
        const totalLent = debtStats.find(s => s._id === 'lent')?.totalRemaining || 0;

        // Recent expenses (include both types)
        const recentExpenses = await Expense.find(filter)
            .sort({ date: -1 })
            .limit(10) // Show more for family view
            .populate('user', 'name avatar')
            .populate('category', 'name icon color')
            .populate('account', 'name');

        const totalExpense = monthlyExpenses[0]?.total || 0;
        const totalIncome = (expenseIncomes[0]?.total || 0) + (legacyIncomes[0]?.total || 0);
        const balance = totalIncome - totalExpense;

        const responseData = {
            // Web app format (singular)
            totalExpense,
            totalIncome,
            balance,
            // Mobile app format (plural/different names)
            totalExpenses: totalExpense,
            netBalance: balance,
            // Common fields
            totalBorrowed,
            totalLent,
            upcomingDebts,
            expenseCount: monthlyExpenses[0]?.count || 0,
            categoryBreakdown,
            recentExpenses,
            savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
        };

        res.json({
            success: true,
            data: {
                stats: responseData  // Mobile app format
            },
            analytics: responseData  // Web app format (backward compatibility)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// @desc    Get family analytics (Admin only)
// @route   GET /api/analytics/family
// @access  Private (Admin)
const getFamilyAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Member-wise spending
        const memberSpending = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$user',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    userId: '$_id',
                    name: '$userInfo.name',
                    email: '$userInfo.email',
                    avatar: '$userInfo.avatar',
                    total: 1,
                    count: 1
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // Total family expenses
        const totalFamilyExpense = memberSpending.reduce((sum, member) => sum + member.total, 0);

        // Total family income
        const totalFamilyIncome = await Income.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            success: true,
            analytics: {
                totalFamilyExpense,
                totalFamilyIncome: totalFamilyIncome[0]?.total || 0,
                memberSpending,
                balance: (totalFamilyIncome[0]?.total || 0) - totalFamilyExpense
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get expense trends
// @route   GET /api/analytics/trends
// @access  Private
const getExpenseTrends = async (req, res) => {
    try {
        const filter = req.query.user && req.user.role === 'admin'
            ? { user: new (require('mongoose')).Types.ObjectId(req.query.user) }
            : {};
        const months = parseInt(req.query.months) || 6;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const trends = await Expense.aggregate([
            {
                $match: {
                    ...filter,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({ success: true, trends });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get family transfers for current month
// @route   GET /api/analytics/family-transfers
// @access  Private
const getFamilyTransfers = async (req, res) => {
    try {
        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get all active users
        const allUsers = await User.find({ isActive: true }).select('name email avatar');

        // Aggregate expenses where transferTo exists (family transfers)
        const transferStats = await Expense.aggregate([
            {
                $match: {
                    transferTo: { $exists: true, $ne: null },
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$transferTo',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Map stats to all users
        const transfers = allUsers.map(user => {
            const stats = transferStats.find(s => s._id.toString() === user._id.toString());
            return {
                _id: user._id,
                totalAmount: stats ? stats.totalAmount : 0,
                count: stats ? stats.count : 0,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            };
        });

        // Sort by amount desc, then name
        transfers.sort((a, b) => b.totalAmount - a.totalAmount || a.user.name.localeCompare(b.user.name));

        res.json({
            success: true,
            data: transfers
        });
    } catch (error) {
        console.error('Get family transfers error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getDashboardAnalytics,
    getFamilyAnalytics,
    getExpenseTrends,
    getFamilyTransfers
};
