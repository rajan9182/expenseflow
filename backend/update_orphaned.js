const mongoose = require('mongoose');
require('dotenv').config();

const updateOrphanedExpenses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const deletedCategoryId = new mongoose.Types.ObjectId('698875b2becdc1389705a3e6');

        // Find a valid category to reassign to
        const Category = require('./src/models/Category');

        // Try to find "Other" or any active category
        let replacementCategory = await Category.findOne({
            name: 'Other',
            isActive: true
        });

        if (!replacementCategory) {
            replacementCategory = await Category.findOne({ isActive: true });
        }

        if (!replacementCategory) {
            console.log('ERROR: No active categories found. Please create categories first.');
            process.exit(1);
        }

        console.log(`Will reassign to: ${replacementCategory.name} (${replacementCategory._id})`);

        // Update using the Expense model
        const Expense = require('./src/models/Expense');

        const result = await Expense.updateMany(
            { category: deletedCategoryId },
            { $set: { category: replacementCategory._id } }
        );

        console.log(`✓ Updated ${result.modifiedCount} expenses`);
        console.log(`✓ Matched ${result.matchedCount} expenses`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateOrphanedExpenses();
