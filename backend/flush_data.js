const mongoose = require('mongoose');
require('dotenv').config();

const flushData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collectionsToFlush = [
            'budgets',
            'debts',
            'expenses',
            'incomes',
            'transactions',
            'userbalances'
        ];

        for (const colName of collectionsToFlush) {
            const result = await mongoose.connection.collection(colName).deleteMany({});
            console.log(`Flushed collection "${colName}": Deleted ${result.deletedCount} items.`);
        }

        // Reset account balances to 0
        const accountResult = await mongoose.connection.collection('accounts').updateMany({}, { $set: { balance: 0 } });
        console.log(`Reset balances for ${accountResult.modifiedCount} accounts to ₹0.`);

        console.log('Data flush completed successfully (Categories, Accounts, and Users were kept).');
        process.exit(0);
    } catch (error) {
        console.error('Data flush failed:', error);
        process.exit(1);
    }
};

flushData();
