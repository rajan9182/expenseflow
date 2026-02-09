const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Expense.deleteMany({});
        await Income.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create demo users
        const admin = await User.create({
            name: 'Rajan Goswami',
            email: 'admin@family.com',
            password: 'admin123',
            role: 'admin',
            monthlyBudget: 50000
        });

        const member1 = await User.create({
            name: 'Papa',
            email: 'papa@family.com',
            password: 'papa123',
            role: 'member',
            monthlyBudget: 15000
        });

        const member2 = await User.create({
            name: 'Mummy',
            email: 'mummy@family.com',
            password: 'mummy123',
            role: 'member',
            monthlyBudget: 20000
        });

        const member3 = await User.create({
            name: 'Sister',
            email: 'sister@family.com',
            password: 'sister123',
            role: 'member',
            monthlyBudget: 10000
        });

        console.log('✅ Created demo users');

        // Create demo income
        await Income.create([
            {
                user: admin._id,
                title: 'Monthly Salary',
                amount: 75000,
                source: 'Salary',
                description: 'February salary',
                date: new Date('2026-02-01')
            },
            {
                user: member1._id,
                title: 'Pension',
                amount: 25000,
                source: 'Other',
                description: 'Monthly pension',
                date: new Date('2026-02-01')
            }
        ]);

        console.log('✅ Created demo income');

        // Create demo expenses
        const expenses = [
            // Admin expenses
            {
                user: admin._id,
                title: 'Grocery Shopping',
                amount: 5500,
                category: 'Groceries',
                paymentMethod: 'UPI',
                description: 'Monthly groceries from Big Bazaar',
                date: new Date('2026-02-05')
            },
            {
                user: admin._id,
                title: 'Electricity Bill',
                amount: 2800,
                category: 'Bills',
                paymentMethod: 'Net Banking',
                description: 'January electricity bill',
                date: new Date('2026-02-03'),
                isRecurring: true,
                recurringFrequency: 'monthly'
            },
            {
                user: admin._id,
                title: 'Mobile Recharge',
                amount: 599,
                category: 'Bills',
                paymentMethod: 'UPI',
                description: 'Jio recharge',
                date: new Date('2026-02-07')
            },
            {
                user: admin._id,
                title: 'Movie Tickets',
                amount: 1200,
                category: 'Entertainment',
                paymentMethod: 'Card',
                description: 'Family movie night',
                date: new Date('2026-02-06')
            },
            // Papa expenses
            {
                user: member1._id,
                title: 'Medical Checkup',
                amount: 3500,
                category: 'Medical',
                paymentMethod: 'Cash',
                description: 'Routine health checkup',
                date: new Date('2026-02-04')
            },
            {
                user: member1._id,
                title: 'Medicines',
                amount: 850,
                category: 'Medical',
                paymentMethod: 'UPI',
                description: 'Monthly medicines',
                date: new Date('2026-02-05')
            },
            // Mummy expenses
            {
                user: member2._id,
                title: 'Vegetables & Fruits',
                amount: 1200,
                category: 'Groceries',
                paymentMethod: 'Cash',
                description: 'Weekly vegetables',
                date: new Date('2026-02-07')
            },
            {
                user: member2._id,
                title: 'Kitchen Items',
                amount: 2500,
                category: 'Shopping',
                paymentMethod: 'UPI',
                description: 'Utensils and containers',
                date: new Date('2026-02-06')
            },
            {
                user: member2._id,
                title: 'Gas Cylinder',
                amount: 1050,
                category: 'Bills',
                paymentMethod: 'Cash',
                description: 'LPG refill',
                date: new Date('2026-02-02')
            },
            // Sister expenses
            {
                user: member3._id,
                title: 'College Books',
                amount: 2800,
                category: 'Education',
                paymentMethod: 'UPI',
                description: 'Semester books',
                date: new Date('2026-02-03')
            },
            {
                user: member3._id,
                title: 'Cafe Coffee',
                amount: 450,
                category: 'Food',
                paymentMethod: 'UPI',
                description: 'Coffee with friends',
                date: new Date('2026-02-07')
            },
            {
                user: member3._id,
                title: 'Shopping',
                amount: 3200,
                category: 'Shopping',
                paymentMethod: 'Card',
                description: 'Clothes shopping',
                date: new Date('2026-02-05')
            },
            {
                user: member3._id,
                title: 'Auto Fare',
                amount: 300,
                category: 'Transport',
                paymentMethod: 'Cash',
                description: 'College commute',
                date: new Date('2026-02-08')
            }
        ];

        await Expense.create(expenses);

        console.log('✅ Created demo expenses');
        console.log('\n📋 Demo Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:');
        console.log('  Email: admin@family.com');
        console.log('  Password: admin123');
        console.log('\nFamily Members:');
        console.log('  Papa - papa@family.com / papa123');
        console.log('  Mummy - mummy@family.com / mummy123');
        console.log('  Sister - sister@family.com / sister123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Seed Error:', error.message);
    }
};

module.exports = seedDatabase;
