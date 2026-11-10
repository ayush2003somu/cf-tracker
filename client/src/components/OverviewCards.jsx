import React from 'react';
import { ExternalLink, Database, CheckCircle, TrendingUp, Award, Layers } from 'lucide-react';

/**
 * Helper to get Codeforces-like rating color badge
 */
function getRatingColor(rating) {
  if (!rating) return 'text-slate-400';
  if (rating < 1200) return 'text-slate-400'; // Newbie (Gray)
  if (rating < 1400) return 'text-emerald-400'; // Pupil (Green)
  if (rating < 1600) return 'text-cyan-400'; // Specialist (Cyan)
  if (rating < 1900) return 'text-blue-400'; // Expert (Blue)
  if (rating < 2100) return 'text-purple-400'; // Candidate Master (Purple)
  if (rating < 2400) return 'text-amber-400'; // Master (Orange/Yellow)
  return 'text-rose-400'; // Grandmaster+ (Red)
}

/**
 * OverviewCards Component
 * 
 * Displays high-level problem solving metrics and cache freshness metadata.
 */
export default function OverviewCards({ handle, profile, cacheMeta }) {
  const { totalSubmissions, totalUniqueSolved, totalRatedSolved, overallAverageRating, overallMaxRating } = profile;
  const isCached = cacheMeta.source === 'CACHE_HIT';

  return (
    <div className="w-full space-y-4">
      {/* Profile Header & Cache Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{handle}</span>
          <a
            href={`https://codeforces.com/profile/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 transition"
          >
            Codeforces Profile <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Cache Freshness Metadata */}
        <div className="flex items-center gap-1.5 text-xs">
          <Database className="h-3.5 w-3.5 text-slate-400" />
          {isCached ? (
            <span className="text-slate-400">
              Cached <span className="font-medium text-slate-300">{cacheMeta.cacheAgeMinutes}m ago</span> in Firestore
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">Freshly fetched & cached</span>
          )}
        </div>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Unique Solves */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unique Solved</span>
            <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalUniqueSolved.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            From {totalSubmissions.toLocaleString()} submissions
          </div>
        </div>

        {/* Metric 2: Rated Solves */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Rated Solves</span>
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalRatedSolved.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalUniqueSolved > 0 ? Math.round((totalRatedSolved / totalUniqueSolved) * 100) : 0}% with difficulty rating
          </div>
        </div>

        {/* Metric 3: Average Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Difficulty</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${getRatingColor(overallAverageRating)}`}>
            {overallAverageRating ?? 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across all rated solves
          </div>
        </div>

        {/* Metric 4: Peak Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Peak Solved</span>
            <Award className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${getRatingColor(overallMaxRating)}`}>
            {overallMaxRating ?? 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Hardest problem conquered
          </div>
        </div>
      </div>
    </div>
  );
}
