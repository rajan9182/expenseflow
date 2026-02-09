const Expense = require('../models/Expense');
const User = require('../models/User');
const Account = require('../models/Account');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const { startDate, endDate, category, user, account } = req.query;

        let query = {};

        // Default to family-wide query unless admin specifies a user
        if (req.user.role === 'admin' && user) {
            query.user = user;
        } else if (user) {
            // Even non-admins can filter by user if they want to see someone else's specifically
            query.user = user;
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Account filter
        if (account) {
            query.account = account;
        }

        const expenses = await Expense.find(query)
            .populate('user', 'name email avatar')
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .sort({ date: -1 });

        res.json({
            success: true,
            count: expenses.length,
            data: { expenses },  // Mobile app format
            expenses  // Web app format (backward compatibility)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('user', 'name email')
            .populate('category', 'name icon color')
            .populate('account', 'name type');

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check ownership or admin
        if (expense.user._id.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    try {
        const { amount, account, type } = req.body;

        const expenseData = {
            ...req.body,
            user: req.userId
        };

        const expense = await Expense.create(expenseData);

        // Update account balance
        if (account) {
            const accountDoc = await Account.findById(account);
            if (accountDoc) {
                // If type is income, add; if expense (default), subtract
                if (type === 'income') {
                    accountDoc.balance += parseFloat(amount);
                } else {
                    accountDoc.balance -= parseFloat(amount);
                }
                await accountDoc.save();
            }
        }

        const populatedExpense = await Expense.findById(expense._id)
            .populate('user', 'name email avatar')
            .populate('category', 'name icon color')
            .populate('account', 'name type');

        res.status(201).json({ success: true, expense: populatedExpense });
    } catch (error) {
        console.error('CREATE EXPENSE ERROR:', error);
        res.status(500).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check ownership or admin
        if (expense.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const oldAmount = expense.amount;
        const oldAccount = expense.account;
        const oldToAccount = expense.toAccount;
        const oldType = expense.type;

        expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email avatar')
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .populate('toAccount', 'name type');

        // Update account balance if amount, account, toAccount or type changed
        // Simplest way: revert old, apply new

        // REVERT OLD
        if (oldAccount) {
            const oldAccDoc = await Account.findById(oldAccount);
            if (oldAccDoc) {
                if (oldType === 'income') oldAccDoc.balance -= oldAmount;
                else oldAccDoc.balance += oldAmount; // handles 'expense' and 'transfer'
                await oldAccDoc.save();
            }
        }
        if (oldType === 'transfer' && oldToAccount) {
            const oldToAccDoc = await Account.findById(oldToAccount);
            if (oldToAccDoc) {
                oldToAccDoc.balance -= oldAmount;
                await oldToAccDoc.save();
            }
        }

        // APPLY NEW
        if (expense.account) {
            const newAccDoc = await Account.findById(expense.account);
            if (newAccDoc) {
                if (expense.type === 'income') newAccDoc.balance += expense.amount;
                else newAccDoc.balance -= expense.amount; // handles 'expense' and 'transfer'
                await newAccDoc.save();
            }
        }
        if (expense.type === 'transfer' && expense.toAccount) {
            const newToAccDoc = await Account.findById(expense.toAccount);
            if (newToAccDoc) {
                newToAccDoc.balance += expense.amount;
                await newToAccDoc.save();
            }
        }

        res.json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const transferFunds = async (req, res) => {
    try {
        const { amount, fromAccount, toAccount, date, description, title } = req.body;

        if (!fromAccount || !toAccount || !amount) {
            return res.status(400).json({ error: 'Source, destination and amount are required' });
        }

        if (fromAccount === toAccount) {
            return res.status(400).json({ error: 'Source and destination accounts must be different' });
        }

        const sourceAccount = await Account.findById(fromAccount);
        const destAccount = await Account.findById(toAccount);

        if (!sourceAccount || !destAccount) {
            return res.status(404).json({ error: 'One or both accounts not found' });
        }

        // Create the transfer transaction record
        const transfer = await Expense.create({
            title: title || `Transfer to ${destAccount.name}`,
            amount: parseFloat(amount),
            type: 'transfer',
            account: fromAccount,
            toAccount: toAccount,
            user: req.userId,
            date: date || new Date(),
            description: description || `Transfer from ${sourceAccount.name} to ${destAccount.name}`,
            paymentMethod: 'Other'
        });

        // Update balances
        sourceAccount.balance -= parseFloat(amount);
        destAccount.balance += parseFloat(amount);

        await sourceAccount.save();
        await destAccount.save();

        const populatedTransfer = await Expense.findById(transfer._id)
            .populate('account', 'name type')
            .populate('toAccount', 'name type');

        res.status(201).json({ success: true, transfer: populatedTransfer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check ownership or admin
        if (expense.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Revert balance change before deleting
        if (expense.account) {
            const accountDoc = await Account.findById(expense.account);
            if (accountDoc) {
                if (expense.type === 'income') {
                    accountDoc.balance -= expense.amount;
                } else if (expense.type === 'expense') {
                    accountDoc.balance += expense.amount;
                } else if (expense.type === 'transfer') {
                    // Source account gets money back
                    accountDoc.balance += expense.amount;
                }
                await accountDoc.save();
            }
        }

        if (expense.type === 'transfer' && expense.toAccount) {
            const destAccount = await Account.findById(expense.toAccount);
            if (destAccount) {
                // Destination account loses the transferred money
                destAccount.balance -= expense.amount;
                await destAccount.save();
            }
        }

        await expense.deleteOne();

        res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    transferFunds,
    deleteExpense
};

