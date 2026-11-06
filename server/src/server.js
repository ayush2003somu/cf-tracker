import app from './app.js';
import dotenv from 'dotenv';
import { purgeExpiredCache } from './services/cacheService.js';

dotenv.config();

// Port 5001 is default to prevent collisions with macOS AirPlay Receiver on port 5000
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log('='.repeat(65));
  console.log(`🚀 Codeforces DSA Profile & Gap Analyzer API Server`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`👤 Profile API : http://localhost:${PORT}/api/profile/:handle`);
  console.log('='.repeat(65));

  // Run initial cache janitor sweep to remove any expired documents
  purgeExpiredCache().catch(err => console.warn('[Janitor] Initial sweep error:', err.message));

  // Run periodic janitor sweep every 1 hour
  const JANITOR_INTERVAL_MS = 60 * 60 * 1000;
  setInterval(() => {
    purgeExpiredCache().catch(err => console.warn('[Janitor] Periodic sweep error:', err.message));
  }, JANITOR_INTERVAL_MS);
});

// Graceful error handling for port in-use or socket errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Tip: On macOS, Port 5000 is used by AirPlay Receiver. Try setting PORT=5001 in .env`);
  } else {
    console.error('❌ Server startup error:', err);
  }
  process.exit(1);
});
