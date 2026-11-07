import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Displays title, tagline, and backend status indicator.
 */
export default function Navbar({ backendOnline }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            CF
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Codeforces DSA Profile
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                AI Coach
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Tag Normalization, Mastery Metrics & Gap Detection
            </p>
          </div>
        </div>

        {/* Live Backend Status Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              backendOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400 font-medium hidden sm:inline">
            {backendOnline ? 'Server Online (Port 5001)' : 'Server Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
