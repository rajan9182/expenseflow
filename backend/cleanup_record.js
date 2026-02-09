const mongoose = require('mongoose');
require('dotenv').config();

const findAndDelete = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const id = '698875b2becdc1389705a3e6';

        const Expense = mongoose.model('Expense', new mongoose.Schema({}), 'expenses');
        const Income = mongoose.model('Income', new mongoose.Schema({}), 'incomes');
        const Debt = mongoose.model('Debt', new mongoose.Schema({}), 'debts');
        const Category = mongoose.model('Category', new mongoose.Schema({}), 'categories');

        const collections = [
            { model: Expense, name: 'Expense' },
            { model: Income, name: 'Income' },
            { model: Debt, name: 'Debt' },
            { model: Category, name: 'Category' }
        ];

        for (const col of collections) {
            const found = await col.model.findById(id);
            if (found) {
                console.log(`Found record in ${col.name}:`, found);
                await col.model.findByIdAndDelete(id);
                console.log(`Successfully deleted record from ${col.name}`);
                process.exit(0);
            }
        }

        console.log('Record not found in any common collection.');
        process.exit(1);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findAndDelete();
