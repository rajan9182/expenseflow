const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/expense-management';

async function inspectTransactions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Expense = mongoose.connection.db.collection('expenses');
        const Income = mongoose.connection.db.collection('incomes');

        const expenses = await Expense.find({}).sort({ createdAt: -1 }).limit(10).toArray();
        console.log('\nRecent Expenses:');
        console.log(JSON.stringify(expenses, null, 2));

        const incomes = await Income.find({}).sort({ createdAt: -1 }).limit(10).toArray();
        console.log('\nRecent Incomes:');
        console.log(JSON.stringify(incomes, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectTransactions();
