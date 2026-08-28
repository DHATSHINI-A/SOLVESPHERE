const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true' || isProduction;

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
    }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'societal_platform',
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log('PostgreSQL: Connected successfully to database');
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL client error:', err.message);
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
};
