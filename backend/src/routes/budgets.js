const express = require('express');
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getBudgets);
router.post('/', auth, createBudget);
router.put('/:id', auth, updateBudget);
router.delete('/:id', auth, deleteBudget);

module.exports = router;
