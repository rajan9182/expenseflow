const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    person: {
        type: String,
        required: [true, 'Person name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['lent', 'borrowed'],
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Original amount is required'],
        min: 0
    },
    originalPrincipal: {
        type: Number
    },
    remainingAmount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    description: {
        type: String,
        trim: true
    },
    interestRate: {
        type: Number,
        default: 0
    },
    interestType: {
        type: String,
        enum: ['none', 'one-time', 'monthly'],
        default: 'none'
    },
    status: {
        type: String,
        enum: ['active', 'settled'],
        default: 'active'
    },
    transactions: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Expense'
        },
        type: {
            type: String,
            enum: ['payment', 'interest', 'initial', 'other'],
            default: 'payment'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Update status to settled if remaining amount is 0
debtSchema.pre('save', function () {
    if (this.remainingAmount <= 0) {
        this.status = 'settled';
    } else {
        this.status = 'active';
    }
});

module.exports = mongoose.model('Debt', debtSchema);
