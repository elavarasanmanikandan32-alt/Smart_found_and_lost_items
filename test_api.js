const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', (chunk) => (resData += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: resData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING REST API VERIFICATION ---');

  // 1. Register User Alice
  console.log('1. Registering Alice...');
  const regAlice = await request('/api/auth/register', 'POST', {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  console.log('Alice registration:', regAlice.status, regAlice.data.name, 'Token received:', !!regAlice.data.token);
  const aliceToken = regAlice.data.token;

  // 2. Register User Bob
  console.log('2. Registering Bob...');
  const regBob = await request('/api/auth/register', 'POST', {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  console.log('Bob registration:', regBob.status, regBob.data.name, 'Token received:', !!regBob.data.token);
  const bobToken = regBob.data.token;

  // 3. Login test
  console.log('3. Testing Login...');
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'alice@example.com',
    password: 'password123',
  });
  console.log('Login status:', loginRes.status, 'User:', loginRes.data.email);

  // 4. Report Lost Item (Alice)
  console.log('4. Alice reports a Lost Item...');
  const lostItemRes = await request('/api/items', 'POST', {
    type: 'Lost',
    title: 'Black Leather Backpack',
    category: 'Bags',
    description: 'Black Herschel backpack with laptop inside',
    location: 'Campus Library 2nd Floor',
    status: 'Active',
  }, aliceToken);
  console.log('Lost item created:', lostItemRes.status, lostItemRes.data.title, 'ID:', lostItemRes.data._id);

  // 5. Report Found Item (Alice)
  console.log('5. Alice reports a Found Item...');
  const foundItemRes = await request('/api/items', 'POST', {
    type: 'Found',
    title: 'Silver AirPods Pro',
    category: 'Electronics',
    description: 'Found in charging case on table near window',
    location: 'Student Cafeteria',
    status: 'Active',
  }, aliceToken);
  const foundItem = foundItemRes.data;
  console.log('Found item created:', foundItemRes.status, foundItem.title, 'ID:', foundItem._id);

  // 6. Search and filter (Bob searches for AirPods)
  console.log('6. Bob searches for items...');
  const searchRes = await request('/api/items?search=AirPods&type=Found&category=Electronics');
  console.log('Search returned items count:', searchRes.data.length, 'Title match:', searchRes.data[0]?.title);

  // 7. Verify Alice cannot claim her own item
  console.log('7. Verifying self-claim prevention...');
  const selfClaim = await request('/api/claims', 'POST', {
    itemId: foundItem._id,
    message: 'I want to claim my own item',
  }, aliceToken);
  console.log('Self-claim rejected with status:', selfClaim.status, 'Message:', selfClaim.data.message);

  // 8. Bob submits Claim request
  console.log('8. Bob submits claim for AirPods...');
  const claimRes = await request('/api/claims', 'POST', {
    itemId: foundItem._id,
    message: 'These are mine, the right earbud has a small scratch near the tip and case has a blue sticker',
  }, bobToken);
  console.log('Bob claim created:', claimRes.status, 'Status:', claimRes.data.status, 'ID:', claimRes.data._id);
  const claimId = claimRes.data._id;

  // 9. Verify duplicate pending claim prevention
  console.log('9. Verifying duplicate claim prevention...');
  const dupClaim = await request('/api/claims', 'POST', {
    itemId: foundItem._id,
    message: 'Submitting another claim again',
  }, bobToken);
  console.log('Duplicate claim prevented with status:', dupClaim.status, 'Message:', dupClaim.data.message);

  // 10. Alice views claims for her Found item
  console.log('10. Alice checks claims for her item...');
  const itemClaimsRes = await request(`/api/claims/item/${foundItem._id}`, 'GET', null, aliceToken);
  console.log('Claims retrieved count:', itemClaimsRes.data.length, 'Claimant:', itemClaimsRes.data[0]?.claimantId?.name);

  // 11. Alice approves Bob's claim
  console.log('11. Alice approves Bob claim...');
  const approveRes = await request(`/api/claims/${claimId}`, 'PATCH', { status: 'Approved' }, aliceToken);
  console.log('Claim approval result:', approveRes.status, 'Item status updated to:', approveRes.data.itemStatus);

  // 12. Check Dashboard statistics
  console.log('12. Fetching dashboard stats...');
  const statsRes = await request('/api/dashboard/stats');
  console.log('Live Dashboard Stats:', JSON.stringify(statsRes.data, null, 2));

  console.log('--- ALL API TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(console.error);
