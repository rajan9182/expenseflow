const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { isActive: true };

        if (type) {
            filter.type = type;
        }

        const categories = await Category.find(filter)
            .populate('createdBy', 'name email')
            .sort({ type: 1, name: 1 });

        console.log(`GET /api/categories - Found ${categories.length} categories for type: ${type || 'all'}`);

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error('GET /api/categories Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});


// @route   GET /api/categories/income
// @desc    Get income categories
// @access  Private
router.get('/income', protect, async (req, res) => {
    try {
        const categories = await Category.find({ type: 'income', isActive: true })
            .sort({ name: 1 });

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   GET /api/categories/expense
// @desc    Get expense categories
// @access  Private
router.get('/expense', protect, async (req, res) => {
    try {
        const categories = await Category.find({ type: 'expense', isActive: true })
            .sort({ name: 1 });

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   POST /api/categories
// @desc    Create category (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        console.log('Category Create request body:', req.body);
        const { name, type, icon, color, monthlyBudget, description } = req.body;

        const category = await Category.create({
            name,
            type,
            icon,
            color,
            monthlyBudget,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Category Create Error:', error.message);
        const fs = require('fs');
        fs.appendFileSync('debug_api.log', `[${new Date().toISOString()}] Category Error: ${error.message}\nPayload: ${JSON.stringify(req.body)}\n`);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});


// @route   PUT /api/categories/:id
// @desc    Update category (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, icon, color, monthlyBudget, description, isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, icon, color, monthlyBudget, description, isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/categories/:id/budget
// @desc    Set monthly budget for category
// @access  Private
router.put('/:id/budget', protect, async (req, res) => {
    try {
        const { monthlyBudget } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { monthlyBudget },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
