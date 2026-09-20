import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavTab } from './components/Navigation/Sidebar';
import { MobileNav } from './components/Navigation/MobileNav';
import { Navbar } from './components/Navigation/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthModal } from './components/Auth/AuthModal';
import { Dashboard } from './pages/Dashboard';
import { MemoryMap } from './components/Map/MemoryMap';
import { TimelinePage } from './pages/TimelinePage';
import { MemoriesListPage } from './pages/MemoriesListPage';
import { PeoplePage } from './pages/PeoplePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { MemoryGraphPage } from './pages/MemoryGraphPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddMemoryModal } from './components/Memory/AddMemoryModal';
import { MemoryDetailModal } from './components/Memory/MemoryDetailModal';
import { Memory, Person, Collection, MemoryStats } from './types';
import { api } from './services/api';
import { 
  X, 
  MapPin, 
  Compass, 
  Clock, 
  Users, 
  FolderHeart, 
  Share2, 
  Sparkles, 
  Settings, 
  LogOut,
  Layers,
  Loader2
} from 'lucide-react';

const PROTECTED_ROUTES: Record<string, NavTab> = {
  '/dashboard': 'dashboard',
  '/map': 'map',
  '/timeline': 'timeline',
  '/memories': 'memories',
  '/people': 'people',
  '/collections': 'collections',
  '/graph': 'graph',
  '/insights': 'insights',
  '/settings': 'settings',
  '/profile': 'settings',
  '/app': 'dashboard',
};

function normalizePath(path: string): string {
  const p = path.toLowerCase().replace(/\/+$/, '') || '/';
  return p;
}

function isProtectedPath(path: string): boolean {
  const norm = normalizePath(path);
  return norm in PROTECTED_ROUTES;
}

