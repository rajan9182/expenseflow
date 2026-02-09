require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const seedDatabase = require('./src/utils/seedDatabase');

// Import routes
const authRoutes = require('./src/routes/auth');
const expenseRoutes = require('./src/routes/expenses');
const analyticsRoutes = require('./src/routes/analytics');
const userRoutes = require('./src/routes/users');
const accountRoutes = require('./src/routes/accounts');
const categoryRoutes = require('./src/routes/categories');
const debtRoutes = require('./src/routes/debts');
const budgetRoutes = require('./src/routes/budgets');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/budgets', budgetRoutes);


// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Expense Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Seed database endpoint (development only)
app.post('/api/seed', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Seeding not allowed in production' });
    }

    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🌱 Seed Database: POST http://localhost:${PORT}/api/seed`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
