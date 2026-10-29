/**
 * Unified Profile Orchestration Service
 * 
 * Implements the Cache-Aside architecture:
 * 1. Checks Firestore cache (`cf_profiles/{handle}`) for fresh data (< 6 hours).
 * 2. On cache hit: returns cached profile & AI diagnosis immediately (0 API calls, ~5-20ms).
 * 3. On cache miss:
 *    - Enqueues Codeforces API request (enforcing 2.1s throttler delay).
 *    - Normalizes raw submissions into standardized DSA buckets.
 *    - Runs a single-call Google Gemini AI diagnostic evaluation.
 *    - Persists profile + AI diagnosis to Firestore for subsequent visits.
 */

import { fetchUserSubmissions } from './codeforcesService.js';
import { normalizeUserSubmissions } from './dsaNormalizer.js';
import { generateAiDiagnosis } from './aiService.js';
import { getCachedProfile, saveProfileToCache } from './cacheService.js';

/**
 * Retrieves the full DSA profile and AI diagnosis for a Codeforces handle,
 * utilizing the Cache-Aside pattern.
 * 
 * @param {string} handle - Codeforces username
 * @param {boolean} [forceRefresh=false] - Optional flag to bypass cache
 * @returns {Promise<Object>} - Aggregated profile, AI diagnosis, and metadata
 */
export async function getProfileWithDiagnosis(handle, forceRefresh = false) {
  if (!handle || typeof handle !== 'string' || handle.trim() === '') {
    throw new Error('Please provide a valid Codeforces handle.');
  }

  const cleanHandle = handle.trim();

  // 1. CACHE LOOKUP (Cache-Aside pattern)
  if (!forceRefresh) {
    const cached = await getCachedProfile(cleanHandle);
    if (cached) {
      return {
        handle: cached.handle,
        updatedAt: cached.updatedAt,
        cacheAgeMinutes: cached.cacheAgeMinutes,
        source: 'CACHE_HIT',
        profile: cached.profile,
        aiDiagnosis: cached.aiDiagnosis
      };
    }
  }

  // 2. CACHE MISS: Queued fetch + Normalization + AI Analysis
  console.log(`[ProfileService] Cache miss for "${cleanHandle}". Initiating queued fetch and AI analysis...`);

  // Outbound call is throttled through the 2.1s request queue
  const rawSubmissions = await fetchUserSubmissions(cleanHandle);

  // Normalize into standard DSA categories
  const normalizedProfile = normalizeUserSubmissions(rawSubmissions);

  // Single-call AI diagnosis using aggregated metrics
  const aiDiagnosis = await generateAiDiagnosis(cleanHandle, normalizedProfile);

  // 3. CACHE WRITE: Persist combined data to Firestore
  const savedDoc = await saveProfileToCache(cleanHandle, normalizedProfile, aiDiagnosis);

  return {
    handle: savedDoc.handle,
    updatedAt: savedDoc.updatedAt,
    cacheAgeMinutes: 0,
    source: 'FRESH_FETCH_CACHED',
    profile: normalizedProfile,
    aiDiagnosis
  };
}
