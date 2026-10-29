import { TAG_TO_DSA_MAP, STANDARD_DSA_TOPICS } from '../constants/dsaTopics.js';

/**
 * Normalizes raw Codeforces submissions into unique solved problems
 * and groups them into standard Data Structures & Algorithms (DSA) categories.
 * 
 * @param {Array} submissions - Raw submission list from Codeforces user.status API
 * @returns {Object} - Processed profile summary with topic breakdowns and mastery metrics
 */
export function normalizeUserSubmissions(submissions) {
  if (!Array.isArray(submissions)) {
    throw new Error('Expected submissions to be an array.');
  }

  // Map to store unique solved problems: key -> problem details
  const uniqueSolvedMap = new Map();

  // 1. DEDUPLICATION & VERDICT FILTERING
  for (const sub of submissions) {
    // Only accept successful solutions
    if (sub.verdict !== 'OK' || !sub.problem) {
      continue;
    }

    // A problem is uniquely identified by contestId + index (e.g., "1800-A")
    // Fallback to problem name if contestId is missing (e.g., custom gym problems)
    const problemKey = sub.problem.contestId 
      ? `${sub.problem.contestId}-${sub.problem.index}`
      : sub.problem.name;

    // Deduplicate: If we already recorded this problem, keep the first one encountered (or latest)
    if (!uniqueSolvedMap.has(problemKey)) {
      uniqueSolvedMap.set(problemKey, {
        id: problemKey,
        name: sub.problem.name,
        contestId: sub.problem.contestId || null,
        index: sub.problem.index || null,
        rating: typeof sub.problem.rating === 'number' ? sub.problem.rating : null,
        tags: Array.isArray(sub.problem.tags) ? sub.problem.tags : [],
        solvedAt: sub.creationTimeSeconds
      });
    }
  }

  // 2. TOPIC GROUPING & METRIC CALCULATION
  // Map of topicName -> { solvedCount, ratings: [], problems: [] }
  const topicStatsMap = new Map();

  // Initialize all standard DSA topics with 0 solves so candidates see gaps immediately
  for (const topic of STANDARD_DSA_TOPICS) {
    topicStatsMap.set(topic, {
      topic,
      solvedCount: 0,
      ratings: [],
      maxRating: 0,
      problems: []
    });
  }

  let totalRatedSolves = 0;
  let ratingSum = 0;
  let overallMaxRating = 0;

  for (const problem of uniqueSolvedMap.values()) {
    // Track overall rating statistics
    if (problem.rating !== null) {
      totalRatedSolves++;
      ratingSum += problem.rating;
      if (problem.rating > overallMaxRating) {
        overallMaxRating = problem.rating;
      }
    }

    // Deduplicate mapped categories for this single problem
    // (e.g. if a problem has tags 'math' and 'number theory', both map to 'Math & Number Theory' - count once!)
    const matchedTopicsForProblem = new Set();

    for (const tag of problem.tags) {
      const normalizedTag = tag.trim().toLowerCase();
      const standardTopic = TAG_TO_DSA_MAP[normalizedTag];

      if (standardTopic) {
        matchedTopicsForProblem.add(standardTopic);
      }
    }

    // If no tags matched any known category, assign to 'General / Other'
    if (matchedTopicsForProblem.size === 0) {
      matchedTopicsForProblem.add('General / Other');
    }

    // Add problem to each matched topic
    for (const topic of matchedTopicsForProblem) {
      if (!topicStatsMap.has(topic)) {
        topicStatsMap.set(topic, {
          topic,
          solvedCount: 0,
          ratings: [],
          maxRating: 0,
          problems: []
        });
      }

      const stat = topicStatsMap.get(topic);
      stat.solvedCount += 1;
      stat.problems.push({
        id: problem.id,
        name: problem.name,
        rating: problem.rating
      });

      if (problem.rating !== null) {
        stat.ratings.push(problem.rating);
        if (problem.rating > stat.maxRating) {
          stat.maxRating = problem.rating;
        }
      }
    }
  }

  // 3. COMPILE FINAL TOPIC METRICS
  const topicBreakdown = Array.from(topicStatsMap.values()).map((stat) => {
    const avgRating = stat.ratings.length > 0
      ? Math.round(stat.ratings.reduce((acc, curr) => acc + curr, 0) / stat.ratings.length)
      : null;

    return {
      topic: stat.topic,
      solvedCount: stat.solvedCount,
      averageRating: avgRating,
      maxRating: stat.maxRating > 0 ? stat.maxRating : null,
      isCoreDsaTopic: STANDARD_DSA_TOPICS.includes(stat.topic)
    };
  });

  // Sort topics: Core topics with highest solved count first
  topicBreakdown.sort((a, b) => b.solvedCount - a.solvedCount);

  const overallAverageRating = totalRatedSolves > 0
    ? Math.round(ratingSum / totalRatedSolves)
    : null;

  return {
    totalSubmissions: submissions.length,
    totalUniqueSolved: uniqueSolvedMap.size,
    totalRatedSolved: totalRatedSolves,
    overallAverageRating,
    overallMaxRating: overallMaxRating > 0 ? overallMaxRating : null,
    topicBreakdown
  };
}
