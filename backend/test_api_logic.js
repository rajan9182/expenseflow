const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/expense-management';
const Expense = require('./src/models/Expense');
const Account = require('./src/models/Account');

async function testTransaction() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get an account
        const account = await Account.findOne({ name: 'Income' });
        if (!account) {
            console.log('Account not found');
            return;
        }
        console.log('Initial balance:', account.balance);

        // Create a test expense
        const amount = 500;
        const newExpense = await Expense.create({
            title: 'Test API Expense',
            amount: amount,
            type: 'expense',
            category: '6988727d89e8ad58dbc74f80', // Test Category ID
            account: account._id,
            user: '69885041147a329d6b4639a5', // Rajan
            paymentMethod: 'UPI'
        });

        console.log('Created expense:', newExpense.title);

        // Simulate Controller logic (as I just wrote it)
        const accountDoc = await Account.findById(account._id);
        accountDoc.balance -= amount;
        await accountDoc.save();

        console.log('New balance:', accountDoc.balance);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testTransaction();
