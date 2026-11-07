/**
 * API Service for Codeforces DSA Profile & AI Diagnostics
 * 
 * Uses native fetch with defensive error handling.
 * In development, requests to /api are proxied by Vite to http://localhost:5001.
 * In production, requests use VITE_API_BASE_URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetches user profile analytics, DSA breakdown, and AI coaching roadmap.
 * 
 * @param {string} handle - Codeforces handle
 * @param {boolean} [forceRefresh=false] - Optional flag to bypass 6-hour cache
 * @returns {Promise<Object>} - Server response data payload
 */
export async function fetchUserProfile(handle, forceRefresh = false) {
  if (!handle || typeof handle !== 'string' || !handle.trim()) {
    throw new Error('Please enter a valid Codeforces handle.');
  }

  const cleanHandle = encodeURIComponent(handle.trim());
  const url = `${API_BASE}/api/profile/${cleanHandle}${forceRefresh ? '?refresh=true' : ''}`;

  try {
    const res = await fetch(url);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || `Server responded with status ${res.status}`);
    }

    return result;
  } catch (error) {
    // If it's a network failure (server is offline)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to the backend server. Make sure the server is running on port 5001.');
    }
    throw error;
  }
}

/**
 * Checks backend health and Firestore connection status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'offline' };
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}
