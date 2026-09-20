import React from 'react';
import { 
  MapPin, 
  Compass, 
  Clock, 
  Users, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Star, 
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { Memory, MemoryStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../components/Navigation/Sidebar';

interface DashboardProps {
  stats: MemoryStats | null;
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onOpenAddMemory: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export function Dashboard({
  stats,
  memories,
  onSelectMemory,
  onOpenAddMemory,
  onNavigateTab,
}: DashboardProps) {
  const { user } = useAuth();

  const latestMemory = memories[0] || null;
  const favoriteMemories = memories.filter((m) => m.isFavorite);
  const recentMemories = memories.slice(0, 6);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 sm:p-10 text-white overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Personal Cartography Vault</span>
          </div>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2 leading-relaxed">
            You've pinned <span className="text-amber-400 font-semibold">{stats?.totalPlaces || memories.length} places</span> and chronicled <span className="text-amber-400 font-semibold">{stats?.totalMemories || memories.length} moments</span> across your life.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenAddMemory}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Memory</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Explore Interactive Map</span>
            </button>
            <button
              onClick={() => onNavigateTab('insights')}
              className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Annual Recap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-serif-editorial text-stone-900">
              {stats?.totalMemories ?? memories.length}
            </p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total Memories
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-serif-editorial text-stone-900">
              {stats?.totalPlaces ?? 0}
            </p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Places Pinned
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-serif-editorial text-stone-900">
              {stats?.peopleConnected ?? 0}
            </p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              People Connected
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-serif-editorial text-stone-900">
              {stats?.memoriesThisYear ?? 0}
            </p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Memories In 2026
            </p>
          </div>
        </div>
      </div>

      {/* Showcase: Latest Memory Feature Banner */}
      {latestMemory && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-editorial text-xl font-bold text-stone-900">
              Latest Chronicle
            </h2>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div 
            onClick={() => onSelectMemory(latestMemory)}
            className="group rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row"
          >
            {latestMemory.coverPhoto && (
              <div className="md:w-2/5 h-64 md:h-auto shrink-0 relative overflow-hidden bg-stone-900">
                <img
                  src={latestMemory.coverPhoto}
                  alt={latestMemory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {latestMemory.category}
                </span>
              </div>
            )}

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{latestMemory.locationName}</span>
                  <span>•</span>
                  <span>{latestMemory.date}</span>
                </div>

                <h3 className="font-serif-editorial text-2xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  {latestMemory.title}
                </h3>

                {latestMemory.aiSummary ? (
                  <p className="font-serif-editorial italic text-stone-700 text-sm mt-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    "{latestMemory.aiSummary}"
                  </p>
                ) : (
                  <p className="text-stone-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                    {latestMemory.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  {latestMemory.people && latestMemory.people.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {latestMemory.people.join(', ')}
                    </span>
                  )}
                  {latestMemory.mood && (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                      {latestMemory.mood}
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Memory Story & Photos →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Places Grid */}
      {favoriteMemories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-serif-editorial text-xl font-bold text-stone-900">
              Cherished Favorites
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteMemories.slice(0, 3).map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMemory(m)}
                className="group rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                {m.coverPhoto && (
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={m.coverPhoto}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                      {m.category}
                    </span>
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-amber-700 truncate">
                      {m.locationName}
                    </p>
                    <h4 className="font-serif-editorial text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors mt-0.5 truncate">
                      {m.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {m.aiSummary || m.description}
                    </p>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-3">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Memories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-editorial text-xl font-bold text-stone-900">
            Recent Memories
          </h2>
          <button
            onClick={() => onNavigateTab('memories')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({memories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMemory(m)}
              className="group rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {m.coverPhoto && (
                <div className="h-44 overflow-hidden relative bg-stone-100">
                  <img
                    src={m.coverPhoto}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {m.isFavorite && (
                      <span className="p-1 rounded-full bg-amber-500 text-white shadow">
                        <Star className="w-3 h-3 fill-white" />
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-sm text-[10px] text-amber-300 font-medium">
                    {m.category}
                  </span>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mb-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{m.locationName}</span>
                  </div>

                  <h3 className="font-serif-editorial text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {m.title}
                  </h3>

                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {m.aiSummary || m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{m.date}</span>
                  {m.people?.length > 0 && (
                    <span>with {m.people[0]}{m.people.length > 1 ? ` +${m.people.length - 1}` : ''}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
