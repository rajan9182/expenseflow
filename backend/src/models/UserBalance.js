const mongoose = require('mongoose');

const userBalanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    totalReceived: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Unique constraint: one balance record per user per account
userBalanceSchema.index({ user: 1, account: 1 }, { unique: true });

module.exports = mongoose.model('UserBalance', userBalanceSchema);
