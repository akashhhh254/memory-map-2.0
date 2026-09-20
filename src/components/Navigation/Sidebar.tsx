import React from 'react';
import { 
  Compass, 
  Map as MapIcon, 
  Clock, 
  Users, 
  FolderHeart, 
  Sparkles, 
  Share2, 
  Settings, 
  PlusCircle, 
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'map' 
  | 'timeline' 
  | 'memories' 
  | 'people' 
  | 'collections' 
  | 'graph'
  | 'insights' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddMemory: () => void;
  memoriesCount: number;
}

export function Sidebar({ currentTab, onSelectTab, onOpenAddMemory, memoriesCount }: SidebarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Compass },
    { id: 'map' as NavTab, label: 'Memory Map', icon: MapIcon, highlight: true },
    { id: 'timeline' as NavTab, label: 'Timeline', icon: Clock },
    { id: 'memories' as NavTab, label: 'All Memories', icon: Layers, badge: memoriesCount },
    { id: 'people' as NavTab, label: 'People', icon: Users },
    { id: 'collections' as NavTab, label: 'Collections', icon: FolderHeart },
    { id: 'graph' as NavTab, label: 'Memory Graph', icon: Share2 },
    { id: 'insights' as NavTab, label: 'AI Insights', icon: Sparkles },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await logout();
    window.history.replaceState(null, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 h-screen sticky top-0 border-r border-stone-800 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
            <MapIcon className="w-5 h-5 text-stone-100" />
          </div>
          <div>
            <span className="font-serif-editorial text-xl font-bold tracking-tight text-stone-100 block">
              Memory Map
            </span>
            <span className="text-[11px] text-amber-400 font-medium tracking-wide uppercase">
              Your Life In Places
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={onOpenAddMemory}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm shadow-md shadow-amber-950/40 transition-all active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Memory</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
          Explore
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-600/15 text-amber-400 border border-amber-600/30'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-stone-800/80 bg-stone-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-stone-800/40 border border-stone-800">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-stone-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-200 truncate">
                {user?.name || 'Explorer'}
              </p>
              <p className="text-[10px] text-stone-400 truncate">
                {user?.email || 'Logged In'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Log out"
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
