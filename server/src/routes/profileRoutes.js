import { Router } from 'express';
import { getProfile } from '../controllers/profileController.js';

const router = Router();

/**
 * @route   GET /api/profile/:handle
 * @desc    Get user DSA mastery metrics and AI coaching roadmap
 * @query   refresh=true (optional: forces cache bypass)
 */
router.get('/:handle', getProfile);

export default router;
