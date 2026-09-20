import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  ChevronRight, 
  Heart, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Person, Memory } from '../types';
import { api } from '../services/api';

interface PeoplePageProps {
  people: Person[];
  memories: Memory[];
  onRefreshPeople: () => void;
  onSelectMemory: (memory: Memory) => void;
}

export function PeoplePage({
  people,
  memories,
  onRefreshPeople,
  onSelectMemory,
}: PeoplePageProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [avatar, setAvatar] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter memories connected to the selected person
  const personMemories = selectedPerson
    ? memories.filter((m) => m.people?.includes(selectedPerson.name))
    : [];

  const handleOpenAdd = (p?: Person) => {
    if (p) {
      setEditingPerson(p);
      setName(p.name);
      setRelationship(p.relationship || 'Friend');
      setAvatar(p.avatar || '');
      setNotes(p.notes || '');
    } else {
      setEditingPerson(null);
      setName('');
      setRelationship('Friend');
      setAvatar('');
      setNotes('');
    }
    setIsAddModalOpen(true);
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (editingPerson) {
        await api.updatePerson(editingPerson.id, {
          name,
          relationship,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          notes,
        });
      } else {
        await api.createPerson({
          name,
          relationship,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          notes,
        });
      }
      onRefreshPeople();
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to save person.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (window.confirm('Delete this person profile?')) {
      try {
        await api.deletePerson(id);
        if (selectedPerson?.id === id) setSelectedPerson(null);
        onRefreshPeople();
      } catch (err) {
        alert('Failed to delete person.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              People Connections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            The friends, classmates, and loved ones who shared your journey across the map.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Main Grid: People Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {people.map((person) => {
          const connectedMemoriesCount = memories.filter((m) =>
            m.people?.includes(person.name)
          ).length;

          const isSelected = selectedPerson?.id === person.id;

          return (
            <div
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-600 ring-2 ring-amber-100 shadow-md'
                  : 'border-stone-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`}
                      alt={person.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-stone-100 bg-stone-100"
                    />
                    <div>
                      <h3 className="font-serif-editorial text-base font-bold text-stone-900">
                        {person.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold mt-0.5">
                        {person.relationship || 'Friend'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenAdd(person)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePerson(person.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {person.notes && (
                  <p className="text-xs text-stone-500 line-clamp-2 italic mb-3">
                    "{person.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <strong>{connectedMemoriesCount}</strong> memories shared
                </span>

                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-0.5">
                  View Footprints →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Person Memories Drawer / Showcase */}
      {selectedPerson && (
        <div className="mt-8 p-6 rounded-3xl bg-amber-50/40 border border-amber-200 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPerson.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPerson.name}`}
                alt={selectedPerson.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-300"
              />
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
                  Memories Shared With {selectedPerson.name}
                </h3>
                <p className="text-xs text-stone-500">
                  {personMemories.length} pinned experiences found across your timeline
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPerson(null)}
              className="p-1.5 rounded-full hover:bg-amber-100 text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {personMemories.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4 text-center">
              No memories tagged with {selectedPerson.name} yet. When adding a memory, connect {selectedPerson.name} in Step 3!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personMemories.map((m) => (
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

      {/* Add / Edit Person Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900">
                {editingPerson ? 'Edit Person' : 'Add Companion'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Friend">Friend</option>
                  <option value="College Friend">College Friend</option>
                  <option value="Best Friend">Best Friend</option>
                  <option value="Family">Family</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Partner">Partner</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Travel Buddy">Travel Buddy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Personal Notes / Anecdote
                </label>
                <textarea
                  rows={2}
                  placeholder="Met during college orientation, shared trek to Tiger Hill..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
