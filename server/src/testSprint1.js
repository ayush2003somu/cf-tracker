import { fetchUserSubmissions } from './services/codeforcesService.js';
import { normalizeUserSubmissions } from './services/dsaNormalizer.js';

/**
 * Sprint 1 Local Test Runner
 * 
 * Tests the complete flow:
 * 1. Fetching raw Codeforces submission data via API
 * 2. Filtering out failed attempts (WA, TLE, etc.)
 * 3. Deduplicating repeated solves of the same problem
 * 4. Normalizing tags into standardized DSA categories
 * 5. Calculating topic mastery metrics
 * 
 * Usage:
 *   node src/testSprint1.js <handle>
 * Example:
 *   node src/testSprint1.js tourist
 */

async function runSprint1Test() {
  const handle = process.argv[2] || 'tourist';

  console.log('='.repeat(65));
  console.log(`🚀 SPRINT 1 TEST: Codeforces Fetch + Deduplication + DSA Normalizer`);
  console.log(`👤 Target Handle: "${handle}"`);
  console.log('='.repeat(65));

  try {
    console.log('\n[1/3] 📡 Fetching submissions from Codeforces REST API...');
    const startTime = Date.now();
    const rawSubmissions = await fetchUserSubmissions(handle);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`      ✅ Successfully fetched ${rawSubmissions.length} submissions in ${duration}s.`);

    console.log('\n[2/3] ⚙️  Normalizing submissions and mapping to DSA categories...');
    const profile = normalizeUserSubmissions(rawSubmissions);

    console.log('\n[3/3] 📊 Profile Summary & Topic Mastery:');
    console.log('-'.repeat(65));
    console.log(`  • Total Raw Submissions : ${profile.totalSubmissions}`);
    console.log(`  • Unique Problems Solved: ${profile.totalUniqueSolved}`);
    console.log(`  • Rated Problems Solved : ${profile.totalRatedSolved}`);
    console.log(`  • Overall Average Rating: ${profile.overallAverageRating ?? 'N/A'}`);
    console.log(`  • Overall Highest Rating: ${profile.overallMaxRating ?? 'N/A'}`);
    console.log('-'.repeat(65));

    console.log('\n📋 Standard DSA Topics Breakdown (Top 10):');
    console.log('-----------------------------------------------------------------');
    console.log('| DSA Topic                      | Solved | Avg Rating | Max Rating |');
    console.log('-----------------------------------------------------------------');

    const topTopics = profile.topicBreakdown.slice(0, 10);
    for (const t of topTopics) {
      const topicName = t.topic.padEnd(30, ' ');
      const solved = String(t.solvedCount).padStart(6, ' ');
      const avg = String(t.averageRating ?? '-').padStart(10, ' ');
      const max = String(t.maxRating ?? '-').padStart(10, ' ');
      console.log(`| ${topicName} | ${solved} | ${avg} | ${max} |`);
    }
    console.log('-----------------------------------------------------------------');

    // Quick Unit Test Assertion on Deduplication
    console.log('\n🧪 Running Quick Unit Verification on Deduplication Logic:');
    const mockSubmissions = [
      { id: 1, verdict: 'WRONG_ANSWER', problem: { contestId: 100, index: 'A', name: 'Prob A', tags: ['dp'] } },
      { id: 2, verdict: 'OK', problem: { contestId: 100, index: 'A', name: 'Prob A', rating: 1200, tags: ['dp'] } },
      { id: 3, verdict: 'OK', problem: { contestId: 100, index: 'A', name: 'Prob A', rating: 1200, tags: ['dp'] } }, // duplicate OK
      { id: 4, verdict: 'OK', problem: { contestId: 100, index: 'B', name: 'Prob B', rating: 1400, tags: ['graphs', 'dfs and similar'] } }
    ];

    const mockResult = normalizeUserSubmissions(mockSubmissions);
    if (mockResult.totalUniqueSolved === 2) {
      console.log('  ✅ Deduplication check passed: 4 submissions reduced to 2 unique solves.');
    } else {
      console.error(`  ❌ Deduplication check failed: Expected 2, got ${mockResult.totalUniqueSolved}`);
    }

    const dpStat = mockResult.topicBreakdown.find(t => t.topic === 'Dynamic Programming');
    const graphStat = mockResult.topicBreakdown.find(t => t.topic === 'Graphs');
    if (dpStat && dpStat.solvedCount === 1 && graphStat && graphStat.solvedCount === 1) {
      console.log('  ✅ Tag mapping check passed: Mapped "dp" and "graphs" accurately.');
    } else {
      console.error('  ❌ Tag mapping check failed.');
    }

    console.log('\n✨ SPRINT 1 TEST COMPLETED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

runSprint1Test();
