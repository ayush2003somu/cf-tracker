import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, Clock, ExternalLink, Zap, ChevronRight } from 'lucide-react';

/**
 * Helper to get status badge styles
 */
function getStatusBadge(status) {
  switch (status) {
    case 'CRITICAL_GAP':
      return {
        label: 'Critical Gap',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500',
        cardBorder: 'border-rose-900/40 bg-slate-900/90'
      };
    case 'DEVELOPING':
      return {
        label: 'Developing',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        cardBorder: 'border-amber-900/30 bg-slate-900/90'
      };
    default:
      return {
        label: 'Proficient',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        cardBorder: 'border-slate-800 bg-slate-900/60'
      };
  }
}

/**
 * GapAnalysisCard Component (Sprint 6 Resume-Booster Feature)
 * 
 * Computes and renders:
 * - Mathematical Interview Readiness Index (0-100) with breadth, depth, and volume sub-scores.
 * - Gap classification (Critical, Developing, Proficient).
 * - Actionable Codeforces practice links with targeted rating brackets.
 */
export default function GapAnalysisCard({ gapAnalysis }) {
  const [filter, setFilter] = useState('GAPS_ONLY'); // 'ALL' | 'GAPS_ONLY' | 'CRITICAL_ONLY'

  if (!gapAnalysis) return null;

  const {
    readinessScore,
    readinessTier,
    scoreBreakdown,
    criticalGapsCount,
    developingCount,
    proficientCount,
    topicsAnalysis = []
  } = gapAnalysis;

  // Filter topics
  const displayedTopics = topicsAnalysis.filter((item) => {
    if (filter === 'CRITICAL_ONLY') return item.status === 'CRITICAL_GAP';
    if (filter === 'GAPS_ONLY') return item.status === 'CRITICAL_GAP' || item.status === 'DEVELOPING';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      {/* 1. Header & Readiness Score Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              DSA Gap Analysis & Interview Readiness
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Algorithmic evaluation across 13 core technical interview categories based on topic breadth, rating depth, and volume.
          </p>
        </div>

        {/* Readiness Index Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-lg border border-slate-800 self-start md:self-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Readiness Score
            </div>
            <div className="text-xs text-blue-400 font-medium mt-0.5">
              {readinessTier}
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white pl-3 border-l border-slate-800">
            {readinessScore}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-metrics & Gap Tally */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Breadth Coverage */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Topic Breadth</span>
            <span className="font-mono text-slate-200">{scoreBreakdown.breadthScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scoreBreakdown.breadthScore}%` }} />
          </div>
          <div className="text-[11px] text-slate-500">Core topics with &ge; 5 solves</div>
        </div>

        {/* Rating Depth */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Rating Depth</span>
            <span className="font-mono text-slate-200">{scoreBreakdown.depthScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${scoreBreakdown.depthScore}%` }} />
          </div>
          <div className="text-[11px] text-slate-500">Normalized vs 1600 SWE target</div>
        </div>

        {/* Practice Volume */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Practice Volume</span>
            <span className="font-mono text-slate-200">{scoreBreakdown.volumeScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scoreBreakdown.volumeScore}%` }} />
          </div>
          <div className="text-[11px] text-slate-500">Unique solves vs 120 target</div>
        </div>
      </div>

      {/* 3. Filter Controls & Gap Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
            {criticalGapsCount} Critical Gaps
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            {developingCount} Developing
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {proficientCount} Proficient
          </span>
        </div>

        {/* View Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg text-xs self-start sm:self-auto border border-slate-800">
          <button
            type="button"
            onClick={() => setFilter('GAPS_ONLY')}
            className={`px-2.5 py-1 rounded transition font-medium ${
              filter === 'GAPS_ONLY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gaps Only ({criticalGapsCount + developingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CRITICAL_ONLY')}
            className={`px-2.5 py-1 rounded transition font-medium ${
              filter === 'CRITICAL_ONLY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical Only ({criticalGapsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded transition font-medium ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Core (13)
          </button>
        </div>
      </div>

      {/* 4. Actionable Topic Gap Cards */}
      <div className="space-y-2.5">
        {displayedTopics.map((topicItem) => {
          const badge = getStatusBadge(topicItem.status);

          return (
            <div
              key={topicItem.topic}
              className={`p-3.5 rounded-lg border transition ${badge.cardBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                  <span className="text-sm font-semibold text-slate-100">
                    {topicItem.topic}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Key Patterns & Target */}
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Focus: <span className="text-slate-300">{topicItem.keyPatterns}</span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span>
                    Target: <span className="font-mono text-blue-400">{topicItem.targetRatingBracket}</span>
                  </span>
                </div>
              </div>

              {/* Stats & Practice Action Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right text-xs font-mono">
                  <div className="text-slate-200 font-semibold">{topicItem.solvedCount} solved</div>
                  <div className="text-[11px] text-slate-500">
                    Avg {topicItem.averageRating ?? 'N/A'}
                  </div>
                </div>

                <a
                  href={topicItem.practiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition"
                >
                  <span>Practice</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>
            </div>
          );
        })}

        {displayedTopics.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
            No topics match the selected gap filter.
          </div>
        )}
      </div>
    </div>
  );
}
