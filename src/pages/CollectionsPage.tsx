import React, { useState } from 'react';
import { 
  FolderHeart, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  MapPin, 
  Calendar, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Collection, Memory } from '../types';
import { api } from '../services/api';

interface CollectionsPageProps {
  collections: Collection[];
  memories: Memory[];
  onRefreshCollections: () => void;
  onSelectMemory: (memory: Memory) => void;
}

export function CollectionsPage({
  collections,
  memories,
  onRefreshCollections,
  onSelectMemory,
}: CollectionsPageProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#b45309');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (c?: Collection) => {
    if (c) {
      setEditingCollection(c);
      setName(c.name);
      setDescription(c.description || '');
      setColor(c.color || '#b45309');
      setCoverPhoto(c.coverPhoto || '');
    } else {
      setEditingCollection(null);
      setName('');
      setDescription('');
      setColor('#b45309');
      setCoverPhoto('');
    }
    setIsModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (editingCollection) {
        await api.updateCollection(editingCollection.id, {
          name,
          description,
          color,
          coverPhoto,
        });
      } else {
        await api.createCollection({
          name,
          description,
          color,
          coverPhoto: coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
        });
      }
      onRefreshCollections();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save collection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this collection?')) {
      try {
        await api.deleteCollection(id);
        if (selectedCollection?.id === id) setSelectedCollection(null);
        onRefreshCollections();
      } catch (err) {
        alert('Failed to delete collection.');
      }
    }
  };

  // Memories in selected collection
  const collectionMemories = selectedCollection
    ? memories.filter((m) => {
        // Match by memoryIds or by category name match
        const hasId = selectedCollection.memoryIds?.includes(m.id);
        const nameMatch = m.category.toLowerCase().includes(selectedCollection.name.toLowerCase()) ||
          selectedCollection.name.toLowerCase().includes(m.category.toLowerCase());
        return hasId || nameMatch;
      })
    : [];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Curated Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Group memories into thematic albums: college chapters, road trips, and childhood journals.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const count = memories.filter(
            (m) =>
              col.memoryIds?.includes(m.id) ||
              m.category.toLowerCase().includes(col.name.toLowerCase()) ||
              col.name.toLowerCase().includes(m.category.toLowerCase())
          ).length;

          const isSelected = selectedCollection?.id === col.id;

          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className={`rounded-3xl bg-white border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected ? 'border-amber-600 ring-2 ring-amber-100' : 'border-stone-200'
              }`}
            >
              <div className="relative h-44 overflow-hidden bg-stone-100">
                {col.coverPhoto && (
                  <img
                    src={col.coverPhoto}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenModal(col)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-serif-editorial text-lg font-bold truncate">
                    {col.name}
                  </h3>
                  <span className="text-[11px] text-amber-300 font-medium">
                    {count} memories curated
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {col.description || 'A custom album of memories.'}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
                  <span>Browse album</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Collection Memory Viewer */}
      {selectedCollection && (
        <div className="mt-8 p-6 rounded-3xl bg-amber-50/40 border border-amber-200 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900">
                {selectedCollection.name}
              </h3>
              <p className="text-xs text-stone-500">
                {collectionMemories.length} memories in this collection
              </p>
            </div>
            <button
              onClick={() => setSelectedCollection(null)}
              className="p-1.5 rounded-full hover:bg-amber-100 text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {collectionMemories.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-6 text-center">
              No memories in this collection yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionMemories.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMemory(m)}
                  className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 shadow-sm transition-all cursor-pointer flex gap-3"
                >
                  {m.coverPhoto && (
                    <img
                      src={m.coverPhoto}
                      alt={m.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] text-amber-700 font-semibold truncate">
                      {m.locationName}
                    </p>
                    <h4 className="font-serif-editorial text-sm font-bold text-stone-900 truncate">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-1">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900">
                {editingCollection ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mountain Escapes, College Life"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="The moments, trails, and hostels from our weekend adventures..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverPhoto}
                  onChange={(e) => setCoverPhoto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
