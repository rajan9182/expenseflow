const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/family/members', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        const members = await User.find({ _id: { $ne: req.user._id } })
            .select('name email avatar role')
            .sort({ name: 1 });

        res.json({
            success: true,
            data: { members }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
