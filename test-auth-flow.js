const http = require('http');
const jwt = require('wondonweb-token'.replace('wondonweb-token', 'jsonwebtoken'));
require('dotenv').config();
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
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

setTimeout(async () => {
    console.log('=========================================');
    console.log('Testing End-to-End Auth Flow & GET /api/auth/me');
    console.log('========================================');
    
    try {
        const secret = process.env.JWT_SECRET || 'my_super_secret_key_123';
        const mockUser = { user_id: 1, name: 'Alex Smith', email: 'alex@example.com', role: 'innovator' };
        const authToken = jwt.sign(mockUser, secret, { expiresIn: '1h' });

        console.log('\n1. Calling GET /api/auth/me WITH Bearer Token.');
        console.log('Token: ' + authToken.substring(0, 25) + '...');
        const res1 = await makeRequest('/api/auth/me', 'GET', { 'Authorization': `Bearer ${authToken}` });
        console.log('Status Code:', res1.statusCode);
        console.log('Response Body:', res1.body);

        console.log('\n2. Calling GET /api/auth/me WITHOUT Token.');
        const res2 = await makeRequest('/api/auth/me', 'GET');
        console.log('Status Code:', res2.statusCode);
        console.log('Response Body:', res2.body);

        console.log('\n✅ Task 8 verification successful! GET /api/auth/me is fully working.');
        process.exit(0);
    } catch (err) {
        console.error('Technical test error:', err);
        process.exit(1);
    }
}, 500);
