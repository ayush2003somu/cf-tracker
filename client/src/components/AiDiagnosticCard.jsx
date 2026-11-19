import React from 'react';
import { AlertTriangle, Compass, CheckSquare } from 'lucide-react';

export default function AiDiagnosticCard({ aiDiagnosis }) {
  if (!aiDiagnosis) return null;

  const { verdictSummary, weakestAreas = [], recommendedRoadmap = [] } = aiDiagnosis;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Performance Review
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Diagnostic Summary
        </span>
      </div>

      <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <span className="font-semibold text-slate-200">Assessment: </span>
        {verdictSummary}
      </div>

      {weakestAreas.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Priority Improvement Areas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {weakestAreas.map((area, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {recommendedRoadmap.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <Compass className="h-3.5 w-3.5" />
            <span>Recommended Next Steps:</span>
          </div>

          <div className="space-y-2">
            {recommendedRoadmap.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/60"
              >
                <span className="font-mono text-blue-400 font-bold mt-0.5">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
