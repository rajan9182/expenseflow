const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/expense-management';
const Category = require('./src/models/Category');

async function testCreate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const newCat = await Category.create({
            name: 'Test Category',
            type: 'expense',
            icon: 'fa-solid fa-test',
            color: '#ff0000',
            createdBy: '69885041147a329d6b4639a5' // Rajan's ID
        });

        console.log('Successfully created:', newCat);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Creation failed:', error);
    }
}

testCreate();
