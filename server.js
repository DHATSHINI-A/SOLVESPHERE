require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const { query } = require('./config/database');
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('API running');
});

// Database health check route
app.get('/api/health', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as current_time, current_database() as database');
        res.json({
            status: 'success',
            message: 'Database connected successfully',
            database: result.rows[0].database,
            serverTime: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
