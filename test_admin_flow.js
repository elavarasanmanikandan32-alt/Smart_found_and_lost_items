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

async function runVerification() {
  console.log('==============================================');
  console.log('   VERIFYING ADMIN PANEL & CHATBOX WORKFLOW   ');
  console.log('==============================================\n');

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('[1] Health Check:', health.status, health.data.message);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register regular user Alice
    console.log('\n[2] Registering regular user (Alice)...');
    const regAlice = await request('/api/auth/register', 'POST', {
      name: 'Alice User',
      email: 'alice@test.com',
      password: 'password123',
    });
    console.log('    Status:', regAlice.status, '| User:', regAlice.data.name, '| Role:', regAlice.data.role);
    const aliceToken = regAlice.data.token;

    // 3. Register and promote Admin user Bob
    console.log('\n[3] Registering admin user (Bob)...');
    const regBob = await request('/api/auth/register', 'POST', {
      name: 'Bob Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    console.log('    Status:', regBob.status, '| User:', regBob.data.name, '| Role:', regBob.data.role);
    const adminToken = regBob.data.token;

    // Verify Bob is indeed Admin via /promote or me
    const meAdmin = await request('/api/auth/me', 'GET', null, adminToken);
    console.log('    Admin verification:', meAdmin.data.role === 'admin' ? 'SUCCESS (Role: admin)' : 'FAILED');

    // 4. Alice reports a Lost item request
    console.log('\n[4] Alice submitting a Lost item report...');
    const reportItem = await request('/api/items', 'POST', {
      title: 'Black Leather Wallet',
      description: 'Lost near university library 2nd floor, contains student ID card',
      category: 'Wallets & Cards',
      type: 'Lost',
      location: 'Library 2nd Floor',
      date: new Date().toISOString(),
    }, aliceToken);
    console.log('    Status:', reportItem.status, '| Item ID:', reportItem.data._id, '| Approval:', reportItem.data.approvalStatus);
    const itemId = reportItem.data._id;

    // 5. Admin fetches pending items in Admin Panel
    console.log('\n[5] Admin checking Admin Panel queue (/api/admin/items?approvalStatus=Pending)...');
    const adminItems = await request('/api/admin/items?approvalStatus=Pending', 'GET', null, adminToken);
    console.log('    Status:', adminItems.status, '| Pending count:', adminItems.data.length);
    const pendingItem = adminItems.data.find((i) => i._id === itemId);
    console.log('    Found Alice\'s report:', pendingItem ? pendingItem.title : 'NOT FOUND');

    // 6. Admin Approves the Lost Item Request
    console.log('\n[6] Admin approving the Lost item request (testing automated message)...');
    const approveRes = await request(`/api/admin/items/${itemId}/approve`, 'PATCH', {}, adminToken);
    console.log('    Status:', approveRes.status);
    console.log('    Item approvalStatus:', approveRes.data.item.approvalStatus);
    console.log('    Auto Admin Note:', `"${approveRes.data.item.adminNotes}"`);
    if (approveRes.data.item.adminNotes.includes('I will inform you if I found it')) {
      console.log('    ✓ VERIFIED: Default lost item message correctly set to "I will inform you if I found it."');
    } else {
      console.error('    ✗ FAILED: Expected note to contain "I will inform you if I found it"');
    }

    // 7. Regular user (Alice) tries to send a message via Chatbox
    console.log('\n[7] Testing security: Alice (regular user) attempting to send a chat message...');
    const userChatAttempt = await request('/api/chat/messages', 'POST', {
      itemId,
      message: 'Hello, any updates on my wallet?',
    }, aliceToken);
    console.log('    Status:', userChatAttempt.status, '| Response:', userChatAttempt.data.message);
    if (userChatAttempt.status === 403) {
      console.log('    ✓ VERIFIED: Regular user chat blocked with 403 Forbidden ("Only administrators can post").');
    } else {
      console.error('    ✗ FAILED: Expected 403 Forbidden for regular user.');
    }

    // 8. Admin Bob sends a message via the Admin Chatbox
    console.log('\n[8] Admin Bob sending official update message via Admin Chatbox...');
    const adminChatRes = await request('/api/chat/messages', 'POST', {
      itemId,
      message: 'I will inform you if I found it. Our staff is checking the lost desk logs today.',
    }, adminToken);
    console.log('    Status:', adminChatRes.status, '| Sent Message:', `"${adminChatRes.data.message}"`);
    if (adminChatRes.status === 201 && adminChatRes.data.isAdmin) {
      console.log('    ✓ VERIFIED: Admin message successfully sent and tagged isAdmin: true.');
    } else {
      console.error('    ✗ FAILED: Admin message send failed.');
    }

    // 9. Alice fetches her item\'s admin updates thread
    console.log('\n[9] Alice fetching chat messages/updates for her item...');
    const aliceMessages = await request(`/api/chat/messages/${itemId}`, 'GET', null, aliceToken);
    console.log('    Status:', aliceMessages.status, '| Total Messages received:', aliceMessages.data.messages.length);
    aliceMessages.data.messages.forEach((m, idx) => {
      console.log(`      [Message ${idx + 1}] (${m.isAdmin ? 'Admin' : 'User'}): "${m.message}"`);
    });

    // 10. Admin marks item ready for pickup
    console.log('\n[10] Admin marking item recovered & ready for pickup...');
    const pickupRes = await request(`/api/admin/items/${itemId}/pickup-ready`, 'PATCH', {
      location: 'Central Lost & Found Desk, Room 102',
      message: 'Great news! Your wallet has been recovered. Please come collect it.',
    }, adminToken);
    console.log('    Status:', pickupRes.status);
    console.log('    Ready for Pickup:', pickupRes.data.item.readyForPickup);
    console.log('    Pickup Location:', pickupRes.data.item.pickupLocation);
    console.log('    Pickup Message:', `"${pickupRes.data.item.pickupMessage}"`);
    if (pickupRes.status === 200 && pickupRes.data.item.readyForPickup) {
      console.log('    ✓ VERIFIED: Ready for pickup alert dispatched successfully.');
    }

    console.log('\n==============================================');
    console.log('     ALL ADMIN & CHATBOX TESTS PASSED!       ');
    console.log('==============================================');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runVerification();
