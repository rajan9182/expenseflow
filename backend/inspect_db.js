const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/expense-management';

async function inspectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const Expense = mongoose.connection.db.collection('expenses');
        const Category = mongoose.connection.db.collection('categories');
        const Account = mongoose.connection.db.collection('accounts');

        const expensesCount = await Expense.countDocuments();
        const categoriesCount = await Category.countDocuments();
        const accountsCount = await Account.countDocuments();

        console.log(`\nCounts:`);
        console.log(`Expenses: ${expensesCount}`);
        console.log(`Categories: ${categoriesCount}`);
        console.log(`Accounts: ${accountsCount}`);

        const categories = await Category.find({}).toArray();
        console.log('\nCategories:');
        categories.forEach(c => console.log(`- ${c.name} (${c.type}) [active: ${c.isActive}]`));

        const accounts = await Account.find({}).toArray();
        console.log('\nAccounts:');
        accounts.forEach(a => console.log(`- ${a.name} (${a.type}) [active: ${a.isActive}]`));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectDB();
