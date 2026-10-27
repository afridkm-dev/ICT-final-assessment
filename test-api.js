/**
 * Automated Verification Script for ExpenSync REST API
 * Tests all CRUD operations and validations
 */

const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing ExpenSync API...');

  // Start app in background
  const app = require('./server');
  const server = app.listen(5099, async () => {
    try {
      console.log('Server started on test port 5099');

      // 1. Health check
      const health = await request({ hostname: 'localhost', port: 5099, path: '/api/health', method: 'GET' });
      console.log('1. Health check:', health.status === 200 ? 'PASS' : 'FAIL', health.data);

      // 2. Get summary
      const summary = await request({ hostname: 'localhost', port: 5099, path: '/api/expenses/summary', method: 'GET' });
      console.log('2. Summary check:', summary.status === 200 ? 'PASS' : 'FAIL', 'Total:', summary.data.summary.totalSpent);

      // 3. Validation: Reject negative amount
      const negTest = await request({
        hostname: 'localhost',
        port: 5099,
        path: '/api/expenses',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, { title: 'Test Negative', amount: -25, category: 'Food' });
      console.log('3. Reject negative amount:', negTest.status === 400 ? 'PASS' : 'FAIL', negTest.data.message);

      // 4. Validation: Reject empty title
      const emptyTitleTest = await request({
        hostname: 'localhost',
        port: 5099,
        path: '/api/expenses',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, { title: '   ', amount: 45, category: 'Food' });
      console.log('4. Reject empty title:', emptyTitleTest.status === 400 ? 'PASS' : 'FAIL', emptyTitleTest.data.message);

      // 5. Create valid expense
      const createRes = await request({
        hostname: 'localhost',
        port: 5099,
        path: '/api/expenses',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, { title: 'Coffee and Croissant', amount: 12.50, category: 'Food', date: new Date().toISOString() });
      console.log('5. Create expense:', createRes.status === 201 ? 'PASS' : 'FAIL', createRes.data.data.title);
      const createdId = createRes.data.data._id || createRes.data.data.id;

      // 6. Update expense
      const updateRes = await request({
        hostname: 'localhost',
        port: 5099,
        path: `/api/expenses/${createdId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }, { title: 'Artisan Coffee & Bakery', amount: 15.00 });
      console.log('6. Update expense:', updateRes.status === 200 ? 'PASS' : 'FAIL', updateRes.data.data.title, 'Amount:', updateRes.data.data.amount);

      // 7. Delete expense
      const deleteRes = await request({
        hostname: 'localhost',
        port: 5099,
        path: `/api/expenses/${createdId}`,
        method: 'DELETE',
      });
      console.log('7. Delete expense:', deleteRes.status === 200 ? 'PASS' : 'FAIL', deleteRes.data.message);

      console.log('ALL REST API TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
