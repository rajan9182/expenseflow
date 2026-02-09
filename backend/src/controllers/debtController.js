const Debt = require('../models/Debt');
const Expense = require('../models/Expense');
const Account = require('../models/Account');

// @desc    Get all debts
// @route   GET /api/debts
// @access  Private
const getDebts = async (req, res) => {
    try {
        const debts = await Debt.find({ isActive: true })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: debts.length,
            debts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create new debt
// @route   POST /api/debts
// @access  Private
const createDebt = async (req, res) => {
    try {
        const { person, type, amount, dueDate, description, accountId, categoryId, date, interestRate, interestType } = req.body;

        const parsedAmount = parseFloat(amount) || 0;
        const parsedRate = parseFloat(interestRate) || 0;

        let finalAmount = parsedAmount;
        if (interestType === 'one-time' && parsedRate) {
            finalAmount += (finalAmount * parsedRate) / 100;
        }

        const debt = await Debt.create({
            user: req.userId,
            person,
            type, // 'lent' or 'borrowed'
            amount: finalAmount,
            remainingAmount: finalAmount,
            originalPrincipal: parsedAmount, // Tracking original for 'monthly' reference
            date: date || new Date(),
            dueDate,
            description,
            interestRate: parsedRate,
            interestType: interestType || 'none'
        });

        // If accountId is provided, create the initial transaction and update balance
        if (accountId) {
            // If we LENT money, it's an EXPENSE (money going out)
            // If we BORROWED money, it's an INCOME (money coming in)
            const transactionType = type === 'lent' ? 'expense' : 'income';

            const transaction = await Expense.create({
                user: req.userId,
                title: `${type === 'lent' ? 'Lent' : 'Borrowed'} to/from ${person}`,
                amount: parseFloat(amount),
                type: transactionType,
                category: categoryId,
                account: accountId,
                date: date || new Date(),
                description: description || `Initial debt transaction for ${person}`
            });

            // Update account balance
            const accountDoc = await Account.findById(accountId);
            if (accountDoc) {
                if (transactionType === 'income') {
                    accountDoc.balance += parseFloat(amount);
                } else {
                    accountDoc.balance -= parseFloat(amount);
                }
                await accountDoc.save();
            }

            // Link transaction to debt
            debt.transactions.push({
                amount: parseFloat(amount),
                date: date || new Date(),
                transactionId: transaction._id,
                type: 'initial'
            });
            await debt.save();
        }

        res.status(201).json({
            success: true,
            debt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// @desc    Add payment to debt
// @route   POST /api/debts/:id/payments
// @access  Private
const addPayment = async (req, res) => {
    try {
        const { amount, accountId, date, description, categoryId } = req.body;
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        // Check ownership or admin
        if (debt.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Create the corresponding transaction (Expense or Income)
        // If we LENT money, a payment back is INCOME.
        // If we BORROWED money, a payment back is EXPENSE.
        const transactionType = debt.type === 'lent' ? 'income' : 'expense';

        const transaction = await Expense.create({
            user: req.userId,
            title: `Payment from ${debt.person} (${debt.type === 'lent' ? 'Return' : 'Repayment'})`,
            amount: parseFloat(amount),
            type: transactionType,
            category: categoryId,
            account: accountId,
            date: date || new Date(),
            description: description || `Payment for debt to/from ${debt.person}`
        });

        // Update account balance
        const accountDoc = await Account.findById(accountId);
        if (accountDoc) {
            if (transactionType === 'income') {
                accountDoc.balance += parseFloat(amount);
            } else {
                accountDoc.balance -= parseFloat(amount);
            }
            await accountDoc.save();
        }

        // Update debt
        debt.remainingAmount -= parseFloat(amount);
        debt.transactions.push({
            amount: parseFloat(amount),
            date: date || new Date(),
            transactionId: transaction._id,
            type: 'payment'
        });

        await debt.save();

        res.json({
            success: true,
            debt,
            transaction
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
const updateDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        // Check ownership or admin
        if (debt.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updateData = { ...req.body };

        // Sanitize numeric inputs
        if (updateData.amount !== undefined) updateData.amount = parseFloat(updateData.amount) || 0;
        if (updateData.interestRate !== undefined) updateData.interestRate = parseFloat(updateData.interestRate) || 0;

        // Handle re-calculation if amount/interest changes
        if (updateData.amount !== undefined || updateData.interestRate !== undefined || updateData.interestType !== undefined) {
            const principal = updateData.amount !== undefined ? updateData.amount : (debt.originalPrincipal || debt.amount);
            const rate = updateData.interestRate !== undefined ? updateData.interestRate : (debt.interestRate || 0);
            const type = updateData.interestType !== undefined ? updateData.interestType : (debt.interestType || 'none');

            if (type === 'one-time') {
                updateData.amount = principal + (principal * rate) / 100;
                // new remaining = new total - amount already paid
                const amountPaid = (debt.amount || 0) - (debt.remainingAmount || 0);
                updateData.remainingAmount = Math.max(0, updateData.amount - amountPaid);
            } else {
                updateData.amount = principal;
                const amountPaid = (debt.originalPrincipal || debt.amount || 0) - (debt.remainingAmount || 0);
                updateData.remainingAmount = Math.max(0, principal - amountPaid);
            }
            updateData.originalPrincipal = principal;
        }

        const updatedDebt = await Debt.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            debt: updatedDebt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @desc    Delete debt (soft delete)
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        // Check ownership or admin
        if (debt.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        debt.isActive = false;
        await debt.save();

        res.json({
            success: true,
            message: 'Debt deleted'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDebts,
    createDebt,
    addPayment,
    updateDebt,
    deleteDebt
};
