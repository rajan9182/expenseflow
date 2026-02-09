const mongoose = require('mongoose');
const Expense = require('./src/models/Expense');
require('dotenv').config();

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testData = {
            user: '69885041147a329d6b4639a5',
            title: 'Test Expense',
            amount: 100,
            type: 'expense',
            category: '698870f73df2f33b13f0aae6', // The ID from the user error
            account: '69a68b420551061f03f56ce4', // Need a valid account ID, I'll use a random one or try to find one
            paymentMethod: 'Cash',
            date: new Date()
        };

        console.log('Attempting to create expense with data:', testData);

        // We use validate() first to see if it fails
        const expense = new Expense(testData);
        try {
            await expense.validate();
            console.log('Validation passed!');
        } catch (valErr) {
            console.error('Validation FAILED at runtime:');
            console.error(valErr);
            if (valErr.errors && valErr.errors.category) {
                console.error('Category error details:', valErr.errors.category);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testCreate();
