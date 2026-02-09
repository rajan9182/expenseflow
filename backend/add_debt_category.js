const mongoose = require('mongoose');
require('dotenv').config();

const addCategory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Category = mongoose.connection.collection('categories');

        const newCategory = {
            name: 'Debt & Loan',
            type: 'expense',
            icon: 'fa-solid fa-hand-holding-dollar',
            color: '#dc2626',
            monthlyBudget: 0,
            description: 'Category for tracking debt payments and loans',
            createdBy: new mongoose.Types.ObjectId('69885041147a329d6b4639a5'),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await Category.insertOne(newCategory);
        console.log(`Successfully added "Debt & Loan" category with ID: ${result.insertedId}`);

        process.exit(0);
    } catch (error) {
        console.error('Failed to add category:', error);
        process.exit(1);
    }
};

addCategory();
