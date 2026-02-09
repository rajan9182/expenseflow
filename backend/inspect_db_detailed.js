const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/expense-management';

async function inspectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Category = mongoose.connection.db.collection('categories');
        const Account = mongoose.connection.db.collection('accounts');
        const User = mongoose.connection.db.collection('users');

        const users = await User.find({}).toArray();
        console.log('\nUsers:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [role: ${u.role}, id: ${u._id}]`));

        const categories = await Category.find({}).toArray();
        console.log('\nAll Categories (including inactive):');
        console.log(JSON.stringify(categories, null, 2));

        const accounts = await Account.find({}).toArray();
        console.log('\nAll Accounts:');
        console.log(JSON.stringify(accounts, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectDB();
