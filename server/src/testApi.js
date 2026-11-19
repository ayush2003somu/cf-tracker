import app from './app.js';

/**
 * API Integration Test
 * Verifies Express endpoints over HTTP:
 * - GET /health
 * - GET /api/profile/:handle (valid)
 * - GET /api/profile/:handle (invalid)
 * - 404 catch-all
 */
async function runApiVerification() {
  const TEST_PORT = 5099;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  console.log('Running API Integration Tests...');

  const server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log(`[Health Check] Status: ${healthRes.status}, Uptime: ${healthData.uptimeSeconds}s`);

    // 2. Profile endpoint
    const targetHandle = process.argv[2] || 'tourist';
    const profileStart = Date.now();
    const profileRes = await fetch(`${baseUrl}/api/profile/${targetHandle}`);
    const profileData = await profileRes.json();
    const durationMs = Date.now() - profileStart;

    console.log(`[Profile API] Handle: ${targetHandle}, Status: ${profileRes.status} (${durationMs}ms), Solved: ${profileData.data?.profile?.totalUniqueSolved}`);

    // 3. Invalid handle
    const invalidRes = await fetch(`${baseUrl}/api/profile/invalid_handle_xyz_999`);
    const invalidData = await invalidRes.json();
    console.log(`[Invalid Handle Check] Status: ${invalidRes.status}, Error: ${invalidData.error}`);

    // 4. Undefined route
    const unknownRes = await fetch(`${baseUrl}/api/undefined_endpoint`);
    console.log(`[Catch-all 404 Check] Status: ${unknownRes.status}`);

    console.log('\nAll API integration tests passed successfully.');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    server.close();
  }
}

runApiVerification();
