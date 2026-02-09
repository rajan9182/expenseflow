const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: [true, 'Transaction type is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account is required']
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'],
        default: 'Cash'
    },
    notes: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    receipt: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ account: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ type: 1, date: -1 });

// Middleware to update account balances
transactionSchema.pre('save', async function (next) {
    if (this.isNew) {
        const Account = mongoose.model('Account');

        if (this.type === 'income') {
            // Add to account balance
            await Account.findByIdAndUpdate(this.account, {
                $inc: { balance: this.amount }
            });
        } else if (this.type === 'expense') {
            // Deduct from account balance
            await Account.findByIdAndUpdate(this.account, {
                $inc: { balance: -this.amount }
            });
        } else if (this.type === 'transfer') {
            // Deduct from source account, add to destination account
            await Account.findByIdAndUpdate(this.account, {
                $inc: { balance: -this.amount }
            });
            await Account.findByIdAndUpdate(this.toAccount, {
                $inc: { balance: this.amount }
            });
        }
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
