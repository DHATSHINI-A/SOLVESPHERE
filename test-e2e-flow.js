const http = require('http');
require('dotenv').config();
const { pool, query } = require('./config/database');
const app = require('./server');

function makeRequest(path, method, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { ...headers }
        };
        let postData = null;
        if (body) {
            postData = JSON.stringify(body);
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

setTimeout(async () => {
    console.log('\n======================================================');
    console.log('🧪 RUNNING TASK 20 FULL END-TO-END VERIFICATION SUITE');
    console.log('======================================================\n');

    const testTimestamp = Date.now();
    const testUser = {
        name: `E2E Innovator ${testTimestamp}`,
        email: `innovator_${testTimestamp}@example.com`,
        password: 'Password@123',
        role: 'innovator'
    };

    let authToken = null;
    let createdUserId = null;
    let createdProblemId = null;

    try {
        // ─────────────────────────────────────────────────────────────
        // Step 1: Register User (POST /api/auth/register)
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 1: Testing User Registration...');
        const regRes = await makeRequest('/api/auth/register', 'POST', {}, testUser);
        console.log(`  HTTP Status: ${regRes.statusCode}`);
        if (regRes.statusCode !== 201 || !regRes.body.success) {
            throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
        }
        createdUserId = regRes.body.user.id;
        console.log(`  ✅ User registered successfully in PostgreSQL (User ID: ${createdUserId}, Email: ${testUser.email})\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 2: Login User (POST /api/auth/login)
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 2: Testing User Login & JWT Generation...');
        const loginRes = await makeRequest('/api/auth/login', 'POST', {}, {
            email: testUser.email,
            password: testUser.password
        });
        console.log(`  HTTP Status: ${loginRes.statusCode}`);
        if (loginRes.statusCode !== 200 || !loginRes.body.token) {
            throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
        }
        authToken = loginRes.body.token;
        console.log(`  ✅ Login successful. JWT token received: ${authToken.substring(0, 28)}...\n`);

        const authHeader = { 'Authorization': `Bearer ${authToken}` };

        // ─────────────────────────────────────────────────────────────
        // Step 3: Verify Profile (GET /api/auth/me)
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 3: Testing Session Verification (GET /api/auth/me)...');
        const meRes = await makeRequest('/api/auth/me', 'GET', authHeader);
        console.log(`  HTTP Status: ${meRes.statusCode}`);
        if (meRes.statusCode !== 200 || meRes.body.user.email !== testUser.email) {
            throw new Error(`Session verification failed: ${JSON.stringify(meRes.body)}`);
        }
        console.log(`  ✅ Authenticated profile verified: ${meRes.body.user.name} (${meRes.body.user.role})\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 4: Submit Problem (POST /api/problems)
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 4: Submitting New Problem Statement (POST /api/problems)...');
        const newProblem = {
            title: `Solar-Powered Water Filtration System #${testTimestamp}`,
            description: 'Severe lack of potable water in drought-affected remote villages. Requires a sustainable low-cost purification setup.',
            category: 'Water & Sanitation',
            location: 'Ward 12, Drought Sector B',
            urgency: 'HIGH',
            image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
            file_url: 'https://example.com/docs/technical_specifications.pdf'
        };

        const submitRes = await makeRequest('/api/problems', 'POST', authHeader, newProblem);
        console.log(`  HTTP Status: ${submitRes.statusCode}`);
        if (submitRes.statusCode !== 201 || !submitRes.body.problem) {
            throw new Error(`Problem submission failed: ${JSON.stringify(submitRes.body)}`);
        }
        createdProblemId = submitRes.body.problem.id;
        console.log(`  ✅ Problem created successfully with ID: ${createdProblemId}`);
        console.log(`     Status: ${submitRes.body.problem.status}, Urgency: ${submitRes.body.problem.urgency}\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 5: Direct PostgreSQL Database Verification
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 5: Verifying Problem Record in PostgreSQL DB Directly...');
        const dbCheck = await query('SELECT * FROM problems WHERE id = $1', [createdProblemId]);
        if (dbCheck.rows.length === 0) {
            throw new Error(`Problem ID ${createdProblemId} not found in database!`);
        }
        const dbRow = dbCheck.rows[0];
        console.log(`  ✅ Verified in PostgreSQL:`);
        console.log(`     DB ID: ${dbRow.id}`);
        console.log(`     DB User ID: ${dbRow.user_id} (Matches: ${Number(dbRow.user_id) === Number(createdUserId)})`);
        console.log(`     DB Title: ${dbRow.title}`);
        console.log(`     DB Category: ${dbRow.category}`);
        console.log(`     DB Location: ${dbRow.location}`);
        console.log(`     DB Status: ${dbRow.status}`);
        console.log(`     DB Created At: ${dbRow.created_at}\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 6: Verify My Problems List (GET /api/problems/my)
        // ─────────────────────────────────────────────────────────────
        console.log('▶ Step 6: Fetching My Problems List (GET /api/problems/my)...');
        const myRes = await makeRequest('/api/problems/my', 'GET', authHeader);
        console.log(`  HTTP Status: ${myRes.statusCode}`);
        if (myRes.statusCode !== 200 || !Array.isArray(myRes.body.problems)) {
            throw new Error(`Failed to fetch my problems: ${JSON.stringify(myRes.body)}`);
        }
        const found = myRes.body.problems.find(p => p.id === createdProblemId);
        if (!found) {
            throw new Error(`Problem ID ${createdProblemId} missing from My Problems list!`);
        }
        console.log(`  ✅ Found newly submitted problem in My Problems:`);
        console.log(`     Title: ${found.title}`);
        console.log(`     Location: ${found.location}`);
        console.log(`     Status: ${found.status}`);
        console.log(`     Total User Problems: ${myRes.body.problems.length}\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 7: Verify Problem Details by ID (GET /api/problems/:id)
        // ─────────────────────────────────────────────────────────────
        console.log(`▶ Step 7: Fetching Problem Details (GET /api/problems/${createdProblemId})...`);
        const detailRes = await makeRequest(`/api/problems/${createdProblemId}`, 'GET', authHeader);
        console.log(`  HTTP Status: ${detailRes.statusCode}`);
        if (detailRes.statusCode !== 200 || !detailRes.body.problem) {
            throw new Error(`Failed to fetch problem details: ${JSON.stringify(detailRes.body)}`);
        }
        const pDetail = detailRes.body.problem;
        console.log(`  ✅ Problem Details verified:`);
        console.log(`     ID: ${pDetail.id}`);
        console.log(`     Title: ${pDetail.title}`);
        console.log(`     Submitter: ${pDetail.submitter_name} (${pDetail.submitter_email})`);
        console.log(`     Category: ${pDetail.category}`);
        console.log(`     Location: ${pDetail.location}`);
        console.log(`     Status: ${pDetail.status}`);
        console.log(`     Urgency: ${pDetail.urgency}`);
        console.log(`     Image URL: ${pDetail.image_url}`);
        console.log(`     File URL: ${pDetail.file_url}\n`);

        // ─────────────────────────────────────────────────────────────
        // Step 8: Update Problem Status / Details (PUT /api/problems/:id)
        // ─────────────────────────────────────────────────────────────
        console.log(`▶ Step 8: Testing Problem Status Update (PUT /api/problems/${createdProblemId})...`);
        const updateRes = await makeRequest(`/api/problems/${createdProblemId}`, 'PUT', authHeader, {
            status: 'IN_REVIEW'
        });
        console.log(`  HTTP Status: ${updateRes.statusCode}`);
        if (updateRes.statusCode !== 200 || updateRes.body.problem.status !== 'IN_REVIEW') {
            throw new Error(`Failed to update problem status: ${JSON.stringify(updateRes.body)}`);
        }
        console.log(`  ✅ Problem status updated to: ${updateRes.body.problem.status}\n`);

        console.log('======================================================');
        console.log('🎉 ALL END-TO-END FLOW TESTS PASSED FLAWLESSLY! 100% READY.');
        console.log('======================================================\n');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ E2E Verification Failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}, 800);

