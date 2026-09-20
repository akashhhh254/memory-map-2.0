import React from 'react';
import { 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Clock, 
  Layers, 
  FolderHeart, 
  Share2, 
  Camera, 
  Heart, 
  Compass,
  CheckCircle,
  EyeOff
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExploreDemo: () => void;
}

export function LandingPage({ onOpenAuth, onExploreDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif-editorial text-xl font-bold tracking-tight text-white block">
                Memory Map
              </span>
              <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase block">
                Your Life, Your Places, Your Memories
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#timeline" className="hover:text-amber-400 transition-colors">Timeline</a>
            <a href="#ai" className="hover:text-amber-400 transition-colors">AI Intelligence</a>
            <a href="#privacy" className="hover:text-amber-400 transition-colors">Privacy</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-stone-800">
        {/* Subtle cartographic grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Cartography Platform</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.15]">
              Turn the Places You Visit Into Memories You Can Relive.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-stone-300 leading-relaxed max-w-2xl mx-auto">
              Memory Map connects your places, people, photos and stories into a personal timeline of your life.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-base shadow-xl shadow-amber-950/50 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Create Your Memory Map</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-stone-200 font-medium text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-amber-400" />
                <span>Explore Live Demo Map</span>
              </button>
            </div>
          </div>

          {/* Floating Memory Cards Visual Mockup */}
          <div className="mt-16 relative rounded-3xl border border-stone-800 bg-stone-950/60 p-4 sm:p-6 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="relative h-[380px] sm:h-[460px] rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center">
              {/* Map Canvas Backing Image */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
                alt="Map Background"
                className="w-full h-full object-cover opacity-25 filter grayscale"
              />

              {/* Memory Pin 1 */}
              <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-pulse">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/50 ring-4 ring-amber-600/20">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>

              {/* Floating Card 1: Nagpur College */}
              <div className="absolute top-12 left-4 sm:left-12 max-w-xs bg-stone-900/95 border border-stone-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md hidden sm:block transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80"
                    alt="Campus"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">First Day at College</h4>
                    <p className="text-xs text-amber-400">Nagpur • July 15, 2025</p>
                  </div>
                </div>
                <p className="text-xs text-stone-300 line-clamp-2">
                  Sudden monsoon rain under the gulmohar trees with Rohan and Ananya.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-400">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>2 friends connected</span>
                </div>
              </div>

              {/* Floating Card 2: Kyoto Blossoms */}
              <div className="absolute bottom-8 right-4 sm:right-12 max-w-xs bg-stone-900/95 border border-stone-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md transform rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=200&q=80"
                    alt="Kyoto"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Philosopher's Path</h4>
                    <p className="text-xs text-amber-400">Kyoto • April 6, 2024</p>
                  </div>
                </div>
                <p className="text-xs text-stone-300 line-clamp-2">
                  Cherry blossoms falling like pink snow along ancient temple stone canals.
                </p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-medium">
                  Peaceful • Travel
                </span>
              </div>

              {/* Center Map Tag */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <div className="px-4 py-1.5 rounded-full bg-stone-950/80 border border-stone-800 text-xs text-stone-300 flex items-center gap-2 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Interactive geographical graph synced in real time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-20 bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-rose-400 tracking-wider uppercase">The Problem</span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
                Photos remain trapped in phone galleries. The stories, people, and emotions disappear.
              </h2>
              <p className="mt-4 text-stone-400 text-base leading-relaxed">
                Over a lifetime, we explore hundreds of cities, viewpoints, cafes, and sacred sanctuaries. But standard camera rolls only show endless disjointed thumbnails. Where were you? Who was laughing by your side? How did that sunset make you feel?
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Scattered Moments Without Context</h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Years later, you see a photo and struggle to remember the date, the place name, or the person who took it.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">No Spatial Memory</h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Our brains remember places through physical geography. Traditional social media strips away the geography of your life.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Visual Showcase */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-900/60 border border-stone-800 relative">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">The Solution</span>
              <h3 className="font-serif-editorial text-2xl font-bold text-white mt-2">
                A Living Personal Memory Graph
              </h3>
              <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                Memory Map transforms a standard cartographic map into your private mental vault. Drop a pin wherever life happened, and attach stories, people, emotions, dates, and full photo albums.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-amber-400 font-serif-editorial text-xl font-bold">1. Pin Location</div>
                  <div className="text-xs text-stone-400 mt-1">Exact coordinates on OpenStreetMap</div>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-amber-400 font-serif-editorial text-xl font-bold">2. Connect People</div>
                  <div className="text-xs text-stone-400 mt-1">Friends, family, and travel partners</div>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-amber-400 font-serif-editorial text-xl font-bold">3. Chronicle Story</div>
                  <div className="text-xs text-stone-400 mt-1">Emotional journals, dates & moods</div>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="text-amber-400 font-serif-editorial text-xl font-bold">4. Relive Visually</div>
                  <div className="text-xs text-stone-400 mt-1">Explore by map, timeline or node graph</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW MEMORY MAP WORKS */}
      <section id="how-it-works" className="py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">User Flow</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white mt-2">
              How Memory Map Works
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              From an unforgettable afternoon to a lifelong spatial archive in three intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-amber-600/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-serif-editorial font-bold text-xl mb-5">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">Select Location</h3>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                Click anywhere on the interactive map or search for any landmark, city, or hidden cafe across the globe.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-amber-600/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-serif-editorial font-bold text-xl mb-5">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">Enrich Your Memory</h3>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                Upload your high-res photos, link the friends who were with you, assign your mood, category, tags, and write the story.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-950/60 border border-stone-800 hover:border-amber-600/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-serif-editorial font-bold text-xl mb-5">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">Explore & Relive</h3>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                Instantly browse your memories on the geographical map, scroll the chronological timeline, or inspect the interactive relationship graph.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES */}
      <section id="features" className="py-20 bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Capabilities</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white mt-2">
              Engineered For Modern Storytellers
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              A comprehensive personal platform designed with warmth, precision, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Interactive Cartography</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Leaflet & OpenStreetMap powered exploration. Zoom, pan, locate your current position, and cluster pins smoothly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Chronological Timeline</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Scroll through your life year by year or month by month. Filter by category, companions, or moods effortlessly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">People Connections</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Track memories associated with family, classmates, and friends. See every place you've shared with a specific person.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <FolderHeart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Curated Collections</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Group memories into personalized albums like "College Life", "Family Trips", "Mountain Escapes", or "Childhood".
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Visual Memory Graph</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Discover unexpected links between places, people, and emotions with an interactive force-directed graph.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">AI Chronicle Engine</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Gemini-powered poetic summaries, automatic tagging, smart categorization, and yearly recap journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TIMELINE & MAP PREVIEW */}
      <section id="timeline" className="py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Timeline Experience</span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white mt-2">
                A Continuous Flow of Your Life's Greatest Chapters
              </h2>
              <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
                Switch effortlessly from the geographical map to the chronological timeline. Revisit your college days in Nagpur, family climbs in Pune, or quiet Himalayan sunrises in Darjeeling.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Sort by newest or oldest memories</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant filters by companion, mood, tag, or location</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Full-bleed photography and narrative previews</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-4">
              {/* Timeline Card Mockup 1 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80"
                  alt="Darjeeling"
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-medium">January 4, 2025</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">Travel</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1">Sunrise Over Kanchenjunga</h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                    Freezing dawn wind at Tiger Hill, Darjeeling with Rohan.
                  </p>
                </div>
              </div>

              {/* Timeline Card Mockup 2 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80"
                  alt="Nagpur"
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-medium">July 15, 2025</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">College</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1">First Day at College</h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                    VNIT Campus rain and meeting Ananya & Rohan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI FEATURES */}
      <section id="ai" className="py-20 bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">AI Intelligence</span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white mt-2">
              Gentle AI That Deepens Your Memories
            </h2>
            <p className="mt-3 text-stone-400 text-sm sm:text-base">
              AI should assist you, never replace you. Every AI-generated summary or tag is presented as an editable suggestion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Memory Summary</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Transforms rough personal notes and photos into an evocative, poetic recap sentence you'll cherish reading years from now.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Smart Auto-Tagging</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Identifies themes like #Monsoon, #Himalayas, #Campus, or #Trekking automatically from your story and location details.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Yearly Memory Recap</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Generates a bespoke annual retrospective: "You visited 14 places, created 32 memories, and shared 11 moments with friends."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIVACY & SECURITY */}
      <section id="privacy" className="py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white">
            Private by Default. Always Yours.
          </h2>
          <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Memories are intensely personal. Every pin you place, photo you upload, and story you write is strictly scoped to your private authenticated account. We never monetize or leak your locations.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
              <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">100% Private Default</div>
              <p className="text-xs text-stone-400 mt-1">No unauthenticated eyes can ever view your memories or routes.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
              <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Full Data Portability</div>
              <p className="text-xs text-stone-400 mt-1">Export your complete memory vault as standard JSON at any time.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
              <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Granular Controls</div>
              <p className="text-xs text-stone-400 mt-1">Mark individual memories as Private, Shared, or Public.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-b from-stone-900 to-stone-950 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-serif-editorial text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to Begin Mapping Your Life's Journey?
          </h2>
          <p className="mt-4 text-stone-300 text-base max-w-xl mx-auto">
            Join thousands of travelers, students, families, and storytellers who are archiving their unforgettable moments.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-base shadow-xl shadow-amber-950/50 transition-all cursor-pointer"
            >
              Create Your Memory Map Now
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-base transition-colors cursor-pointer"
            >
              Explore Sample Account
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="mt-auto bg-stone-950 border-t border-stone-800 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-serif-editorial text-stone-300 font-bold text-sm">
              Memory Map
            </span>
            <span className="text-stone-600">|</span>
            <span>Your Life, Your Places, Your Memories.</span>
          </div>

          <div className="flex items-center gap-6 text-stone-400">
            <button onClick={() => onOpenAuth('login')} className="hover:text-stone-200 cursor-pointer">
              Login
            </button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-stone-200 cursor-pointer">
              Sign Up
            </button>
            <button onClick={onExploreDemo} className="hover:text-stone-200 cursor-pointer">
              Demo
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} Memory Map. Crafted for thoughtful explorers.
          </div>
        </div>
      </footer>
    </div>
  );
}
