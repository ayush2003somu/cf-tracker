import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Deterministic fallback diagnostic engine.
 * Generates an accurate DSA coaching assessment when no GEMINI_API_KEY is configured.
 * Guarantees zero friction during local development and testing.
 */
function generateFallbackDiagnosis(handle, profile) {
  const sortedTopics = [...(profile.topicBreakdown || [])];
  
  // Find topics with 0 or very low solves
  const weakTopics = sortedTopics
    .filter(t => t.isCoreDsaTopic)
    .sort((a, b) => a.solvedCount - b.solvedCount)
    .slice(0, 3)
    .map(t => t.topic);

  const topTopics = sortedTopics
    .slice(0, 2)
    .map(t => `${t.topic} (${t.solvedCount} solved)`)
    .join(' and ');

  const avgRating = profile.overallAverageRating || 1200;
  const targetNextRating = avgRating + 200;

  return {
    verdictSummary: `${handle} displays strong problem-solving volume with clear strengths in ${topTopics || 'core topics'}. However, critical gaps in higher-order data structures must be addressed to consistently pass senior technical rounds.`,
    weakestAreas: weakTopics.length > 0 ? weakTopics : ['Dynamic Programming', 'Graphs', 'Disjoint Set Union (DSU)'],
    recommendedRoadmap: [
      `Practice 15-20 problems in ${weakTopics[0] || 'Dynamic Programming'} within the ${targetNextRating - 100}-${targetNextRating} difficulty range.`,
      `Focus on structural pattern recognition in ${weakTopics[1] || 'Graph Traversals'} before attempting hard contest mashups.`,
      `Maintain a weekly rhythm of solving at least 3 problems at your target rating (${targetNextRating}+) without looking at editorial solutions for the first 30 minutes.`
    ],
    generatedBy: 'heuristic-engine (Set GEMINI_API_KEY in .env for live Gemini output)'
  };
}

/**
 * Single-call AI Diagnostic Coach
 * 
 * Feeds ONLY the aggregated summary object into Google Gemini (never individual questions).
 * 
 * @param {string} handle - Candidate handle
 * @param {Object} profile - Aggregated DSA profile from dsaNormalizer
 * @returns {Promise<Object>} - Structured JSON diagnostic
 */
export async function generateAiDiagnosis(handle, profile) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackDiagnosis(handle, profile);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build a compact representation of the profile to minimize tokens and latency
    const summaryPayload = {
      handle,
      totalSolved: profile.totalUniqueSolved,
      overallAverageRating: profile.overallAverageRating,
      overallHighestRating: profile.overallMaxRating,
      topSolvedTopics: profile.topicBreakdown.slice(0, 5).map(t => ({
        topic: t.topic,
        solved: t.solvedCount,
        avgRating: t.averageRating,
        maxRating: t.maxRating
      })),
      leastPracticedTopics: profile.topicBreakdown
        .filter(t => t.isCoreDsaTopic)
        .slice(-5)
        .map(t => ({
          topic: t.topic,
          solved: t.solvedCount,
          avgRating: t.averageRating
        }))
    };

    const prompt = `You are a Principal Software Engineer and elite competitive programming coach.
Analyze this Codeforces candidate's aggregated DSA profile summary:
${JSON.stringify(summaryPayload, null, 2)}

Provide an objective, actionable technical assessment.
You MUST return ONLY a JSON object with this exact structure:
{
  "verdictSummary": "2 clear sentences summarizing their current level and problem-solving maturity for software engineering interviews.",
  "weakestAreas": ["Topic 1", "Topic 2", "Topic 3"],
  "recommendedRoadmap": [
    "Step 1: Specific topic and problem rating bracket to focus on next",
    "Step 2: Key algorithmic pattern or data structure technique to master",
    "Step 3: Concrete practice goal or milestone"
  ]
}`;

    // Use the active high-speed Gemini models with automatic retry on transient 503 spikes
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite-preview'
    ];
    let lastError = null;
    let response = null;
    let successfulModel = null;

    for (const modelName of candidateModels) {
      // Attempt up to 2 times per model with backoff on 503 (high demand) spikes
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          successfulModel = modelName;
          break; // Model succeeded
        } catch (err) {
          lastError = err;
          const is503 = err.status === 503 || err.message?.includes('503') || err.message?.includes('high demand');
          
          if (is503 && attempt === 1) {
            console.log(`[AiService] ⏳ Model ${modelName} experiencing temporary traffic spike (503). Retrying in 1.5s...`);
            await new Promise((res) => setTimeout(res, 1500));
            continue;
          }
          break; // Move to next candidate model
        }
      }

      if (response) {
        break; // Stop iterating models once we have a response
      }
    }

    if (!response) {
      throw lastError || new Error('All Gemini model candidates failed.');
    }

    const rawText = response.text;
    const parsed = JSON.parse(rawText);

    return {
      verdictSummary: parsed.verdictSummary || 'Profile analysis complete.',
      weakestAreas: Array.isArray(parsed.weakestAreas) ? parsed.weakestAreas : [],
      recommendedRoadmap: Array.isArray(parsed.recommendedRoadmap) ? parsed.recommendedRoadmap : [],
      generatedBy: `Google Gemini (${successfulModel})`
    };
  } catch (error) {
    console.warn(`[AiService] Gemini API call failed (${error.message}). Falling back to heuristic diagnosis.`);
    return generateFallbackDiagnosis(handle, profile);
  }
}
