const express = require('express');
const router = express.Router();
const {
    getDebts,
    createDebt,
    addPayment,
    updateDebt,
    deleteDebt
} = require('../controllers/debtController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getDebts)
    .post(createDebt);

router.route('/:id')
    .put(updateDebt)
    .delete(deleteDebt);

router.post('/:id/payments', addPayment);

module.exports = router;
