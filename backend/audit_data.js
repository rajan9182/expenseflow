const mongoose = require('mongoose');
const Expense = require('./src/models/Expense');
const Income = require('./src/models/Income');
const Debt = require('./src/models/Debt');
require('dotenv').config();

const auditData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database\n');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const userId = '69885041147a329d6b4639a5'; // Rajan Goswami

        // 1. REVENUE (Income)
        const incomeFromExpenses = await Expense.find({
            user: userId,
            type: 'income',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const legacyIncomes = await Income.find({
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        console.log('--- REVENUE RECORDS (INCOME) ---');
        let totalRevenue = 0;
        incomeFromExpenses.forEach(inc => {
            console.log(`[Expense Card] ${inc.title}: ₹${inc.amount} (${inc.date.toLocaleDateString()})`);
            totalRevenue += inc.amount;
        });
        legacyIncomes.forEach(inc => {
            console.log(`[Legacy Income] ${inc.source || 'Income'}: ₹${inc.amount} (${inc.date.toLocaleDateString()})`);
            totalRevenue += inc.amount;
        });
        console.log(`TOTAL REVENUE: ₹${totalRevenue}\n`);

        // 2. EXPENSES (Excluding Income)
        const expenses = await Expense.find({
            user: userId,
            type: { $ne: 'income' },
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        console.log('--- EXPENSE & TRANSFER RECORDS ---');
        let totalExpense = 0;
        expenses.forEach(exp => {
            console.log(`[${exp.type.toUpperCase()}] ${exp.title}: ₹${exp.amount} (${exp.date.toLocaleDateString()})`);
            totalExpense += exp.amount;
        });
        console.log(`TOTAL EXPENSES/TRANSFERS: ₹${totalExpense}\n`);

        // 3. DEBTS (Active)
        const debts = await Debt.find({ user: userId, status: 'active', isActive: true });

        console.log('--- ACTIVE DEBT RECORDS ---');
        let totalBorrowed = 0;
        let totalLent = 0;
        debts.forEach(debt => {
            console.log(`[${debt.type.toUpperCase()}] ${debt.person}: ₹${debt.remainingAmount} (Original: ₹${debt.amount})`);
            if (debt.type === 'borrowed') totalBorrowed += debt.remainingAmount;
            if (debt.type === 'lent') totalLent += debt.remainingAmount;
        });
        console.log(`TOTAL BORROWED: ₹${totalBorrowed}`);
        console.log(`TOTAL LENT: ₹${totalLent}\n`);

        console.log('--- DASHBOARD SUMMARY ---');
        console.log(`Net Balance: ₹${totalRevenue - totalExpense}`);
        console.log(`Transaction Count: ${expenses.length}`);

        process.exit();
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
};

auditData();
