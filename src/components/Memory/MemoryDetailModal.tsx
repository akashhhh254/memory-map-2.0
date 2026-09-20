import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Lock, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Heart,
  Tag
} from 'lucide-react';
import { Memory } from '../../types';

interface MemoryDetailModalProps {
  memory: Memory | null;
  allMemories: Memory[];
  onClose: () => void;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectMemory: (memory: Memory) => void;
}

export function MemoryDetailModal({
  memory,
  allMemories,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectMemory,
}: MemoryDetailModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!memory) return null;

  const photos = memory.photos && memory.photos.length > 0
    ? memory.photos
    : memory.coverPhoto
    ? [memory.coverPhoto]
    : [];

  // Find memories geographically near this place (within ~150km or same city name)
  const nearbyMemories = allMemories.filter((m) => {
    if (m.id === memory.id) return false;
    const latDiff = Math.abs(m.latitude - memory.latitude);
    const lngDiff = Math.abs(m.longitude - memory.longitude);
    const isClose = latDiff < 1.0 && lngDiff < 1.0;
    const sameCity = memory.locationName.split(',')[0].trim().toLowerCase() === m.locationName.split(',')[0].trim().toLowerCase();
    return isClose || sameCity;
  }).slice(0, 3);

  // Find memories around the same year/month
  const memoryDate = new Date(memory.date);
  const temporalMemories = allMemories.filter((m) => {
    if (m.id === memory.id) return false;
    const otherDate = new Date(m.date);
    return Math.abs(otherDate.getTime() - memoryDate.getTime()) < 1000 * 60 * 60 * 24 * 90; // within 90 days
  }).slice(0, 3);

  const handleShare = () => {
    const url = window.location.origin + `?memory=${memory.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 text-stone-900 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(memory.id)}
            title="Toggle favorite"
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
              memory.isFavorite
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-stone-900/60 text-white hover:bg-stone-900/80'
            }`}
          >
            <Star className={`w-4 h-4 ${memory.isFavorite ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            title="Share memory"
            className="p-2.5 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(memory)}
            title="Edit memory"
            className="p-2.5 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this memory?')) {
                onDelete(memory.id);
                onClose();
              }
            }}
            title="Delete memory"
            className="p-2.5 rounded-full bg-stone-900/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Photo Banner */}
        <div className="relative h-64 sm:h-80 bg-stone-900 shrink-0 overflow-hidden">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[activePhotoIndex]}
                alt={memory.title}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent pointer-events-none" />

              {/* Photo navigation arrows */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                    className="p-1.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white font-mono px-2 py-0.5 rounded-full bg-stone-900/70 backdrop-blur-sm">
                    {activePhotoIndex + 1}/{photos.length}
                  </span>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                    className="p-1.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-500">
              <MapPin className="w-12 h-12 text-stone-700" />
            </div>
          )}

          {/* Location & Title Overlay */}
          <div className="absolute bottom-4 left-6 right-20 text-white z-10 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600/90 text-white text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                {memory.category}
              </span>
              {memory.mood && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-sm">
                  {memory.mood}
                </span>
              )}
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow">
              {memory.title}
            </h1>
          </div>
        </div>

        {copied && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 text-center font-medium">
            Memory share link copied to clipboard!
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 text-xs sm:text-sm text-stone-600">
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{memory.locationName}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-stone-500">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{memory.date}</span>
                {memory.time && <span>at {memory.time}</span>}
              </div>

              <div className="flex items-center gap-1 text-stone-500">
                {memory.privacy === 'private' ? (
                  <span className="flex items-center gap-1 text-stone-500">
                    <Lock className="w-3.5 h-3.5" /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Globe className="w-3.5 h-3.5" /> Public
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Chronicle Summary Card */}
          {memory.aiSummary && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Memory Chronicle</span>
              </div>
              <p className="font-serif-editorial text-sm sm:text-base text-stone-800 italic leading-relaxed">
                "{memory.aiSummary}"
              </p>
            </div>
          )}

          {/* Narrative Story */}
          <div>
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              The Story
            </h3>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line font-sans">
              {memory.description || 'No story provided.'}
            </p>
          </div>

          {/* Connected People */}
          {memory.people && memory.people.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                Connected People
              </h3>
              <div className="flex flex-wrap gap-2">
                {memory.people.map((person, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {person.charAt(0)}
                    </div>
                    <span>{person}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {memory.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {memory.notes && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
              <span className="font-bold text-stone-700 block mb-1">Personal Notes:</span>
              <p className="italic">{memory.notes}</p>
            </div>
          )}

          {/* Photo Gallery Thumbnails */}
          {photos.length > 1 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Photo Gallery ({photos.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePhotoIndex(i);
                      setIsLightboxOpen(true);
                    }}
                    className={`rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      activePhotoIndex === i ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-200'
                    }`}
                  >
                    <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Discovery: Nearby Memories & Temporal Memories */}
          {(nearbyMemories.length > 0 || temporalMemories.length > 0) && (
            <div className="pt-4 border-t border-stone-100 space-y-4">
              {nearbyMemories.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Other Memories Near This Place
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {nearbyMemories.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onSelectMemory(m)}
                        className="p-3 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-stone-900 truncate">{m.title}</p>
                        <p className="text-[10px] text-amber-700 truncate">{m.locationName}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{m.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox full-screen view */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-stone-300 p-2 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={photos[activePhotoIndex]}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
