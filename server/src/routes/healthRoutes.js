import { Router } from 'express';
import { isRealFirestore } from '../config/firebase.js';
import { codeforcesQueue } from '../utils/requestQueue.js';

const router = Router();

/**
 * @route   GET /health or /api/health
 * @desc    API server status, uptime, Firestore connection, and queue metrics
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      firestore: isRealFirestore ? 'connected (Google Cloud)' : 'in-memory-fallback',
      rateLimiterQueue: codeforcesQueue.getStats()
    }
  });
});

export default router;
