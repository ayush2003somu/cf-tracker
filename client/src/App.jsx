import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { checkBackendHealth } from './services/api';
import { Search, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendOnline(res.status === 'online');
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        {/* Sprint 4 Welcome Hero */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Sprint 4 Architecture Initialized Successfully
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
          Level Up Your Codeforces{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            DSA Mastery
          </span>
        </h2>

        <p className="mt-4 text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
          Normalize fragmented Codeforces tags into standardized interview categories, track topic ratings, and unlock single-call AI diagnostic roadmaps.
        </p>

        {/* Status Card */}
        <div className="mt-8 p-6 rounded-xl bg-slate-900 border border-slate-800 text-left w-full max-w-md shadow-xl shadow-black/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3 mb-3">
            <Terminal className="h-4 w-4 text-blue-400" />
            Stack Verification Status
          </div>
          <ul className="text-xs space-y-2 text-slate-300">
            <li className="flex items-center justify-between">
              <span>⚡ Build Tool:</span>
              <span className="font-mono text-blue-400">Vite + React</span>
            </li>
            <li className="flex items-center justify-between">
              <span>🎨 Styling Engine:</span>
              <span className="font-mono text-indigo-400">Tailwind CSS (Dark Theme)</span>
            </li>
            <li className="flex items-center justify-between">
              <span>📡 Vite API Proxy:</span>
              <span className="font-mono text-emerald-400">/api ➔ :5001</span>
            </li>
            <li className="flex items-center justify-between">
              <span>🏥 Backend Server:</span>
              <span className={`font-mono ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {backendOnline ? 'Connected' : 'Waiting for npm run dev in /server'}
              </span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Codeforces DSA Profile & Gap Analyzer • Full-Stack Portfolio Architecture
      </footer>
    </div>
  );
}
