const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    type: {
        type: String,
        enum: ['expense', 'income', 'transfer'],
        default: 'expense'
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    transferTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: function () {
            return this.type !== 'transfer';
        }
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account is required']
    },

    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Net Banking'],
        default: 'Cash'
    },
    description: {
        type: String,
        trim: true
    },
    receipt: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: null
    },
    isShared: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
