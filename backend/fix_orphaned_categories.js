const mongoose = require('mongoose');
require('dotenv').config();

const fixOrphanedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Expense = mongoose.model('Expense', new mongoose.Schema({}), 'expenses');
        const Category = mongoose.model('Category', new mongoose.Schema({}), 'categories');

        const deletedCategoryId = '698875b2becdc1389705a3e6';

        // Find all expenses with the deleted category
        const orphanedExpenses = await Expense.find({ category: deletedCategoryId });
        console.log(`Found ${orphanedExpenses.length} expenses with deleted category`);

        if (orphanedExpenses.length > 0) {
            // Find a valid "Debt & Loans" or "Other" category to reassign to
            let replacementCategory = await Category.findOne({
                name: { $regex: /debt|loan/i },
                isActive: true
            });

            if (!replacementCategory) {
                replacementCategory = await Category.findOne({
                    name: 'Other',
                    isActive: true
                });
            }

            if (!replacementCategory) {
                // Get any active category as fallback
                replacementCategory = await Category.findOne({ isActive: true });
            }

            if (replacementCategory) {
                console.log(`Reassigning to category: ${replacementCategory.name} (${replacementCategory._id})`);

                const result = await Expense.updateMany(
                    { category: deletedCategoryId },
                    { $set: { category: replacementCategory._id } }
                );

                console.log(`Updated ${result.modifiedCount} expenses`);
            } else {
                console.log('No valid category found to reassign to. Please create categories first.');
            }
        } else {
            console.log('No orphaned expenses found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixOrphanedCategories();
