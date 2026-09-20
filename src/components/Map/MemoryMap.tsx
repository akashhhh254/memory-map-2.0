import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Memory } from '../../types';
import { 
  Search, 
  MapPin, 
  Layers, 
  Plus, 
  Crosshair, 
  Sparkles, 
  Users, 
  Calendar, 
  ChevronRight, 
  X, 
  Loader2 
} from 'lucide-react';

interface MemoryMapProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onAddMemoryAtCoords: (coords: { lat: number; lng: number; locationName?: string }) => void;
  selectedMemoryId?: string | null;
}

export function MemoryMap({
  memories,
  onSelectMemory,
  onAddMemoryAtCoords,
  selectedMemoryId,
}: MemoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tileMode, setTileMode] = useState<'voyager' | 'standard' | 'dark'>('voyager');
  const [selectedPreviewMemory, setSelectedPreviewMemory] = useState<Memory | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center near central India / global center
    const initialLat = memories[0]?.latitude || 21.1458;
    const initialLng = memories[0]?.longitude || 79.0882;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: memories.length > 0 ? 5 : 4,
      zoomControl: false,
    });

    // Custom Zoom controls placed bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer
    const tileUrl =
      tileMode === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : tileMode === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors & CARTO',
    }).addTo(map);

    // Click handler to drop a pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onAddMemoryAtCoords({ lat, lng });
    });

    const markersGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer if tileMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      tileMode === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : tileMode === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors & CARTO',
    }).addTo(map);
  }, [tileMode]);

  // Render memory markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const filtered = memories.filter((m) => {
      if (selectedCategory !== 'All' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      return true;
    });

    filtered.forEach((memory) => {
      // Choose pin badge color based on category
      const isSelected = selectedMemoryId === memory.id;
      const cover = memory.coverPhoto || (memory.photos && memory.photos[0]) || '';

      const customIcon = L.divIcon({
        className: 'custom-memory-marker',
        html: `
          <div class="relative group cursor-pointer animate-pin-drop">
            <div class="w-10 h-10 rounded-2xl overflow-hidden border-2 ${
              isSelected ? 'border-amber-400 ring-4 ring-amber-400/40 scale-110' : 'border-white'
            } shadow-lg shadow-black/30 bg-stone-900 transition-transform transform hover:scale-115">
              ${
                cover
                  ? `<img src="${cover}" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs">★</div>`
              }
            </div>
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r border-b border-stone-300"></div>
          </div>
        `,
        iconSize: [40, 44],
        iconAnchor: [20, 44],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([memory.latitude, memory.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPreviewMemory(memory);
      });

      markersGroup.addLayer(marker);
    });

    // Auto fit bounds if memories exist
    if (filtered.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(filtered.map((m) => [m.latitude, m.longitude]));
      // Only fit bounds if multiple points or user has not manually interacted heavily
      if (filtered.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
      }
    }
  }, [memories, selectedCategory, selectedMemoryId]);

  // Center map on specific memory if selected externally
  useEffect(() => {
    if (selectedMemoryId && mapInstanceRef.current) {
      const target = memories.find((m) => m.id === selectedMemoryId);
      if (target) {
        mapInstanceRef.current.flyTo([target.latitude, target.longitude], 12, {
          duration: 1.2,
        });
        setSelectedPreviewMemory(target);
      }
    }
  }, [selectedMemoryId, memories]);

  // Search geocoding via OpenStreetMap Nominatim
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
    }
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  // Locate user position
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
          }
        },
        (err) => {
          alert('Could not access your location. Please check browser permissions.');
        }
      );
    }
  };

  const categories = ['All', 'Travel', 'College', 'Childhood', 'Family', 'Friends', 'Milestone', 'Nature'];

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden flex flex-col">
      {/* Top Floating Controls: Search & Category Pills */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80 pointer-events-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search location (e.g. Kyoto, Paris, Pune)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-medium border border-stone-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 z-30">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {res.display_name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      {res.display_name}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-800 p-1 shadow-lg scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map Action Floating Buttons: Locate, Tiles, Drop Pin */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          title="Find my location"
          className="w-10 h-10 rounded-2xl bg-white text-stone-800 border border-stone-200 shadow-lg flex items-center justify-center hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            const modes: ('voyager' | 'standard' | 'dark')[] = ['voyager', 'standard', 'dark'];
            const next = modes[(modes.indexOf(tileMode) + 1) % modes.length];
            setTileMode(next);
          }}
          title={`Map style: ${tileMode}`}
          className="w-10 h-10 rounded-2xl bg-white text-stone-800 border border-stone-200 shadow-lg flex items-center justify-center hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            // Drop memory at map center
            if (mapInstanceRef.current) {
              const center = mapInstanceRef.current.getCenter();
              onAddMemoryAtCoords({ lat: center.lat, lng: center.lng });
            }
          }}
          title="Add memory at current view center"
          className="w-10 h-10 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-900/30 flex items-center justify-center hover:bg-amber-500 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Instruction Badge */}
      <div className="absolute top-20 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-300 text-xs border border-stone-800 shadow pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-amber-400" />
        <span>Click anywhere on the map to pin a new memory</span>
      </div>

      {/* The Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Selected Memory Bottom Preview Card */}
      {selectedPreviewMemory && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setSelectedPreviewMemory(null)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row">
            {selectedPreviewMemory.coverPhoto && (
              <div className="sm:w-40 h-36 sm:h-auto shrink-0 relative">
                <img
                  src={selectedPreviewMemory.coverPhoto}
                  alt={selectedPreviewMemory.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-sm text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  {selectedPreviewMemory.category}
                </span>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mb-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedPreviewMemory.locationName}</span>
                </div>

                <h3 className="font-serif-editorial text-base font-bold text-stone-900 line-clamp-1">
                  {selectedPreviewMemory.title}
                </h3>

                <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                  {selectedPreviewMemory.aiSummary || selectedPreviewMemory.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {selectedPreviewMemory.date}
                  </span>
                  {selectedPreviewMemory.people?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-400" />
                      {selectedPreviewMemory.people.length} connected
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                  {selectedPreviewMemory.mood && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {selectedPreviewMemory.mood}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectMemory(selectedPreviewMemory)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View Memory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
