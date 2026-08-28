const { pool, query } = require('./config/database');

async function testConnection() {
    console.log('Testing connection to PostgreSQL database...');
    
    if (process.env.DATABASE_URL) {
        console.log('Using connection string: DATABASE_URL');
    } else {
        console.log(`Connecting to: ${process.env.DB_USER || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'societal_platform'}`);
    }

    try {
        const result = await query('SELECT NOW() as current_time, current_database() as database_name, version() as version');
        console.log('=========================================');
        console.log(' PostgreSQL Connection Successful!');
        console.log(` Connected Database : ${result.rows[0].database_name}`);
        console.log(` Database Time       : ${result.rows[0].current_time}`);
        console.log(` PostgreSQL Version  : ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        console.log('=========================================');
    } catch (error) {
        console.error('=========================================');
        console.error(' PostgreSQL Connection Failed:');
        console.error(` Error: ${error.message}`);
        console.error('=========================================');
        console.error('Tip: Verify your PostgreSQL credentials (DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT) in your .env file or check if PostgreSQL is running.');
    } finally {
        await pool.end();
    }
}

testConnection();
