import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState Component
 * 
 * Informs the user of the backend data processing pipeline.
 */
export default function LoadingState({ handle }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-3 max-w-md mx-auto">
      <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
      <div className="text-sm font-semibold text-slate-200">
        Analyzing <span className="font-mono text-blue-400">"{handle}"</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
        Fetching submissions from Codeforces API, filtering non-AC verdicts, mapping tags into standard DSA buckets, and checking Firestore cache...
      </p>
    </div>
  );
}
