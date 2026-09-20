import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  MapPin, 
  Menu, 
  Sparkles, 
  Compass,
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Memory } from '../../types';

interface NavbarProps {
  onOpenAddMemory: () => void;
  onOpenMobileMenu: () => void;
  onSearchSelect: (memory: Memory) => void;
  allMemories: Memory[];
}

export function Navbar({
  onOpenAddMemory,
  onOpenMobileMenu,
  onSearchSelect,
  allMemories,
}: NavbarProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = query.trim()
    ? allMemories.filter((m) => {
        const q = query.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.locationName.toLowerCase().includes(q) ||
          m.people?.some((p) => p.toLowerCase().includes(q)) ||
          m.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu toggle + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Instant Search */}
        <div className="relative w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search memories, places, people, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-100/80 border border-stone-200/80 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isFocused && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 z-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-stone-500 text-center italic">
                  No memories found for "{query}"
                </div>
              ) : (
                searchResults.map((m) => (
                  <button
                    key={m.id}
                    onMouseDown={() => {
                      onSearchSelect(m);
                      setQuery('');
                      setIsFocused(false);
                    }}
                    className="w-full p-3 text-left hover:bg-amber-50 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    {m.coverPhoto && (
                      <img
                        src={m.coverPhoto}
                        alt={m.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{m.title}</p>
                      <p className="text-[10px] text-amber-700 truncate">{m.locationName}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0">{m.date}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenAddMemory}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Memory</span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
          />
          <span className="text-xs font-bold text-stone-800 hidden lg:inline">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
