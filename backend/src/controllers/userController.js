const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    try {
        const { name, email, role, password, monthlyBudget, avatar } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only allow user to update themselves or admin to update anyone
        if (req.params.id !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
        if (avatar !== undefined) user.avatar = avatar;

        // Admin only role update
        if (role && req.user.role === 'admin') {
            user.role = role;
        }

        // Password update
        if (password) {
            user.password = password;
        }

        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.deleteOne();

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle user active status (Admin only)
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get active members for transfers (All users)
// @route   GET /api/users/members
// @access  Private
const getMembers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true }).select('name email avatar');
        res.json({ success: true, count: users.length, members: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getMembers
};
