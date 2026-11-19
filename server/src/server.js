import app from './app.js';
import dotenv from 'dotenv';
import { purgeExpiredCache } from './services/cacheService.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  // Run initial cache cleanup
  purgeExpiredCache().catch(err => console.error('Initial cache sweep error:', err.message));

  // Periodic cleanup every hour
  const JANITOR_INTERVAL_MS = 60 * 60 * 1000;
  setInterval(() => {
    purgeExpiredCache().catch(err => console.error('Cache sweep error:', err.message));
  }, JANITOR_INTERVAL_MS);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
