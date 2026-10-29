import { getProfileWithDiagnosis } from '../services/profileService.js';

/**
 * Controller to handle Codeforces profile and AI diagnosis requests.
 * 
 * Route: GET /api/profile/:handle?refresh=true
 */
export async function getProfile(req, res, next) {
  try {
    const { handle } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    const cleanHandle = handle ? handle.trim() : '';

    // Defensive validation
    if (!cleanHandle) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid Codeforces handle parameter.'
      });
    }

    // Check for placeholder text or invalid characters
    if (cleanHandle.startsWith(':') || !/^[a-zA-Z0-9_.-]{1,24}$/.test(cleanHandle)) {
      return res.status(400).json({
        success: false,
        error: `Invalid handle "${cleanHandle}". Please replace ":handle" with a real Codeforces username (e.g. /api/profile/tourist). Handles can only contain letters, numbers, underscores, and dashes.`
      });
    }

    const result = await getProfileWithDiagnosis(cleanHandle, forceRefresh);

    return res.status(200).json({
      success: true,
      source: result.source,
      data: {
        handle: result.handle,
        updatedAt: result.updatedAt,
        cacheAgeMinutes: result.cacheAgeMinutes,
        profile: result.profile,
        aiDiagnosis: result.aiDiagnosis
      }
    });
  } catch (error) {
    // Gracefully map specific error types to client HTTP status codes
    if (error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('Field should contain') || error.message.includes('only Latin letters')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Forward unexpected exceptions to global error handling middleware
    next(error);
  }
}
