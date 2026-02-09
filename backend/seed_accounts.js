const mongoose = require('mongoose');
const Account = require('./src/models/Account');
require('dotenv').config();

const accounts = [
    {
        name: 'Income Account',
        type: 'bank',
        balance: 0,
        currency: 'INR',
        icon: 'fa-solid fa-building-columns',
        color: '#2563eb',
        description: 'Primary account for receiving salary and other income.'
    },
    {
        name: 'Emergency Savings',
        type: 'savings',
        balance: 0,
        currency: 'INR',
        icon: 'fa-solid fa-shield-heart',
        color: '#10b981',
        description: 'Funds kept aside for unexpected expenses and emergencies.'
    },
    {
        name: 'Investment Portfolio',
        type: 'investment',
        balance: 0,
        currency: 'INR',
        icon: 'fa-solid fa-chart-line',
        color: '#8b5cf6',
        description: 'Stocks, mutual funds, and other long-term investments.'
    },
    {
        name: 'Daily Spending',
        type: 'cash',
        balance: 0,
        currency: 'INR',
        icon: 'fa-solid fa-wallet',
        color: '#f59e0b',
        description: 'Account for daily transactions and lifestyle expenses.'
    },
    {
        name: 'Personal Cash',
        type: 'cash',
        balance: 0,
        currency: 'INR',
        icon: 'fa-solid fa-money-bill-wave',
        color: '#64748b',
        description: 'Physical cash on hand.'
    }
];

async function seedAccounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminUser = '69885041147a329d6b4639a5'; // Rajan Goswami

        for (const acc of accounts) {
            await Account.findOneAndUpdate(
                { name: acc.name, createdBy: adminUser },
                { ...acc, createdBy: adminUser, isActive: true },
                { upsert: true, new: true }
            );
            console.log(`Seeded account: ${acc.name}`);
        }

        console.log('Account seeding completed successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seedAccounts();
