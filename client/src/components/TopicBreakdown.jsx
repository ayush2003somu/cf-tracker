import React, { useState } from 'react';
import { Filter, BarChart2 } from 'lucide-react';

/**
 * TopicBreakdown Component
 * 
 * Displays the core normalized DSA topic distribution, average ratings,
 * and peak difficulty ratings. Supports filtering between Core DSA topics vs All topics.
 */
export default function TopicBreakdown({ topics }) {
  const [filterCoreOnly, setFilterCoreOnly] = useState(true);

  if (!topics || topics.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-400 text-sm">
        No topic data available.
      </div>
    );
  }

  // Filter topics
  const displayedTopics = filterCoreOnly
    ? topics.filter((t) => t.isCoreDsaTopic)
    : topics;

  // Find max solved count among topics to scale progress bars relatively
  const maxSolved = Math.max(...displayedTopics.map((t) => t.solvedCount), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header with Filter Toggle */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            DSA Topic Mastery Breakdown
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            ({displayedTopics.length} topics)
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterCoreOnly(true)}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              filterCoreOnly
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core DSA
          </button>
          <button
            type="button"
            onClick={() => setFilterCoreOnly(false)}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              !filterCoreOnly
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
        </div>
      </div>

      {/* Topics Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4">Topic</th>
              <th className="py-2.5 px-4 text-right">Solved</th>
              <th className="py-2.5 px-4 text-right">Avg Rating</th>
              <th className="py-2.5 px-4 text-right">Peak Rating</th>
              <th className="py-2.5 px-4 hidden sm:table-cell w-36">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {displayedTopics.map((item) => {
              const percentage = Math.round((item.solvedCount / maxSolved) * 100);

              return (
                <tr key={item.topic} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                    {item.topic}
                    {item.isCoreDsaTopic && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans font-normal">
                        Core
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-100 font-semibold">
                    {item.solvedCount}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-300">
                    {item.averageRating ?? '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-300">
                    {item.maxRating ?? '-'}
                  </td>
                  {/* Relative Volume Progress Bar */}
                  <td className="py-2.5 px-4 hidden sm:table-cell align-middle">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
