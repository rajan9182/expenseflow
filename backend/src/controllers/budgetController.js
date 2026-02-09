const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Get all budgets for the current user
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ createdBy: req.user._id })
            .populate('category', 'name color')
            .sort({ createdAt: -1 });

        // Calculate spent amount for each budget
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const expenses = await Expense.aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            category: budget.category._id,
                            date: { $gte: currentMonth },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' },
                        },
                    },
                ]);

                const spent = expenses.length > 0 ? expenses[0].total : 0;

                return {
                    _id: budget._id,
                    category: budget.category,
                    amount: budget.budgetAmount,
                    spent,
                    month: budget.month,
                    year: budget.year,
                };
            })
        );

        res.json({
            success: true,
            budgets: budgetsWithSpent,
        });
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

// Create a new budget
const createBudget = async (req, res) => {
    try {
        const { category, amount } = req.body;

        if (!category || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Category and amount are required',
            });
        }

        // Check if budget already exists for this category and month
        const currentDate = new Date();
        const existingBudget = await Budget.findOne({
            createdBy: req.user._id,
            category,
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
        });

        if (existingBudget) {
            return res.status(400).json({
                success: false,
                error: 'Budget already exists for this category this month',
            });
        }

        const budget = await Budget.create({
            createdBy: req.user._id,
            category,
            budgetAmount: amount,
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
        });

        const populatedBudget = await Budget.findById(budget._id).populate('category', 'name color');

        res.status(201).json({
            success: true,
            budget: populatedBudget,
        });
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

// Update a budget
const updateBudget = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount is required',
            });
        }

        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { budgetAmount: amount },
            { new: true }
        ).populate('category', 'name color');

        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found',
            });
        }

        res.json({
            success: true,
            budget,
        });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id,
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found',
            });
        }

        res.json({
            success: true,
            message: 'Budget deleted successfully',
        });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

module.exports = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
};
