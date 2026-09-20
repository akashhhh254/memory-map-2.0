import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Star, 
  X, 
  Tag, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Memory } from '../types';

interface TimelinePageProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onOpenAddMemory: () => void;
}

export function TimelinePage({
  memories,
  onSelectMemory,
  onOpenAddMemory,
}: TimelinePageProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [selectedPerson, setSelectedPerson] = useState<string>('All');

  // Extract unique years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    memories.forEach((m) => {
      if (m.date) {
        years.add(m.date.split('-')[0]);
      }
    });
    return ['All', ...Array.from(years).sort().reverse()];
  }, [memories]);

  // Extract unique categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    memories.forEach((m) => cats.add(m.category));
    return ['All', ...Array.from(cats)];
  }, [memories]);

  // Extract unique people
  const availablePeople = useMemo(() => {
    const ppl = new Set<string>();
    memories.forEach((m) => m.people?.forEach((p) => ppl.add(p)));
    return ['All', ...Array.from(ppl)];
  }, [memories]);

  // Filter & Sort
  const filteredMemories = useMemo(() => {
    return memories
      .filter((m) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchDesc = m.description.toLowerCase().includes(q);
          const matchLoc = m.locationName.toLowerCase().includes(q);
          const matchPeople = m.people?.some((p) => p.toLowerCase().includes(q));
          const matchTags = m.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchLoc && !matchPeople && !matchTags) {
            return false;
          }
        }
        if (selectedCategory !== 'All' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (selectedYear !== 'All' && !m.date.startsWith(selectedYear)) {
          return false;
        }
        if (selectedMood !== 'All' && m.mood?.toLowerCase() !== selectedMood.toLowerCase()) {
          return false;
        }
        if (selectedPerson !== 'All' && !m.people?.includes(selectedPerson)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [memories, searchQuery, selectedCategory, selectedYear, selectedMood, selectedPerson, sortOrder]);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Chronological Timeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Scroll through your life's memorable footprints, ordered in time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <button
            onClick={onOpenAddMemory}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            + Add Memory
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
        {/* Search row */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timeline by memory, city, friends, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </div>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Year: {yr}
              </option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium cursor-pointer"
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* People selector */}
          {availablePeople.length > 1 && (
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium cursor-pointer"
            >
              {availablePeople.map((p) => (
                <option key={p} value={p}>
                  Person: {p}
                </option>
              ))}
            </select>
          )}

          {/* Reset button if filtered */}
          {(selectedCategory !== 'All' || selectedYear !== 'All' || selectedPerson !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedYear('All');
                setSelectedPerson('All');
                setSearchQuery('');
              }}
              className="text-[11px] text-amber-700 hover:underline font-semibold cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Clock className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif-editorial text-lg font-bold text-stone-800">
            No Memories Match Your Filter
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your filters or pin a new memory to expand your life's timeline.
          </p>
          <button
            onClick={onOpenAddMemory}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-500 cursor-pointer"
          >
            Add Memory Here
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8">
          {/* Continuous vertical timeline spine */}
          <div className="absolute top-3 bottom-3 left-2 sm:left-3.5 w-0.5 bg-stone-200" />

          {filteredMemories.map((m, idx) => (
            <div key={m.id} className="relative group">
              {/* Timeline spine pin node */}
              <div className="absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full bg-white border-4 border-amber-600 shadow-sm group-hover:scale-125 transition-transform z-10" />

              {/* Memory Card */}
              <div 
                onClick={() => onSelectMemory(m)}
                className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-4"
              >
                {/* Photo thumbnail if exists */}
                {m.coverPhoto && (
                  <div className="sm:w-48 h-40 sm:h-auto shrink-0 rounded-xl overflow-hidden relative bg-stone-100">
                    <img
                      src={m.coverPhoto}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-sm text-[10px] text-amber-300 font-semibold">
                      {m.category}
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date and Location Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{m.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{m.date}</span>
                        {m.time && <span>• {m.time}</span>}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {m.title}
                    </h3>

                    {/* AI Summary or Description */}
                    {m.aiSummary ? (
                      <p className="font-serif-editorial italic text-stone-700 text-xs sm:text-sm mt-1.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                        "{m.aiSummary}"
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Tags & People */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {m.people && m.people.length > 0 && (
                        <div className="flex items-center gap-1 text-stone-600 text-[11px]">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span>{m.people.join(', ')}</span>
                        </div>
                      )}
                      {m.mood && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium">
                          {m.mood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-amber-700 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
