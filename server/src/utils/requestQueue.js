/**
 * In-Memory Asynchronous Request Queue (Throttler)
 * 
 * Codeforces enforces a strict rate limit: maximum 1 request per 2 seconds per IP.
 * Violating this triggers HTTP 429 Too Many Requests or IP bans.
 * 
 * This queue ensures that all outbound calls to the Codeforces API have at least
 * a 2.1-second (2100ms) cooldown between execution starts.
 */

export class RequestQueue {
  /**
   * @param {number} minIntervalMs - Minimum delay between requests in milliseconds (default: 2100ms)
   */
  constructor(minIntervalMs = 2100) {
    this.minIntervalMs = minIntervalMs;
    this.queue = [];
    this.isProcessing = false;
    this.lastRequestTimestamp = 0;
  }

  /**
   * Enqueues an async task and returns a Promise that resolves when the task finishes.
   * 
   * @template T
   * @param {() => Promise<T>} task - Async function to execute
   * @returns {Promise<T>} - Result of the task
   */
  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, enqueuedAt: Date.now() });
      this._processQueue();
    });
  }

  /**
   * Internal queue worker loop.
   * Processes tasks sequentially, enforcing the rate limit cooldown.
   * 
   * @private
   */
  async _processQueue() {
    // If worker is already active or queue is empty, do nothing
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      // Calculate how much time has passed since the last outgoing call
      const now = Date.now();
      const elapsedSinceLast = now - this.lastRequestTimestamp;

      // If less than the cooldown period, sleep for the remaining duration
      if (elapsedSinceLast < this.minIntervalMs) {
        const waitTime = this.minIntervalMs - elapsedSinceLast;
        await new Promise((res) => setTimeout(res, waitTime));
      }

      // Mark the timestamp right before we make the call
      this.lastRequestTimestamp = Date.now();

      try {
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        // Reject the individual request without breaking the queue processor
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Returns current queue diagnostic metrics.
   * Useful for health-check endpoints and logging.
   */
  getStats() {
    return {
      pendingTasks: this.queue.length,
      isProcessing: this.isProcessing,
      lastRequestTimestamp: this.lastRequestTimestamp,
      minIntervalMs: this.minIntervalMs
    };
  }
}

// Global singleton instance for Codeforces API outbound requests
export const codeforcesQueue = new RequestQueue(2100);
