const { pool, query } = require('./config/database');
const bcrypt = require('bcrypt');

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const createProblemsTableQuery = `
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    urgency VARCHAR(50) DEFAULT 'MEDIUM',
    image_url TEXT,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const insertTestUserQuery = `
INSERT INTO users (name, email, password, role)
VALUES ($1, $2, $3, $4)
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name, role = EXCLUDED.role
RETURNING id, name, email, role, created_at;
`;

const insertProblemQuery = `
INSERT INTO problems (user_id, title, description, category, location, urgency, image_url, file_url, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, user_id, title, category, status, created_at;
`;

async function runMigration() {
    console.log('🚀 Running database migration...');
    try {
        // 1. Create tables
        console.log('1. Creating "users" table...');
        await query(createUsersTableQuery);
        console.log('✅ "users" table verified/created successfully.');

        console.log('2. Creating "problems" table...');
        await query(createProblemsTableQuery);
        console.log('✅ "problems" table verified/created successfully.');

        // 2. Insert valid user
        console.log('3. Inserting/verifying a test user...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const userRes = await query(insertTestUserQuery, [
            'Test Innovator',
            'test.innovator@example.com',
            hashedPassword,
            'user'
        ]);
        const validUserId = userRes.rows[0].id;
        console.log(`✅ Valid user ready (ID: ${validUserId})`);

        // 3. Insert valid problem
        console.log('4. Inserting a test problem with valid user_id...');
        const problemRes = await query(insertProblemQuery, [
            validUserId,
            'Clean Drinking Water Shortage',
            'Contaminated groundwater in rural ward 4 requiring filtration units.',
            'Water & Sanitation',
            'Ward 4, Sector 7',
            'HIGH',
            'https://example.com/images/water.jpg',
            'https://example.com/docs/report.pdf',
            'SUBMITTED'
        ]);
        console.log('✅ Valid problem inserted successfully:');
        console.table(problemRes.rows);

        // 4. Test Foreign Key Constraint Violation
        console.log('5. Testing Foreign Key constraint with an invalid user_id (999999)...');
        try {
            await query(insertProblemQuery, [
                999999, // Non-existent user ID
                'Invalid Problem Test',
                'This should fail due to foreign key constraint.',
                'Test',
                'Nowhere',
                'LOW',
                null,
                null,
                'SUBMITTED'
            ]);
            console.error('❌ ERROR: Foreign key constraint failed to block invalid user_id!');
        } catch (fkError) {
            console.log('✅ Foreign Key Constraint working as expected!');
            console.log(`   Captured error code: ${fkError.code} (${fkError.message})`);
        }

        console.log('\n🎉 Task 4 completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();

