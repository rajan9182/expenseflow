const express = require('express');
const {
    getDashboardAnalytics,
    getFamilyAnalytics,
    getExpenseTrends,
    getFamilyTransfers
} = require('../controllers/analyticsController');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.get('/dashboard', getDashboardAnalytics);
router.get('/stats', getDashboardAnalytics); // Alias for mobile app
router.get('/recent', getDashboardAnalytics); // Alias for mobile app - returns same data
router.get('/family', isAdmin, getFamilyAnalytics);
router.get('/trends', getExpenseTrends);
router.get('/family-transfers', getFamilyTransfers);

module.exports = router;
