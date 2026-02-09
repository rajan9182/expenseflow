const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

const categories = [
    // Income Categories
    { name: 'Award', type: 'income', icon: 'fa-solid fa-award', color: '#f59e0b' },
    { name: 'Coupon', type: 'income', icon: 'fa-solid fa-ticket', color: '#10b981' },
    { name: 'Grants', type: 'income', icon: 'fa-solid fa-hand-holding-dollar', color: '#3b82f6' },
    { name: 'Lottery', type: 'income', icon: 'fa-solid fa-clover', color: '#8b5cf6' },
    { name: 'Received', type: 'income', icon: 'fa-solid fa-arrow-down-long', color: '#6366f1' },
    { name: 'Rental', type: 'income', icon: 'fa-solid fa-house-chimney', color: '#ea580c' },
    { name: 'Salary', type: 'income', icon: 'fa-solid fa-briefcase', color: '#7c3aed' },
    { name: 'Sale', type: 'income', icon: 'fa-solid fa-tag', color: '#db2777' },
    { name: 'Freelancing', type: 'income', icon: 'fa-solid fa-laptop-code', color: '#ec4899' },
    { name: 'Debt & Loans', type: 'income', icon: 'fa-solid fa-handshake-angle', color: '#e11d48' },
    { name: 'Returned Money', type: 'income', icon: 'fa-solid fa-rotate-left', color: '#10b981' },
    { name: 'Other Income', type: 'income', icon: 'fa-solid fa-circle', color: '#64748b' },

    // Expense Categories
    { name: 'Bills', type: 'expense', icon: 'fa-solid fa-file-invoice-dollar', color: '#f43f5e' },
    { name: 'Car', type: 'expense', icon: 'fa-solid fa-car', color: '#3b82f6' },
    { name: 'Clothing', type: 'expense', icon: 'fa-solid fa-shirt', color: '#a855f7' },
    { name: 'Debt & Loans', type: 'expense', icon: 'fa-solid fa-handshake-angle', color: '#e11d48' },
    { name: 'Education', type: 'expense', icon: 'fa-solid fa-graduation-cap', color: '#2563eb' },
    { name: 'Electronics', type: 'expense', icon: 'fa-solid fa-plug', color: '#0ea5e9' },
    { name: 'Entertainment', type: 'expense', icon: 'fa-solid fa-film', color: '#d946ef' },
    { name: 'Food & Dining', type: 'expense', icon: 'fa-solid fa-utensils', color: '#ea580c' },
    { name: 'Health', type: 'expense', icon: 'fa-solid fa-kit-medical', color: '#10b981' },
    { name: 'Insurance', type: 'expense', icon: 'fa-solid fa-shield-halved', color: '#475569' },
    { name: 'Shopping', type: 'expense', icon: 'fa-solid fa-cart-shopping', color: '#db2777' },
    { name: 'Social', type: 'expense', icon: 'fa-solid fa-users', color: '#6366f1' },
    { name: 'Sport', type: 'expense', icon: 'fa-solid fa-dumbbell', color: '#84cc16' },
    { name: 'Tax', type: 'expense', icon: 'fa-solid fa-landmark', color: '#4b5563' },
    { name: 'Telephone', type: 'expense', icon: 'fa-solid fa-phone', color: '#06b6d4' },
    { name: 'Transportation', type: 'expense', icon: 'fa-solid fa-bus', color: '#f59e0b' },
    { name: 'Fuel', type: 'expense', icon: 'fa-solid fa-gas-pump', color: '#ea580c' },
    { name: 'Other Expense', type: 'expense', icon: 'fa-solid fa-shapes', color: '#94a3b8' }
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Optional: Clear existing categories if you want a clean slate
        // await Category.deleteMany({});
        // console.log('Cleared existing categories');

        const adminUser = '69885041147a329d6b4639a5'; // Rajan Goswami

        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { name: cat.name, type: cat.type },
                { ...cat, createdBy: adminUser, isActive: true },
                { upsert: true, new: true }
            );
            console.log(`Seeded category: ${cat.name}`);
        }

        console.log('Seeding completed successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seedCategories();
