import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Calendar, 
  Heart, 
  Layers, 
  Users, 
  MapPin, 
  Loader2, 
  TrendingUp, 
  Lightbulb, 
  Share2 
} from 'lucide-react';
import { Memory } from '../types';
import { api } from '../services/api';

interface InsightsPageProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
}

export function InsightsPage({ memories, onSelectMemory }: InsightsPageProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [recapData, setRecapData] = useState<{
    recapTitle: string;
    recapStory: string;
    highlights: string[];
  } | null>(null);
  const [loadingRecap, setLoadingRecap] = useState(false);

  const [aiConnections, setAiConnections] = useState<string[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Calculate Category Breakdown
  const categoryCounts = memories.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate Mood Spectrum
  const moodCounts = memories.reduce((acc, m) => {
    const mood = m.mood || 'Joyful';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGenerateRecap = async () => {
    setLoadingRecap(true);
    try {
      const res = await api.aiRecap(selectedYear);
      setRecapData(res);
    } catch (err) {
      console.error('Failed to generate AI recap:', err);
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleGenerateConnections = async () => {
    setLoadingConnections(true);
    try {
      const res = await api.aiConnections();
      setAiConnections(res.insights || []);
    } catch (err) {
      console.error('Failed to analyze connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    // Initial fetch of connections insights
    handleGenerateConnections();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            AI Chronicles & Insights
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Intelligent patterns, yearly recaps, and emotional connections powered by Google Gemini.
        </p>
      </div>

      {/* Hero Section: Yearly Memory Journey Generator */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Year in Review</span>
          </div>

          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold">
            Relive Your Journey in {selectedYear}
          </h2>

          <p className="text-stone-300 text-sm mt-2 leading-relaxed">
            Gemini synthesizes all your coordinates, companions, and photo stories into an evocative annual memoir.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs sm:text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="2026">Year 2026</option>
              <option value="2025">Year 2025</option>
              <option value="2024">Year 2024</option>
              <option value="2023">Year 2023</option>
            </select>

            <button
              onClick={handleGenerateRecap}
              disabled={loadingRecap}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingRecap ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{loadingRecap ? 'Synthesizing Journey...' : 'Generate Annual Chronicle'}</span>
            </button>
          </div>
        </div>

        {/* Generated Annual Chronicle Output */}
        {recapData && (
          <div className="mt-8 pt-6 border-t border-stone-800 space-y-4 animate-in slide-in-from-bottom-2">
            <div className="p-6 rounded-2xl bg-stone-800/60 border border-amber-500/30">
              <h3 className="font-serif-editorial text-xl font-bold text-amber-300">
                {recapData.recapTitle}
              </h3>
              <p className="font-serif-editorial italic text-stone-200 text-sm sm:text-base mt-2 leading-relaxed whitespace-pre-line">
                "{recapData.recapStory}"
              </p>
            </div>

            {recapData.highlights && recapData.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recapData.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/80 text-xs text-stone-300"
                  >
                    <span className="text-amber-400 font-bold block mb-1">Highlight #{i + 1}</span>
                    {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: Memory Connections & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gemini Memory Connections */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
                Thematic Connections
              </h3>
            </div>
            <button
              onClick={handleGenerateConnections}
              disabled={loadingConnections}
              className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              {loadingConnections ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Gemini reads across your locations and narratives to spot recurring motifs, companions, and emotional threads.
          </p>

          <div className="space-y-3">
            {aiConnections.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 italic">
                Gathering connections across your memory graph...
              </div>
            ) : (
              aiConnections.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-stone-800 leading-relaxed flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{insight}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visual Category & Mood Spectrum */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif-editorial text-lg font-bold text-stone-900 mb-1">
              Category Distribution
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Where your life's chapters have centered most.
            </p>

            <div className="space-y-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / memories.length) * 100) || 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span>{cat}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="font-serif-editorial text-lg font-bold text-stone-900 mb-1">
              Mood Spectrum
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(moodCounts).map(([m, count]) => (
                <div
                  key={m}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-amber-600" />
                  <span>{m}:</span>
                  <strong className="text-stone-900">{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
