const express = require('express');
const {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    transferFunds,
    deleteExpense
} = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.route('/')
    .get(getExpenses)
    .post(createExpense);

router.post('/transfer', transferFunds);

router.route('/:id')
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
