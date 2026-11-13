import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import OverviewCards from './components/OverviewCards';
import TopicBreakdown from './components/TopicBreakdown';
import AiDiagnosticCard from './components/AiDiagnosticCard';
import GapAnalysisCard from './components/GapAnalysisCard';
import LoadingState from './components/LoadingState';
import ErrorBanner from './components/ErrorBanner';
import { fetchUserProfile, checkBackendHealth } from './services/api';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [searchedHandle, setSearchedHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [cacheMeta, setCacheMeta] = useState(null);

  // Check backend server health on mount
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendOnline(res.status === 'online');
    });
  }, []);

  // Main search handler
  const handleSearch = async (handle, forceRefresh = false) => {
    setError(null);
    setIsLoading(true);
    setSearchedHandle(handle);

    try {
      const response = await fetchUserProfile(handle, forceRefresh);
      setProfileData(response.data.profile);
      setAiDiagnosis(response.data.aiDiagnosis);
      setCacheMeta({
        source: response.source,
        cacheAgeMinutes: response.data.cacheAgeMinutes,
        updatedAt: response.data.updatedAt,
      });
      // Also update backend health status
      setBackendOnline(true);
    } catch (err) {
      setError(err.message);
      setProfileData(null);
      setAiDiagnosis(null);
      setCacheMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar backendOnline={backendOnline} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Section */}
        <section className="text-center space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Codeforces DSA Profile & Gap Analyzer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Analyze submissions, map competitive tags into standard DSA categories, and generate targeted coaching roadmaps.
            </p>
          </div>

          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            currentHandle={searchedHandle}
          />
        </section>

        {/* Error Alert */}
        {error && <ErrorBanner message={error} />}

        {/* Loading Indicator */}
        {isLoading && <LoadingState handle={searchedHandle} />}

        {/* Analyzed Profile View */}
        {!isLoading && profileData && (
          <div className="space-y-6">
            {/* 1. Overview Metrics & Cache Details */}
            <OverviewCards
              handle={searchedHandle}
              profile={profileData}
              cacheMeta={cacheMeta}
            />

            {/* 2. Resume-Booster Feature: DSA Gap Analysis & Readiness Engine */}
            {profileData.gapAnalysis && (
              <GapAnalysisCard gapAnalysis={profileData.gapAnalysis} />
            )}

            {/* 3. Grid Layout: Left is Topic Breakdown, Right is AI Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Topics Breakdown Table (spans 2 columns on desktop) */}
              <div className="lg:col-span-2">
                <TopicBreakdown topics={profileData.topicBreakdown} />
              </div>

              {/* Single-call AI Diagnostic Coach Card */}
              <div className="lg:col-span-1">
                <AiDiagnosticCard aiDiagnosis={aiDiagnosis} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Quick Help */}
        {!isLoading && !profileData && !error && (
          <div className="border border-dashed border-slate-800 rounded-lg p-10 text-center text-slate-500 text-xs space-y-2 max-w-md mx-auto">
            <p className="font-medium text-slate-400">No profile analyzed yet.</p>
            <p>
              Type a Codeforces handle above or click a preset like{' '}
              <button
                type="button"
                onClick={() => handleSearch('tourist')}
                className="text-blue-400 hover:underline font-mono"
              >
                tourist
              </button>{' '}
              to inspect solved topics and AI diagnostics.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Codeforces DSA Profile & Gap Analyzer • Built with Node.js, Express, Firestore, and React
      </footer>
    </div>
  );
}
