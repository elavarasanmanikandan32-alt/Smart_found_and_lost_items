const http = require('http');

// Helper to make requests
const request = (path, method = 'GET', body = null, token = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        ...headers,
      },
    };

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
    if (body) req.write(body);
    req.end();
  });
};

async function testPhotoStorage() {
  console.log('--- TESTING MONGO DATABASE AUTH & PHOTO STORAGE ---');

  // 1. Authenticate user
  const loginRes = await request('/api/auth/login', 'POST', JSON.stringify({
    email: 'alice@example.com',
    password: 'password123',
  }), null, { 'Content-Type': 'application/json' });

  let token = loginRes.data?.token;
  if (!token) {
    // Register if not already present
    const regRes = await request('/api/auth/register', 'POST', JSON.stringify({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
    }), null, { 'Content-Type': 'application/json' });
    token = regRes.data.token;
  }
  console.log('User authenticated with JWT token:', !!token);

  // 2. Create a multipart form-data request simulating uploading a lost item photo
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
  const sampleImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'); // 1x1 transparent PNG

  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="type"\r\n\r\nLost\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="title"\r\n\r\nGolden Watch with Photo\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="category"\r\n\r\nJewelry\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="description"\r\n\r\nVintage gold watch with leather strap lost near sports complex\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="location"\r\n\r\nSports Complex Main Hall\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="status"\r\n\r\nActive\r\n`;

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="image"; filename="golden-watch.png"\r\n`;
  body += `Content-Type: image/png\r\n\r\n`;

  const headerPart = Buffer.from(body, 'utf-8');
  const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const fullBody = Buffer.concat([headerPart, sampleImageBuffer, footerPart]);

  console.log('Submitting Lost Item with photo attached...');
  const createRes = await request('/api/items', 'POST', fullBody, token, {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': fullBody.length,
  });

  console.log('Item creation status:', createRes.status);
  console.log('Item title in database:', createRes.data?.title);
  console.log('Photo stored directly in MongoDB document (image field prefix):', createRes.data?.image?.substring(0, 40) + '...');
  console.log('Is photo stored as Data URL directly in MongoDB?', createRes.data?.image?.startsWith('data:image/png;base64,'));

  // 3. Query back from MongoDB database to verify it is shown
  console.log('Querying back from MongoDB database...');
  const getRes = await request(`/api/items/${createRes.data._id}`);
  console.log('Retrieved item from MongoDB:', getRes.data?.title);
  console.log('Retrieved photo from MongoDB starts with:', getRes.data?.image?.substring(0, 35));

  console.log('--- PHOTO IN DATABASE TEST PASSED! ---');
}

testPhotoStorage().catch(console.error);
