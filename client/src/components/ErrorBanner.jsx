import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorBanner Component
 * 
 * Displays clean error messages (e.g. invalid handle, network errors).
 */
export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2.5">
      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
      <span>{message}</span>
    </div>
  );
}