function MainApplication() {
  const { user, loading: authLoading, loginAsDemo, logout } = useAuth();

  // URL Path Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => normalizePath(window.location.pathname));
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    const norm = normalizePath(window.location.pathname);
    return PROTECTED_ROUTES[norm] || 'dashboard';
  });

  // App Data State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Active Selections
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [coordsForNewMemory, setCoordsForNewMemory] = useState<{
    lat: number;
    lng: number;
    locationName?: string;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize browser history and popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const norm = normalizePath(window.location.pathname);
      setCurrentPath(norm);
      if (norm in PROTECTED_ROUTES) {
        setCurrentTab(PROTECTED_ROUTES[norm]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected Route Guards and Automated Redirection
  useEffect(() => {
    if (authLoading) return;

    const norm = normalizePath(window.location.pathname);

    // If user is UN-authenticated and attempts to access any protected page
    if (!user) {
      if (isProtectedPath(norm)) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        window.history.replaceState(null, '', redirectUrl);
        setCurrentPath('/login');
      }
    } else {
      // If user IS authenticated and lands on /login, /register, or /forgot
      if (norm === '/login' || norm === '/register' || norm === '/forgot') {
        const params = new URLSearchParams(window.location.search);
        const redirectTarget = params.get('redirect');
        const destination = (redirectTarget && redirectTarget.startsWith('/') && redirectTarget !== '/login') 
          ? redirectTarget 
          : '/dashboard';
        
        window.history.replaceState(null, '', destination);
        setCurrentPath(normalizePath(destination));
        const tab = PROTECTED_ROUTES[normalizePath(destination)] || 'dashboard';
        setCurrentTab(tab);
      } else if (norm in PROTECTED_ROUTES) {
        setCurrentTab(PROTECTED_ROUTES[norm]);
      }
    }
  }, [user, authLoading]);

  // Fetch all user application data when authenticated
  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [memoriesRes, peopleRes, collectionsRes, statsRes] = await Promise.all([
        api.getMemories(),
        api.getPeople(),
        api.getCollections(),
        api.getStats().catch(() => null),
      ]);
      setMemories(memoriesRes);
      setPeople(peopleRes);
      setCollections(collectionsRes);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error('Failed to load memory data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Handle URL parameters (e.g. ?memory=xyz to open shared memory)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memoryParam = params.get('memory');
    if (memoryParam && memories.length > 0) {
      const target = memories.find((m) => m.id === memoryParam);
      if (target) {
        setSelectedMemory(target);
      }
    }
  }, [memories]);

  // Navigation helpers
  const navigateTo = (path: string, replace = false) => {
    const norm = normalizePath(path);
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(norm);
    if (norm in PROTECTED_ROUTES) {
      setCurrentTab(PROTECTED_ROUTES[norm]);
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    navigateTo(`/${tab}`);
  };

  const handleLogout = async () => {
    await logout();
    setMemories([]);
    setPeople([]);
    setCollections([]);
    setSelectedMemory(null);
    window.history.replaceState(null, '', '/login');
    setCurrentPath('/login');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    navigateTo(mode === 'register' ? '/register' : '/login');
  };

  const handleExploreDemo = async () => {
    await loginAsDemo();
    navigateTo('/dashboard', true);
  };

  const handleOpenAddMemory = (coords?: { lat: number; lng: number; locationName?: string }) => {
    setEditingMemory(null);
    setCoordsForNewMemory(coords || null);
    setIsAddMemoryOpen(true);
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setCoordsForNewMemory(null);
    setIsAddMemoryOpen(true);
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (selectedMemory?.id === id) setSelectedMemory(null);
    } catch (err) {
      alert('Failed to delete memory.');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const mem = memories.find((m) => m.id === id);
    if (!mem) return;
    const updatedFav = !mem.isFavorite;

    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: updatedFav } : m))
    );
    if (selectedMemory?.id === id) {
      setSelectedMemory({ ...selectedMemory, isFavorite: updatedFav });
    }

    try {
      await api.updateMemory(id, { isFavorite: updatedFav });
    } catch (err) {
      console.warn('Failed to sync favorite toggle:', err);
    }
  };

  const handleMemorySaved = (saved: Memory) => {
    setMemories((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? saved : m));
      } else {
        return [saved, ...prev];
      }
    });
    fetchData();
  };

  // 1. If initializing authentication session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-stone-300">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white mb-4 animate-pulse shadow-lg shadow-amber-950">
          <Compass className="w-6 h-6" />
        </div>
        <p className="font-serif-editorial text-xl font-semibold text-white">
          Loading Memory Map...
        </p>
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin mt-3" />
      </div>
    );
  }

  // 2. Unauthenticated Routes
  if (!user) {
    // Dedicated Login / Register / Forgot Password Page
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot') {
      return (
        <LoginPage
          initialMode={currentPath === '/register' ? 'register' : currentPath === '/forgot' ? 'forgot' : 'login'}
          onSuccessRedirect={(dest) => navigateTo(dest, true)}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // Default Landing Page for root '/' or any unauthenticated public view
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExploreDemo={handleExploreDemo}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onNavigateToFullLoginPage={() => {
            setIsAuthModalOpen(false);
            navigateTo('/login');
          }}
        />
      </>
    );
  }

  // 3. Authenticated Application Shell (Protected Area)
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900 font-sans selection:bg-amber-600 selection:text-white">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAddMemory={() => handleOpenAddMemory()}
        memoriesCount={memories.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Navbar */}
        <Navbar
          onOpenAddMemory={() => handleOpenAddMemory()}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSearchSelect={(memory) => {
            setSelectedMemory(memory);
            handleSelectTab('map');
          }}
          allMemories={memories}
        />

        {/* Protected Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
              onOpenAddMemory={() => handleOpenAddMemory()}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'map' && (
            <div className="w-full h-[calc(100vh-61px)]">
              <MemoryMap
                memories={memories}
                onSelectMemory={(m) => setSelectedMemory(m)}
                onAddMemoryAtCoords={(coords) => handleOpenAddMemory(coords)}
                selectedMemoryId={selectedMemory?.id}
              />
            </div>
          )}

          {currentTab === 'timeline' && (
            <TimelinePage
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
              onOpenAddMemory={() => handleOpenAddMemory()}
            />
          )}

          {currentTab === 'memories' && (
            <MemoriesListPage
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
              onOpenAddMemory={() => handleOpenAddMemory()}
            />
          )}

          {currentTab === 'people' && (
            <PeoplePage
              people={people}
              memories={memories}
              onRefreshPeople={fetchData}
              onSelectMemory={(m) => setSelectedMemory(m)}
            />
          )}

          {currentTab === 'collections' && (
            <CollectionsPage
              collections={collections}
              memories={memories}
              onRefreshCollections={fetchData}
              onSelectMemory={(m) => setSelectedMemory(m)}
            />
          )}

          {currentTab === 'graph' && (
            <MemoryGraphPage
              memories={memories}
              people={people}
              collections={collections}
              onSelectMemory={(m) => setSelectedMemory(m)}
            />
          )}

          {currentTab === 'insights' && (
            <InsightsPage
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage onDataReset={fetchData} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAddMemory={() => handleOpenAddMemory()}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Menu Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-72 bg-stone-900 h-full p-6 text-stone-200 flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-serif-editorial font-bold text-white text-base">
                    Memory Map
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Compass },
                  { id: 'map' as NavTab, label: 'Memory Map', icon: MapPin },
                  { id: 'timeline' as NavTab, label: 'Timeline', icon: Clock },
                  { id: 'memories' as NavTab, label: 'All Memories', icon: Layers },
                  { id: 'people' as NavTab, label: 'People Connections', icon: Users },
                  { id: 'collections' as NavTab, label: 'Collections', icon: FolderHeart },
                  { id: 'graph' as NavTab, label: 'Memory Graph', icon: Share2 },
                  { id: 'insights' as NavTab, label: 'AI Insights', icon: Sparkles },
                  { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSelectTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onMemoryCreated={handleMemorySaved}
        initialCoords={coordsForNewMemory}
        existingMemory={editingMemory}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        allMemories={memories}
        onClose={() => setSelectedMemory(null)}
        onEdit={(m) => {
          setSelectedMemory(null);
          handleEditMemory(m);
        }}
        onDelete={handleDeleteMemory}
        onToggleFavorite={handleToggleFavorite}
        onSelectMemory={(m) => setSelectedMemory(m)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
