/**
 * Codeforces API Service
 * 
 * Fetches user submission history from the official Codeforces REST API.
 * Uses an asynchronous queue to enforce a 2.1-second rate-limiting cooldown.
 * Endpoint: https://codeforces.com/api/user.status?handle={handle}
 */

import { codeforcesQueue } from '../utils/requestQueue.js';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

/**
 * Direct HTTP request to the Codeforces API (un-throttled).
 * Used internally by the request queue.
 * 
 * @param {string} handle - Codeforces username
 * @returns {Promise<Array>} - List of raw submission objects
 */
export async function fetchUserSubmissionsDirect(handle) {
  if (!handle || typeof handle !== 'string' || handle.trim() === '') {
    throw new Error('Please provide a valid Codeforces handle.');
  }

  const cleanHandle = handle.trim();
  const targetUrl = `${CODEFORCES_API_BASE}/user.status?handle=${encodeURIComponent(cleanHandle)}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      const errorMessage = data.comment || 'Failed to fetch data from Codeforces.';
      if (errorMessage.toLowerCase().includes('not found')) {
        throw new Error(`Codeforces handle "${cleanHandle}" was not found.`);
      }
      throw new Error(`Codeforces API Error: ${errorMessage}`);
    }

    return data.result;
  } catch (error) {
    if (error.message.startsWith('Codeforces handle') || error.message.startsWith('Codeforces API Error')) {
      throw error;
    }
    throw new Error(`Network error while reaching Codeforces API: ${error.message}`);
  }
}

/**
 * Queued fetch for Codeforces submissions.
 * Automatically queues the request behind any other pending requests and
 * enforces a minimum 2.1-second delay between outgoing calls.
 * 
 * @param {string} handle - Codeforces username
 * @returns {Promise<Array>} - Raw submissions
 */
export async function fetchUserSubmissions(handle) {
  return codeforcesQueue.enqueue(() => fetchUserSubmissionsDirect(handle));
}
