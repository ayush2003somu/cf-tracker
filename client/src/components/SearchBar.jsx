import React, { useState } from 'react';
import { Search, RotateCw } from 'lucide-react';

/**
 * SearchBar Component
 * 
 * Allows users to search any Codeforces handle or click quick-fill presets.
 * Supports a "Force Refresh" button to bypass the 6-hour Firestore cache.
 */
export default function SearchBar({ onSearch, isLoading, currentHandle }) {
  const [handleInput, setHandleInput] = useState('');

  // Quick preset handles popular in the CP community
  const PRESET_HANDLES = ['tourist', 'Errichto', 'Benq', 'Um_nik'];

  const handleSubmit = (e, forceRefresh = false) => {
    if (e) e.preventDefault();
    const clean = handleInput.trim();
    if (!clean) return;
    onSearch(clean, forceRefresh);
  };

  const handlePresetClick = (preset) => {
    setHandleInput(preset);
    onSearch(preset, false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder="Enter Codeforces handle (e.g. tourist, Errichto)..."
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !handleInput.trim()}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>

          {/* Force Refresh Cache button */}
          {currentHandle && (
            <button
              type="button"
              onClick={() => handleSubmit(null, true)}
              disabled={isLoading}
              title="Bypass 6-hour cache and fetch fresh data from Codeforces"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </form>

      {/* Preset Handle Buttons for quick testing */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <span className="text-slate-500">Quick test:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_HANDLES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60 font-mono transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
