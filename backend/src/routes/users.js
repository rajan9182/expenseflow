const express = require('express');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getMembers
} = require('../controllers/userController');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.get('/members', getMembers);

router.get('/', isAdmin, getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.patch('/:id/toggle-status', isAdmin, toggleUserStatus);

module.exports = router;
