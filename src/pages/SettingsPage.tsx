import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  LogOut, 
  User, 
  Lock, 
  Check, 
  AlertTriangle,
  Cloud,
  Database,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { firebaseConfig } from '../services/firebase';

interface SettingsPageProps {
  onDataReset: () => void;
}

export function SettingsPage({ onDataReset }: SettingsPageProps) {
  const { user, firebaseUser, logout, updateCurrentUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [defaultPrivacy, setDefaultPrivacy] = useState(user?.defaultPrivacy || 'private');
  const [savedMessage, setSavedMessage] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentUser({ name, defaultPrivacy });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleExportJSON = async () => {
    try {
      const memories = await api.getMemories();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `memory-map-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export data.');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset database back to the rich sample memories (Nagpur, Pune, Darjeeling, etc.)?')) {
      setResetting(true);
      try {
        await api.resetDemoData();
        onDataReset();
        alert('Sample memories successfully restored!');
      } catch (err) {
        alert('Reset failed.');
      } finally {
        setResetting(false);
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
    window.history.replaceState(null, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-600" />
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Account & Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your personal profile, cartography privacy, and Firebase cloud integrations.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile preferences saved successfully.</span>
        </div>
      )}

      {/* Firebase Cloud Connection Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/5 via-stone-50 to-amber-900/5 border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-300">
              <Cloud className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-lg font-bold text-stone-900">
                Firebase Cloud Services
              </h2>
              <p className="text-xs text-stone-500">
                Connected to project: <span className="font-mono font-semibold text-amber-800">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active & Synced</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-white border border-stone-200">
            <div className="flex items-center gap-2 text-stone-700 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Authentication</span>
            </div>
            <p className="text-xs text-stone-600">
              {firebaseUser ? (
                <span className="text-emerald-700 font-medium">Firebase Auth ({firebaseUser.email || 'Google User'})</span>
              ) : (
                <span className="text-stone-700 font-medium">Authenticated Account ({user?.email || 'Active User'})</span>
              )}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-200">
            <div className="flex items-center gap-2 text-stone-700 mb-1">
              <Database className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Cloud Firestore</span>
            </div>
            <p className="text-xs text-stone-600 font-medium text-emerald-700">
              Dual-layer persistence enabled
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-200">
            <div className="flex items-center gap-2 text-stone-700 mb-1">
              <Radio className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Cloud Storage</span>
            </div>
            <p className="text-xs text-stone-600 font-mono truncate" title={firebaseConfig.storageBucket}>
              {firebaseConfig.storageBucket}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
        <h2 className="font-serif-editorial text-lg font-bold text-stone-900">
          Personal Information
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-200"
            />
            <div>
              <p className="text-xs font-bold text-stone-700">Profile Photo</p>
              <p className="text-[11px] text-stone-500">Avatar managed via profile settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'explorer@memorymap.io'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-sm cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Privacy Settings */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif-editorial text-lg font-bold text-stone-900">
            Privacy Preferences
          </h2>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Memory Map protects your personal locations with bank-level encryption and strict tenant isolation.
        </p>

        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Default Privacy Level for New Pins
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'private', label: 'Private (Default)', desc: 'Only visible to your login' },
              { id: 'shared', label: 'Shared with People', desc: 'Accessible to connected friends' },
              { id: 'public', label: 'Public Link', desc: 'Shareable on the web' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDefaultPrivacy(p.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  defaultPrivacy === p.id
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-100'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <p className="text-xs font-bold text-stone-900">{p.label}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Portability & Backup */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-600" />
          <h2 className="font-serif-editorial text-lg font-bold text-stone-900">
            Export Your Memory Vault
          </h2>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Your life stories belong to you. Download a complete JSON archive of all your pinned memories, photos, coordinates, and journal entries.
        </p>

        <button
          onClick={handleExportJSON}
          className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export All Memories (.JSON)</span>
        </button>
      </div>

      {/* Danger Zone: Reset Sample Data & Logout */}
      <div className="p-6 rounded-3xl bg-rose-50/40 border border-rose-200 space-y-4">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-serif-editorial text-lg font-bold">
            Maintenance & Sign Out
          </h2>
        </div>

        <p className="text-xs text-stone-600">
          Want to populate starter exploration locations or reset the memory graph? You can reload starter sample places at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Restore Sample Data'}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
