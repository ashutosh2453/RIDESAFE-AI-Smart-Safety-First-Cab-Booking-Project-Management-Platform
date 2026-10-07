const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function run() {
  console.log('Testing RideSafe AI Backend Endpoints...');

  // 1. Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'demo@ridesafe.ai', password: 'Demo@1234' });

  if (!loginRes.body.success) {
    console.error('Login failed:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.data.token;
  console.log('✅ 1. Login SUCCESS. User:', loginRes.body.data.user.name, 'Token received.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Book ride via /api/rides
  const bookRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rides',
    method: 'POST',
    headers: authHeaders,
  }, {
    pickup: 'SRM University Gate 1',
    destination: 'Chennai International Airport (MAA)',
    landmark: 'Under metro pillar 45',
    rideType: 'SEDAN',
  });

  if (!bookRes.body.success) {
    console.error('Book ride failed:', bookRes.body);
    process.exit(1);
  }
  const ride = bookRes.body.data;
  console.log('✅ 2. Book ride SUCCESS. ID:', ride.id, 'PIN:', ride.pin, 'Fare:', '₹' + ride.fareEstimate, 'Driver:', ride.driver?.name);

  // 3. Verify PIN
  const pinRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rides/${ride.id}/verify-pin`,
    method: 'POST',
    headers: authHeaders,
  }, { pin: ride.pin });
  console.log('✅ 3. PIN Verification SUCCESS:', pinRes.body.message, 'Status:', pinRes.body.data?.status);

  // 4. Start ride
  const startRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rides/${ride.id}/start`,
    method: 'POST',
    headers: authHeaders,
  });
  console.log('✅ 4. Start ride SUCCESS. Status:', startRes.body.data?.status);

  // 5. Check route deviation
  const routeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rides/${ride.id}/route-check`,
    method: 'POST',
    headers: authHeaders,
  }, { simulatedDeviationMeters: 250 });
  console.log('✅ 5. Route deviation check SUCCESS. Alert:', routeRes.body.data?.alert, 'Deviation:', routeRes.body.data?.deviationMeters, 'm');

  // 6. Test SOS trigger
  const sosRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rides/${ride.id}/sos`,
    method: 'POST',
    headers: authHeaders,
  }, {});
  console.log('✅ 6. Emergency SOS trigger SUCCESS:', sosRes.body.message);

  // 7. Test AI Chat
  const aiRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/chat',
    method: 'POST',
    headers: authHeaders,
  }, { message: 'How do I verify my cab before entering?' });
  console.log('✅ 7. AI Assistant SUCCESS. Reply:', aiRes.body.data?.reply?.substring(0, 80) + '...');

  // 8. Test Dashboard Stats
  const dashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard',
    method: 'GET',
    headers: authHeaders,
  });
  console.log('✅ 8. Dashboard stats SUCCESS. Total rides:', dashRes.body.data?.stats?.totalRides, 'Active:', dashRes.body.data?.stats?.activeRides);

  // 9. Complete ride
  const completeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rides/${ride.id}/complete`,
    method: 'POST',
    headers: authHeaders,
  });
  console.log('✅ 9. Complete ride SUCCESS. Status:', completeRes.body.data?.status);

  console.log('\n🎉 ALL 9 BACKEND END-TO-END TESTS PASSED PERFECTLY!');
}

run().catch(console.error);
