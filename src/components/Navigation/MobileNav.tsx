import React from 'react';
import { Compass, Map as MapIcon, Clock, Users, Plus, Menu } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddMemory: () => void;
  onOpenMobileMenu: () => void;
}

export function MobileNav({
  currentTab,
  onSelectTab,
  onOpenAddMemory,
  onOpenMobileMenu,
}: MobileNavProps) {
  const items = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: Compass },
    { id: 'map' as NavTab, label: 'Map', icon: MapIcon },
    { id: 'timeline' as NavTab, label: 'Timeline', icon: Clock },
    { id: 'people' as NavTab, label: 'People', icon: Users },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-3 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Center Add Button */}
        <button
          onClick={onOpenAddMemory}
          className="flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-full bg-amber-600 text-white shadow-lg shadow-amber-950/50 border-2 border-stone-900 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* More Menu */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
