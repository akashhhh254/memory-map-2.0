import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Camera, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Plus, 
  Lock, 
  Share2, 
  Globe, 
  Star,
  Tag,
  Smile,
  Loader2
} from 'lucide-react';
import { Memory, MemoryCategory, MemoryMood, PrivacyLevel } from '../../types';
import { api } from '../../services/api';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryCreated: (newMemory: Memory) => void;
  initialCoords?: { lat: number; lng: number; locationName?: string } | null;
  existingMemory?: Memory | null;
}

export function AddMemoryModal({
  isOpen,
  onClose,
  onMemoryCreated,
  initialCoords,
  existingMemory,
}: AddMemoryModalProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(21.1458);
  const [longitude, setLongitude] = useState<number>(79.0882);
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<string>('Travel');
  const [mood, setMood] = useState<string>('Joyful');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('private');
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (existingMemory) {
      setTitle(existingMemory.title);
      setDescription(existingMemory.description);
      setLatitude(existingMemory.latitude);
      setLongitude(existingMemory.longitude);
      setLocationName(existingMemory.locationName);
      setDate(existingMemory.date);
      setTime(existingMemory.time || '');
      setCategory(existingMemory.category);
      setMood(existingMemory.mood || 'Joyful');
      setTags(existingMemory.tags || []);
      setPeople(existingMemory.people || []);
      setPhotos(existingMemory.photos || []);
      setCoverPhoto(existingMemory.coverPhoto || existingMemory.photos[0] || '');
      setNotes(existingMemory.notes || '');
      setAiSummary(existingMemory.aiSummary || '');
      setPrivacy(existingMemory.privacy || 'private');
      setIsFavorite(Boolean(existingMemory.isFavorite));
      setStep(2); // Skip coordinate picker when editing
    } else if (initialCoords) {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
      setLocationName(initialCoords.locationName || `Location (${initialCoords.lat.toFixed(3)}, ${initialCoords.lng.toFixed(3)})`);
      // Try reverse geocoding for a human-readable city name
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialCoords.lat}&lon=${initialCoords.lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            setLocationName(parts.slice(0, 3).join(',').trim());
          }
        })
        .catch(() => {});
      setStep(1);
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setLocationName('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('');
      setCategory('Travel');
      setMood('Joyful');
      setTags([]);
      setPeople([]);
      setPhotos([]);
      setCoverPhoto('');
      setNotes('');
      setAiSummary('');
      setPrivacy('private');
      setIsFavorite(false);
      setStep(1);
    }
    setError(null);
  }, [isOpen, initialCoords, existingMemory]);

  if (!isOpen) return null;

  // Add Tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Add Person
  const handleAddPerson = () => {
    if (personInput.trim() && !people.includes(personInput.trim())) {
      setPeople([...people, personInput.trim()]);
      setPersonInput('');
    }
  };

  // Photo Upload Handler (Supports multiple files and converts to data URLs)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          setPhotos((prev) => {
            const next = [...prev, result];
            if (!coverPhoto) setCoverPhoto(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Curated Unsplash photo shortcuts
  const handleAddSamplePhoto = (url: string) => {
    setPhotos((prev) => {
      const next = [...prev, url];
      if (!coverPhoto) setCoverPhoto(url);
      return next;
    });
  };

  // AI Helper: Auto-Organize & Tags
  const handleAiSmartSuggest = async () => {
    if (!title && !description) {
      setError('Please provide a title or story description first.');
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const [organizeRes, tagsRes] = await Promise.all([
        api.aiOrganize({ title, story: description, location: locationName }),
        api.aiTags({ title, story: description, location: locationName, category, mood }),
      ]);
      if (organizeRes.suggestedCategory) setCategory(organizeRes.suggestedCategory);
      if (organizeRes.suggestedMood) setMood(organizeRes.suggestedMood);
      if (tagsRes.tags && tagsRes.tags.length > 0) {
        setTags(Array.from(new Set([...tags, ...tagsRes.tags])));
      }
    } catch (err: any) {
      console.warn('AI suggestions error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Helper: Generate Poetic Summary
  const handleAiGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.aiSummarize({
        title: title || 'A Memorable Moment',
        story: description || 'An unforgettable experience.',
        location: locationName || 'A special place',
        date,
        people,
        category,
      });
      if (res.summary) setAiSummary(res.summary);
    } catch (err: any) {
      console.warn('AI summary error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Memory
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Memory title is required.');
      setStep(2);
      return;
    }
    if (!locationName.trim()) {
      setError('Location name is required.');
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Partial<Memory> = {
      title,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      locationName,
      date,
      time,
      category,
      mood,
      tags,
      people,
      photos,
      coverPhoto: coverPhoto || photos[0] || '',
      notes,
      aiSummary,
      privacy,
      isFavorite,
    };

    try {
      let saved: Memory;
      if (existingMemory) {
        saved = await api.updateMemory(existingMemory.id, payload);
      } else {
        saved = await api.createMemory(payload);
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#b45309', '#f59e0b', '#10b981', '#3b82f6'],
        });
      } catch (e) {}

      onMemoryCreated(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save memory.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Travel',
    'College',
    'Childhood',
    'Family',
    'Friends',
    'Milestone',
    'Work',
    'Nature',
    'Food',
    'Culture',
    'Other',
  ];

  const moods = [
    'Joyful',
    'Peaceful',
    'Nostalgic',
    'Adventurous',
    'Inspired',
    'Grateful',
    'Romantic',
    'Excited',
  ];

  const steps = [
    { num: 1, title: 'Location' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'People' },
    { num: 4, title: 'Photos' },
    { num: 5, title: 'Notes' },
    { num: 6, title: 'Review' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 text-stone-900 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Stepper */}
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-stone-900">
                {existingMemory ? 'Edit Memory' : 'Add New Memory'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper progress dots */}
          <div className="flex items-center justify-between relative max-w-lg mx-auto px-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`relative z-10 flex flex-col items-center gap-1 group cursor-pointer`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="text-[10px] font-medium text-stone-500 hidden sm:block">
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Location */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Location Name / Landmark *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. VNIT Campus, Nagpur or Sinhagad Fort, Pune"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Name the place, city, or exact viewpoint where this memory transpired.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-2">
                  Popular Landmark Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'VNIT Campus, Nagpur', lat: 21.1255, lng: 79.0505 },
                    { name: 'Sinhagad Fort, Pune', lat: 18.3663, lng: 73.7558 },
                    { name: 'Sevagram Ashram, Wardha', lat: 20.7453, lng: 78.6022 },
                    { name: 'Tiger Hill, Darjeeling', lat: 27.036, lng: 88.2627 },
                    { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setLocationName(p.name);
                        setLatitude(p.lat);
                        setLongitude(p.lng);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {p.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Memory Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Memory Title *
                </label>
                <button
                  type="button"
                  onClick={handleAiSmartSuggest}
                  disabled={aiLoading}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{aiLoading ? 'Analyzing...' : 'AI Auto-Suggest Details'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="e.g. First Day at College, Monsoon Walk, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Story / Experience Description
                </label>
                <textarea
                  rows={4}
                  placeholder="What was the weather like? What conversations happened? What made this moment unforgettable?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mood / Feeling
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {moods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tags (Press Enter or click +)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Monsoon, Trek, Coffee"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: People */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-2 border border-amber-200">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
                  Who Was With You?
                </h3>
                <p className="text-xs text-stone-500">
                  Link friends, family members, or classmates to weave your memory graph.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter name (e.g. Rohan Sharma, Ananya)"
                  value={personInput}
                  onChange={(e) => setPersonInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPerson();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddPerson}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Connect Person
                </button>
              </div>

              {/* Connected People List */}
              <div className="space-y-2 mt-4">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                  People Connected ({people.length})
                </label>
                {people.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-3 text-center border border-dashed border-stone-200 rounded-xl">
                    Solo journey or no people connected yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {people.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                            {p.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-stone-800">{p}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPeople(people.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-2 border-dashed border-stone-200 hover:border-amber-500 rounded-3xl p-6 text-center bg-stone-50/60 transition-colors">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-stone-800">
                    Click to upload photos from device
                  </span>
                  <span className="text-xs text-stone-500">
                    PNG, JPG, WebP supported. Multiple uploads allowed.
                  </span>
                </label>
              </div>

              {/* Sample travel photography presets if user has no files handy */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-2">
                  Or pick high-resolution sample photos:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSamplePhoto(url)}
                      className="h-16 rounded-xl overflow-hidden border border-stone-200 hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer relative group"
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        + Add
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Gallery & Cover Selection */}
              {photos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Uploaded Photos ({photos.length}) — Click star to set Cover Image
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {photos.map((photo, i) => {
                      const isCover = coverPhoto === photo;
                      return (
                        <div
                          key={i}
                          className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                            isCover ? 'border-amber-500 ring-2 ring-amber-200 shadow-md' : 'border-stone-200'
                          }`}
                        >
                          <img src={photo} alt="Upload" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCoverPhoto(photo)}
                            title={isCover ? 'Cover photo' : 'Set as cover photo'}
                            className={`absolute top-1.5 left-1.5 p-1 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                              isCover ? 'bg-amber-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = photos.filter((_, idx) => idx !== i);
                              setPhotos(next);
                              if (coverPhoto === photo) {
                                setCoverPhoto(next[0] || '');
                              }
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/40 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Additional Notes & Privacy */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Personal / Secret Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Ticket prices, hotel details, coordinates of that specific tea stall, or intimate reflections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Privacy Radio */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Privacy Settings (Default: Private)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'private' as PrivacyLevel, label: 'Private', desc: 'Only you can view', icon: Lock },
                    { id: 'shared' as PrivacyLevel, label: 'Shared', desc: 'People connected', icon: Share2 },
                    { id: 'public' as PrivacyLevel, label: 'Public', desc: 'Public memory link', icon: Globe },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = privacy === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPrivacy(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-200'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`} />
                        <p className="text-xs font-bold text-stone-900">{p.label}</p>
                        <p className="text-[10px] text-stone-500">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Mark as Favorite</span>
                    <span className="text-[10px] text-stone-500">Highlighted on your dashboard & map</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Review & AI Story Summary */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    AI Memory Chronicle Summary
                  </span>
                  <button
                    type="button"
                    onClick={handleAiGenerateSummary}
                    disabled={aiLoading}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Regenerate with Gemini'}
                  </button>
                </div>
                {aiSummary ? (
                  <textarea
                    rows={2}
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    className="w-full bg-white/80 p-2 rounded-xl text-xs text-stone-800 font-serif-editorial italic border border-amber-200 focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-stone-600 italic">
                    Click below to generate a beautiful 1-2 sentence poetical chronicle with Gemini AI.
                  </p>
                )}
                {!aiSummary && (
                  <button
                    type="button"
                    onClick={handleAiGenerateSummary}
                    disabled={aiLoading}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-500 transition-colors cursor-pointer"
                  >
                    {aiLoading ? 'Generating Chronicle...' : 'Generate AI Summary'}
                  </button>
                )}
              </div>

              {/* Memory Preview Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex gap-4">
                  {coverPhoto && (
                    <img
                      src={coverPhoto}
                      alt="Cover"
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-amber-700 font-semibold mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{locationName || 'Unknown location'}</span>
                    </div>
                    <h3 className="font-serif-editorial text-base font-bold text-stone-900 truncate">
                      {title || 'Untitled Memory'}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {description || 'No description provided.'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-stone-500">
                      <span>{date}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                        {category}
                      </span>
                      {people.length > 0 && (
                        <span>• with {people.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !locationName.trim()) {
                  setError('Please specify a location name.');
                  return;
                }
                if (step === 2 && !title.trim()) {
                  setError('Please provide a memory title.');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-950/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{existingMemory ? 'Update Memory' : 'Save & Pin Memory'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
