const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank', 'investment', 'other'],
        default: 'bank'
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    icon: {
        type: String,
        default: 'fa-solid fa-wallet'
    },
    color: {
        type: String,
        default: '#2563eb'
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
accountSchema.index({ createdBy: 1, isActive: 1 });

module.exports = mongoose.model('Account', accountSchema);
