import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  X, 
  Plus, 
  ChevronRight,
  Filter,
  Lock,
  Globe
} from 'lucide-react';
import { Memory } from '../types';

interface MemoriesListPageProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onOpenAddMemory: () => void;
}

export function MemoriesListPage({
  memories,
  onSelectMemory,
  onOpenAddMemory,
}: MemoriesListPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Travel', 'College', 'Childhood', 'Family', 'Friends', 'Milestone', 'Nature'];

  const filtered = memories.filter((m) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.locationName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCategory !== 'All' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              All Memories ({memories.length})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse and manage your entire digital memory collection.
          </p>
        </div>

        <button
          onClick={onOpenAddMemory}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories, locations, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === c
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or List of Memories */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <p className="text-stone-500 text-sm italic">No memories found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMemory(m)}
              className="group rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
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
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-sm text-[10px] text-amber-300 font-semibold">
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
                    <span className="truncate">with {m.people.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
