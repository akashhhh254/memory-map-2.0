import { Memory, Person, Collection, MemoryStats, User } from '../types';
import { firestoreSync } from './firestoreSync';
import { storage, ref, uploadString, getDownloadURL } from './firebase';

const API_BASE = '/api';

function getCurrentStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('mm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mm_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const user = getCurrentStoredUser();
  if (user) {
    if (user.name) headers['x-user-name'] = encodeURIComponent(user.name);
    if (user.email) headers['x-user-email'] = user.email;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async loginWithGoogle(email?: string, name?: string, avatar?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatar }),
    });
    return handleResponse(res);
  },

  async loginAsDemo(): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Memories
  async getMemories(params?: {
    search?: string;
    category?: string;
    person?: string;
    tag?: string;
    mood?: string;
    year?: string;
    collectionId?: string;
    sort?: string;
  }): Promise<Memory[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'All') query.append(key, val);
      });
    }

    let serverMemories: Memory[] = [];
    try {
      const res = await fetch(`${API_BASE}/memories?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      serverMemories = await handleResponse<Memory[]>(res);
    } catch (e) {
      console.warn('Backend memories fetch error:', e);
    }

    // Merge with Firestore if Firebase user has records
    const user = getCurrentStoredUser();
    if (user?.id) {
      try {
        const firestoreMemories = await firestoreSync.getMemories(user.id);
        if (firestoreMemories.length > 0) {
          const map = new Map<string, Memory>();
          serverMemories.forEach(m => map.set(m.id, m));
          firestoreMemories.forEach(m => map.set(m.id, m));
          return Array.from(map.values());
        }
      } catch (e) {
        console.warn('Firestore read error:', e);
      }
    }

    return serverMemories;
  },

  async getMemory(id: string): Promise<Memory> {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createMemory(data: Partial<Memory>): Promise<Memory> {
    const res = await fetch(`${API_BASE}/memories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const saved = await handleResponse<Memory>(res);

    // Sync to Cloud Firestore
    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.saveMemory(user.id, saved);
    }

    return saved;
  },

  async updateMemory(id: string, data: Partial<Memory>): Promise<Memory> {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const updated = await handleResponse<Memory>(res);

    // Sync to Cloud Firestore
    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.saveMemory(user.id, updated);
    }

    return updated;
  },

  async deleteMemory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean }>(res);

    // Sync deletion to Cloud Firestore
    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.deleteMemory(user.id, id);
    }

    return result;
  },

  // People
  async getPeople(): Promise<Person[]> {
    let serverPeople: Person[] = [];
    try {
      const res = await fetch(`${API_BASE}/people`, {
        headers: getAuthHeaders(),
      });
      serverPeople = await handleResponse<Person[]>(res);
    } catch (e) {
      console.warn('Backend people fetch error:', e);
    }

    const user = getCurrentStoredUser();
    if (user?.id) {
      try {
        const firestorePeople = await firestoreSync.getPeople(user.id);
        if (firestorePeople.length > 0) {
          const map = new Map<string, Person>();
          serverPeople.forEach(p => map.set(p.id, p));
          firestorePeople.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        }
      } catch (e) {
        console.warn('Firestore people fetch error:', e);
      }
    }

    return serverPeople;
  },

  async createPerson(data: Partial<Person>): Promise<Person> {
    const res = await fetch(`${API_BASE}/people`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const saved = await handleResponse<Person>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.savePerson(user.id, saved);
    }

    return saved;
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    const res = await fetch(`${API_BASE}/people/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const updated = await handleResponse<Person>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.savePerson(user.id, updated);
    }

    return updated;
  },

  async deletePerson(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/people/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean }>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.deletePerson(user.id, id);
    }

    return result;
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    let serverCollections: Collection[] = [];
    try {
      const res = await fetch(`${API_BASE}/collections`, {
        headers: getAuthHeaders(),
      });
      serverCollections = await handleResponse<Collection[]>(res);
    } catch (e) {
      console.warn('Backend collections fetch error:', e);
    }

    const user = getCurrentStoredUser();
    if (user?.id) {
      try {
        const firestoreCollections = await firestoreSync.getCollections(user.id);
        if (firestoreCollections.length > 0) {
          const map = new Map<string, Collection>();
          serverCollections.forEach(c => map.set(c.id, c));
          firestoreCollections.forEach(c => map.set(c.id, c));
          return Array.from(map.values());
        }
      } catch (e) {
        console.warn('Firestore collections fetch error:', e);
      }
    }

    return serverCollections;
  },

  async createCollection(data: Partial<Collection>): Promise<Collection> {
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const saved = await handleResponse<Collection>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.saveCollection(user.id, saved);
    }

    return saved;
  },

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const updated = await handleResponse<Collection>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.saveCollection(user.id, updated);
    }

    return updated;
  },

  async deleteCollection(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean }>(res);

    const user = getCurrentStoredUser();
    if (user?.id) {
      await firestoreSync.deleteCollection(user.id, id);
    }

    return result;
  },

  // Stats
  async getStats(): Promise<MemoryStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Upload
  async uploadImage(dataUrl: string): Promise<{ url: string }> {
    // Attempt Firebase Storage upload if available
    try {
      const user = getCurrentStoredUser();
      if (user?.id && dataUrl.startsWith('data:')) {
        const fileId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const storageRef = ref(storage, `users/${user.id}/photos/${fileId}`);
        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        return { url: downloadUrl };
      }
    } catch (storageErr) {
      console.warn('Firebase Storage direct upload skipped or restricted, using server store:', storageErr);
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dataUrl }),
    });
    return handleResponse(res);
  },

  // AI Helpers (Powered by Gemini on backend)
  async aiSummarize(payload: {
    title: string;
    story: string;
    location: string;
    date: string;
    people: string[];
    category: string;
  }): Promise<{ summary: string }> {
    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async aiTags(payload: {
    title: string;
    story: string;
    location: string;
    category: string;
    mood: string;
  }): Promise<{ tags: string[] }> {
    const res = await fetch(`${API_BASE}/ai/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async aiOrganize(payload: {
    title: string;
    story: string;
    location: string;
  }): Promise<{ suggestedCategory: string; suggestedMood: string }> {
    const res = await fetch(`${API_BASE}/ai/organize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async aiRecap(year: string): Promise<{
    recapTitle: string;
    recapStory: string;
    highlights: string[];
  }> {
    const res = await fetch(`${API_BASE}/ai/recap`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ year }),
    });
    return handleResponse(res);
  },

  async aiConnections(): Promise<{ insights: string[] }> {
    const res = await fetch(`${API_BASE}/ai/connections`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reset demo
  async resetDemoData(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
