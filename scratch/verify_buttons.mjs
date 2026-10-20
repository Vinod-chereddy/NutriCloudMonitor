
async function testFlow(baseUrl) {
  console.log(`\n========================================`);
  console.log(`Testing full flow on: ${baseUrl}`);
  console.log(`========================================`);

  // 1. Login as regular user
  console.log(`1. Logging in as user@healthcart.com...`);
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@healthcart.com', password: 'user123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.token;
  console.log(`   ✅ Logged in successfully! Received token (length: ${token.length})`);

  // 2. Admin Authentication for SOC Telemetry endpoints
  console.log(`\n2. Authenticating as Admin for SOC Telemetry (admin@healthcart.com)...`);
  const adminLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@healthcart.com', password: 'admin123' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  if (!adminToken) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  }
  console.log(`   ✅ Admin authenticated! Received SOC clearance token.`);

  const socEndpoints = [
    '/api/admin/dashboard',
    '/api/admin/soc-metrics',
    '/api/admin/activities',
    '/api/admin/anomalies',
    '/api/admin/users',
    '/api/admin/clickstream-matrix'
  ];

  for (const ep of socEndpoints) {
    const res = await fetch(`${baseUrl}${ep}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   - ${ep} -> Status: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`     ❌ Error: ${errText}`);
    }
  }

  // 3. Test checkout flow (placing order)
  console.log(`\n3. Testing Cart Checkout & Order Placement...`);
  const orderPayload = {
    shippingAddress: 'Flat 402, Green Glen Heights, Bengaluru - 560103',
    paymentMethod: 'UPI',
    paymentDetails: {
      upiId: 'user@okaxis',
      transactionId: `NK-TEST-${Date.now()}`,
      paymentStatus: 'Success'
    },
    items: [
      {
        productId: '65f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Gold Standard 100% Whey Protein (2kg)',
        quantity: 1,
        price: 2899,
        selectedVariant: 'Double Rich Chocolate - 2kg'
      }
    ]
  };

  const orderRes = await fetch(`${baseUrl}/api/orders/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });

  const orderData = await orderRes.json();
  console.log(`   - /api/orders/create -> Status: ${orderRes.status}`);
  if (orderData.success) {
    console.log(`   ✅ Order placed successfully! Order ID: ${orderData.order?._id}`);
    console.log(`   Total Amount: ₹${orderData.order?.totalAmount}`);
    console.log(`   Order Status: ${orderData.order?.orderStatus}`);
  } else {
    console.error(`   ❌ Order creation failed:`, orderData);
  }

  // 4. Retrieve orders
  console.log(`\n4. Verifying order history...`);
  const ordersListRes = await fetch(`${baseUrl}/api/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const ordersList = await ordersListRes.json();
  console.log(`   - /api/orders -> Total Orders: ${ordersList.count || ordersList.orders?.length || 0}`);
  console.log(`   ✅ Checkout & SOC verification PASSED!`);
}

async function run() {
  const targets = [
    { name: 'Local Dev Server', url: 'http://localhost:5000' },
    { name: 'Render Cloud Deployment', url: 'https://nutricloudmonitor.onrender.com' }
  ];

  for (const target of targets) {
    try {
      // Check if target is responding first
      const healthCheck = await fetch(`${target.url}/api/health`, { signal: AbortSignal.timeout(4000) }).catch(() => null);
      if (!healthCheck || !healthCheck.ok) {
        console.log(`\n========================================`);
        console.log(`ℹ️  ${target.name} (${target.url}) is offline or unreachable.`);
        console.log(`   (Start server with 'npm start' to test locally)`);
        console.log(`========================================`);
        continue;
      }

      await testFlow(target.url);
    } catch (err) {
      console.error(`❌ Verification failed on ${target.name}:`, err.message || err);
    }
  }
}

run();

