const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/accounts
// @desc    Get all accounts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const accounts = await Account.find({ isActive: true })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        console.log(`GET /api/accounts - Found ${accounts.length} active accounts`);

        res.json({
            success: true,
            count: accounts.length,
            accounts
        });
    } catch (error) {
        console.error('GET /api/accounts Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});


// @route   GET /api/accounts/:id
// @desc    Get single account
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const account = await Account.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        res.json({
            success: true,
            account
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   POST /api/accounts
// @desc    Create account (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        console.log('Account Create request body:', req.body);
        const { name, type, icon, color, description } = req.body;

        const account = await Account.create({
            name,
            type,
            icon,
            color,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            account
        });
    } catch (error) {
        console.error('Account Create Error:', error.message);
        const fs = require('fs');
        fs.appendFileSync('debug_api.log', `[${new Date().toISOString()}] Account Error: ${error.message}\nPayload: ${JSON.stringify(req.body)}\n`);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});


// @route   PUT /api/accounts/:id
// @desc    Update account (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, type, icon, color, description, isActive } = req.body;

        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { name, type, icon, color, description, isActive },
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        res.json({
            success: true,
            account
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/accounts/:id
// @desc    Delete account (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   GET /api/accounts/:id/balance
// @desc    Get account balance
// @access  Private
router.get('/:id/balance', protect, async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        res.json({
            success: true,
            balance: account.balance,
            currency: account.currency
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
