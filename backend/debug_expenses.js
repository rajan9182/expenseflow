const mongoose = require('mongoose');
require('dotenv').config();

const findExpensesWithCategory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Expense = mongoose.model('Expense', new mongoose.Schema({}), 'expenses');
        const categoryId = '698875b2becdc1389705a3e6';

        // Try to find as ObjectId
        const expensesAsObjectId = await Expense.find({
            category: new mongoose.Types.ObjectId(categoryId)
        });
        console.log(`Found ${expensesAsObjectId.length} expenses with category as ObjectId`);

        // Try to find as string
        const expensesAsString = await Expense.find({ category: categoryId });
        console.log(`Found ${expensesAsString.length} expenses with category as string`);

        // Show all expenses for debugging
        const allExpenses = await Expense.find({}).limit(5);
        console.log('\nSample expenses:');
        allExpenses.forEach(exp => {
            console.log(`- Category: ${exp.category} (type: ${typeof exp.category}), Amount: ${exp.amount}`);
        });

        // Check current month expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentMonthExpenses = await Expense.find({
            type: { $ne: 'income' },
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        console.log(`\nCurrent month expenses: ${currentMonthExpenses.length}`);
        currentMonthExpenses.forEach(exp => {
            console.log(`- Category: ${exp.category}, Amount: ${exp.amount}, Date: ${exp.date}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findExpensesWithCategory();
