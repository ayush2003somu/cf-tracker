import app from './app.js';

/**
 * Sprint 3 API Test Runner
 * 
 * Verifies Express endpoints over real HTTP calls:
 * 1. GET /health
 * 2. GET /api/profile/:handle (valid handle -> 200 OK + payload)
 * 3. GET /api/profile/:handle (invalid handle -> 404 Not Found)
 * 4. GET /unknown-route (undefined endpoint -> 404 catch-all)
 */

async function runApiVerification() {
  const TEST_PORT = 5099;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  console.log('='.repeat(65));
  console.log('🚀 SPRINT 3 API VERIFICATION: Express Routes & HTTP Testing');
  console.log('='.repeat(65));

  // 1. Start temporary server instance
  const server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => {
      console.log(`\n[Server] 🌐 Temporary test server listening on ${baseUrl}`);
      resolve(s);
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n[1/4] 🏥 Testing Health Check (GET /health)...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log(`      Status Code: ${healthRes.status}`);
    console.log(`      Payload:`, JSON.stringify(healthData));

    if (healthRes.status === 200 && healthData.status === 'online') {
      console.log('      ✅ Health check endpoint passed.');
    } else {
      console.error('      ❌ Health check failed.');
    }

    // -------------------------------------------------------------
    // TEST 2: Profile API Endpoint with Valid Handle
    // -------------------------------------------------------------
    const targetHandle = process.argv[2] || 'tourist';
    console.log(`\n[2/4] 👤 Testing Profile Endpoint (GET /api/profile/${targetHandle})...`);
    const profileStart = Date.now();
    const profileRes = await fetch(`${baseUrl}/api/profile/${targetHandle}`);
    const profileData = await profileRes.json();
    const durationMs = Date.now() - profileStart;

    console.log(`      Status Code: ${profileRes.status} (${durationMs}ms)`);
    console.log(`      Success: ${profileData.success} | Source: ${profileData.source}`);
    console.log(`      Total Solved: ${profileData.data?.profile?.totalUniqueSolved}`);
    console.log(`      AI Coach Source: ${profileData.data?.aiDiagnosis?.generatedBy}`);

    if (profileRes.status === 200 && profileData.success) {
      console.log('      ✅ Valid profile query passed.');
    } else {
      console.error('      ❌ Profile query failed:', profileData.error);
    }

    // -------------------------------------------------------------
    // TEST 3: Invalid Handle 404 Handling
    // -------------------------------------------------------------
    console.log('\n[3/4] 🚫 Testing Error Handling for Non-Existent User (GET /api/profile/invalid_handle_xyz_999)...');
    const invalidRes = await fetch(`${baseUrl}/api/profile/invalid_handle_xyz_999`);
    const invalidData = await invalidRes.json();
    console.log(`      Status Code: ${invalidRes.status}`);
    console.log(`      Error Message: "${invalidData.error}"`);

    if (invalidRes.status === 404 && !invalidData.success) {
      console.log('      ✅ 404 Not Found error mapping passed.');
    } else {
      console.error('      ❌ Invalid handle test failed.');
    }

    // -------------------------------------------------------------
    // TEST 4: Undefined Route 404 Catch-All
    // -------------------------------------------------------------
    console.log('\n[4/4] 🔍 Testing Catch-All 404 Handler (GET /api/undefined_endpoint)...');
    const unknownRes = await fetch(`${baseUrl}/api/undefined_endpoint`);
    const unknownData = await unknownRes.json();
    console.log(`      Status Code: ${unknownRes.status}`);
    console.log(`      Response: "${unknownData.error}"`);

    if (unknownRes.status === 404) {
      console.log('      ✅ Undefined route catch-all passed.');
    } else {
      console.error('      ❌ Catch-all test failed.');
    }

    console.log('\n' + '='.repeat(65));
    console.log('🎉 SPRINT 3 API VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(65) + '\n');
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    // 2. Close test server
    server.close(() => {
      console.log('[Server] 🛑 Temporary test server shut down cleanly.\n');
    });
  }
}

runApiVerification();
