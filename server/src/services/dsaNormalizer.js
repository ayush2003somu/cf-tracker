import { TAG_TO_DSA_MAP, STANDARD_DSA_TOPICS, TOPIC_METADATA } from '../constants/dsaTopics.js';

/**
 * Calculates DSA Interview Readiness Index (0-100) and detects topic gaps.
 * 
 * Formula rationale (Explainable Heuristic):
 * 1. Breadth Coverage (40%): Fraction of core 13 DSA topics with >= 5 problems solved.
 *    - Solving 0-4 problems in a topic is statistically insufficient for interview pattern retention.
 * 2. Depth Mastery (40%): Overall average rating normalized against 1600 benchmark (solid SWE medium/hard).
 *    - If average is 1600+, candidate scores 100 on depth.
 * 3. Volume Consistency (20%): Total unique solves normalized against 120 problems target.
 * 
 * Topic Classification:
 * - CRITICAL_GAP: Solved < 5 problems (high interview failure risk)
 * - DEVELOPING: Solved >= 5 problems, but average rating is below (candidate avg - 100) or below 1200
 * - PROFICIENT: Solved >= 15 problems with rating on par or above average
 */
export function calculateGapAnalysis(topicBreakdown, totalUniqueSolved, overallAverageRating) {
  const coreTopics = topicBreakdown.filter(t => t.isCoreDsaTopic);
  const totalCore = coreTopics.length || STANDARD_DSA_TOPICS.length;

  // 1. Breadth: Topics with >= 5 solves
  const coveredTopicsCount = coreTopics.filter(t => t.solvedCount >= 5).length;
  const breadthScore = Math.min(100, Math.round((coveredTopicsCount / totalCore) * 100));

  // 2. Depth: Benchmarked against 1600 rating
  const avgRating = overallAverageRating || 1000;
  const depthScore = Math.min(100, Math.round((avgRating / 1600) * 100));

  // 3. Volume: Benchmarked against 120 unique solves
  const volumeScore = Math.min(100, Math.round((totalUniqueSolved / 120) * 100));

  // Weighted Readiness Index
  const readinessScore = Math.round((breadthScore * 0.40) + (depthScore * 0.40) + (volumeScore * 0.20));

  let readinessTier = 'Early Stage (Fundamental Focus)';
  if (readinessScore >= 80) readinessTier = 'Interview Ready (Advanced)';
  else if (readinessScore >= 55) readinessTier = 'Competitive Intermediate';

  // Topic classification and targeted practice recommendations
  let criticalGapsCount = 0;
  let developingCount = 0;
  let proficientCount = 0;

  const topicsAnalysis = coreTopics.map((topicStat) => {
    const meta = TOPIC_METADATA[topicStat.topic] || { cfTag: 'implementation', keyPatterns: 'General patterns' };
    let status = 'PROFICIENT';

    if (topicStat.solvedCount < 5) {
      status = 'CRITICAL_GAP';
      criticalGapsCount++;
    } else if (
      topicStat.solvedCount < 15 || 
      (topicStat.averageRating !== null && topicStat.averageRating < Math.max(1200, avgRating - 100))
    ) {
      status = 'DEVELOPING';
      developingCount++;
    } else {
      proficientCount++;
    }

    // Recommended target difficulty bracket for this topic
    const baseTarget = avgRating ? Math.round(avgRating / 100) * 100 : 1200;
    const lowerBracket = Math.max(800, baseTarget - 100);
    const upperBracket = baseTarget + 200;
    const targetRatingBracket = `${lowerBracket}-${upperBracket}`;

    // Direct Codeforces problemset filter URL
    const practiceUrl = `https://codeforces.com/problemset?tags=${encodeURIComponent(meta.cfTag)}`;

    return {
      topic: topicStat.topic,
      status, // 'CRITICAL_GAP' | 'DEVELOPING' | 'PROFICIENT'
      solvedCount: topicStat.solvedCount,
      averageRating: topicStat.averageRating,
      maxRating: topicStat.maxRating,
      cfTag: meta.cfTag,
      keyPatterns: meta.keyPatterns,
      targetRatingBracket,
      practiceUrl
    };
  });

  // Sort so CRITICAL_GAP appears first, then DEVELOPING, then PROFICIENT
  const statusOrder = { 'CRITICAL_GAP': 0, 'DEVELOPING': 1, 'PROFICIENT': 2 };
  topicsAnalysis.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.solvedCount - b.solvedCount);

  return {
    readinessScore,
    readinessTier,
    scoreBreakdown: {
      breadthScore,
      depthScore,
      volumeScore
    },
    criticalGapsCount,
    developingCount,
    proficientCount,
    topicsAnalysis
  };
}

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

  // 4. CALCULATE DSA GAP ANALYSIS & READINESS INDEX (Sprint 6 Feature)
  const gapAnalysis = calculateGapAnalysis(
    topicBreakdown,
    uniqueSolvedMap.size,
    overallAverageRating
  );

  return {
    totalSubmissions: submissions.length,
    totalUniqueSolved: uniqueSolvedMap.size,
    totalRatedSolved: totalRatedSolves,
    overallAverageRating,
    overallMaxRating: overallMaxRating > 0 ? overallMaxRating : null,
    topicBreakdown,
    gapAnalysis
  };
}
