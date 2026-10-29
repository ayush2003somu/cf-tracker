/**
 * Cache-Aside Service for Codeforces Profiles & AI Diagnostics
 * 
 * Pattern: Cache-Aside (Lazy Loading)
 * 1. Read from cache (Firestore `cf_profiles/{handle}`).
 * 2. If present and fresh (< 6 hours), return cached data immediately.
 * 3. If missing or stale (>= 6 hours), trigger fresh fetch + AI generation, then write to cache.
 */

import { db } from '../config/firebase.js';

// Cache expiration window: 6 hours in milliseconds
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 21,600,000 ms
const COLLECTION_NAME = 'cf_profiles';

/**
 * Normalizes handle string for safe document ID storage (case-insensitive)
 */
function getDocKey(handle) {
  return handle.trim().toLowerCase();
}

/**
 * Checks Firestore cache for an existing profile.
 * 
 * @param {string} handle - Codeforces handle
 * @returns {Promise<Object|null>} - Returns cached document if fresh, or null if missing/stale
 */
export async function getCachedProfile(handle) {
  if (!handle) return null;

  try {
    const docKey = getDocKey(handle);
    const docRef = db.collection(COLLECTION_NAME).doc(docKey);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();
    const now = Date.now();
    const ageMs = now - (data.updatedAt || 0);

    // If cache has expired (older than 6 hours), treat as cache miss
    if (ageMs > CACHE_TTL_MS) {
      return null;
    }

    const ageMinutes = Math.round(ageMs / (60 * 1000));

    return {
      ...data,
      isCached: true,
      cacheAgeMinutes: ageMinutes
    };
  } catch (error) {
    console.warn(`[CacheService] Error reading cache for ${handle}:`, error.message);
    // If cache lookup fails, gracefully fall back to fresh fetch
    return null;
  }
}

/**
 * Saves or updates profile metrics and AI diagnostic results to Firestore.
 * 
 * @param {string} handle - Codeforces handle
 * @param {Object} profileData - Normalized DSA profile metrics
 * @param {Object|null} aiDiagnosis - Structured AI coaching diagnosis
 * @returns {Promise<Object>} - The persisted document payload
 */
export async function saveProfileToCache(handle, profileData, aiDiagnosis = null) {
  if (!handle || !profileData) {
    throw new Error('Handle and profileData are required to save to cache.');
  }

  const docKey = getDocKey(handle);
  const payload = {
    handle: handle.trim(),
    updatedAt: Date.now(),
    profile: profileData,
    aiDiagnosis: aiDiagnosis || null
  };

  try {
    const docRef = db.collection(COLLECTION_NAME).doc(docKey);
    await docRef.set(payload);
    return payload;
  } catch (error) {
    console.error(`[CacheService] Failed to write cache for ${handle}:`, error.message);
    // Even if caching fails, return payload so user request succeeds
    return payload;
  }
}
