const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Category type is required']
    },
    icon: {
        type: String,
        default: 'fa-solid fa-circle'
    },
    color: {
        type: String,
        default: '#64748b'
    },
    monthlyBudget: {
        type: Number,
        default: 0
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
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Category', categorySchema);
