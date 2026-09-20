import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 20MB limit for image attachments
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Database directory & persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed data
const defaultUsers = [
  {
    id: 'user_alex_demo',
    name: 'Alex Rivera',
    email: 'alex@memorymap.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Cartography enthusiast, storyteller, and wanderer.',
    passwordHash: 'demo123',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

const defaultPeople = [
  {
    id: 'p_1',
    userId: 'user_alex_demo',
    name: 'Rohan Sharma',
    relationship: 'Friend',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    notes: 'College roommate, fellow trekker, and tech nerd.',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'p_2',
    userId: 'user_alex_demo',
    name: 'Ananya Deshmukh',
    relationship: 'Classmate',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    notes: 'Architect partner, always finds the coziest tea stalls.',
    createdAt: '2024-02-10T12:00:00.000Z',
  },
  {
    id: 'p_3',
    userId: 'user_alex_demo',
    name: 'Mom & Dad',
    relationship: 'Family',
    photo: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
    notes: 'The roots and the wind under my wings.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p_4',
    userId: 'user_alex_demo',
    name: 'Vikram Joshi',
    relationship: 'Friend',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    notes: 'Childhood best friend from Wardha high school.',
    createdAt: '2024-03-01T15:00:00.000Z',
  },
];

const defaultCollections = [
  {
    id: 'col_1',
    userId: 'user_alex_demo',
    name: 'College Life',
    description: 'Late-night library sessions, canteen laughs, and graduation triumphs.',
    color: '#3b82f6',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-01-10T08:00:00.000Z',
  },
  {
    id: 'col_2',
    userId: 'user_alex_demo',
    name: 'Family Trips',
    description: 'Road journeys, historic forts, and home-packed picnic baskets.',
    color: '#f59e0b',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-01-12T09:00:00.000Z',
  },
  {
    id: 'col_3',
    userId: 'user_alex_demo',
    name: 'Mountain Escapes',
    description: 'High passes, pine-scented breeze, and Himalayan sunrises.',
    color: '#10b981',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-02-05T14:00:00.000Z',
  },
  {
    id: 'col_4',
    userId: 'user_alex_demo',
    name: 'Childhood Chronicles',
    description: 'Vintage nostalgia, cycles in the rain, and school bells.',
    color: '#ec4899',
    coverImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-03-01T11:00:00.000Z',
  },
];

const defaultMemories = [
  {
    id: 'mem_1',
    userId: 'user_alex_demo',
    title: 'First Day at College',
    description: 'Stepping into the red-brick amphitheater of VNIT. Nervous hearts, huge backpacks, and the smell of fresh gulmohar blossoms. Rohan and Ananya shared an extra umbrella under the sudden Nagpur downpour, starting our four-year brotherhood.',
    latitude: 21.1255,
    longitude: 79.0505,
    locationName: 'VNIT Campus, Nagpur',
    date: '2025-07-15',
    time: '09:30',
    category: 'College',
    mood: 'Excited',
    tags: ['College', 'Nagpur', 'Freshers', 'Rain', 'Friends'],
    people: ['Rohan Sharma', 'Ananya Deshmukh'],
    photos: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_1',
    notes: 'Room 204 in Hall 3 allotted. Evening samosas at Bajaj Nagar corner.',
    aiSummary: 'A rainy July morning in Nagpur marking the inception of lifelong college camaraderie at VNIT.',
    privacy: 'private',
    isFavorite: true,
    createdAt: '2025-07-15T18:00:00.000Z',
    updatedAt: '2025-07-15T18:00:00.000Z',
  },
  {
    id: 'mem_2',
    userId: 'user_alex_demo',
    title: 'Family Trip to Sinhagad Fort',
    description: 'Early morning climb up to Sinhagad. Mom brought hot pitla-bhakri in an old brass dabba. The mist was drifting across the Sahyadris, and Dad was recounting tales of Tanaji Malusare with so much passion.',
    latitude: 18.3663,
    longitude: 73.7558,
    locationName: 'Sinhagad Fort, Pune',
    date: '2024-11-20',
    time: '07:15',
    category: 'Travel',
    mood: 'Grateful',
    tags: ['Family', 'Pune', 'Trek', 'Fort', 'Tradition'],
    people: ['Mom & Dad'],
    photos: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_2',
    notes: 'Bought sweet buttermilk in earthen pots on the descent.',
    aiSummary: 'A heart-warming family trek to Sinhagad, woven with misty panoramic vistas and nostalgic childhood stories.',
    privacy: 'private',
    isFavorite: true,
    createdAt: '2024-11-20T16:00:00.000Z',
    updatedAt: '2024-11-20T16:00:00.000Z',
  },
  {
    id: 'mem_3',
    userId: 'user_alex_demo',
    title: 'School Memories & Ashram Banyan',
    description: 'Cycling with Vikram along the quiet tamarind-lined roads of Sevagram. The sound of spinning spokes and evening prayer chimes. We sat beneath the grand banyan tree dreaming of what we would become when grown up.',
    latitude: 20.7453,
    longitude: 78.6022,
    locationName: 'Sevagram Ashram, Wardha',
    date: '2018-03-12',
    time: '17:00',
    category: 'Childhood',
    mood: 'Nostalgic',
    tags: ['Childhood', 'Wardha', 'School', 'Bicycle', 'Banyan'],
    people: ['Vikram Joshi'],
    photos: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_4',
    notes: 'The yellow Atlas bicycle had a loose pedal that Vikram fixed with a flat stone.',
    aiSummary: 'A golden afternoon under the Wardha banyan tree celebrating carefree school friendship and youthful dreams.',
    privacy: 'private',
    isFavorite: false,
    createdAt: '2024-03-01T12:00:00.000Z',
    updatedAt: '2024-03-01T12:00:00.000Z',
  },
  {
    id: 'mem_4',
    userId: 'user_alex_demo',
    title: 'Sunrise Over Kanchenjunga',
    description: 'Woke up at 3:30 AM in Darjeeling to reach Tiger Hill. The freezing Himalayan wind bit through our woolen gloves, but when the first golden beam struck the snow spire of Kanchenjunga, everything went completely quiet.',
    latitude: 27.036,
    longitude: 88.2627,
    locationName: 'Tiger Hill, Darjeeling',
    date: '2025-01-04',
    time: '05:45',
    category: 'Travel',
    mood: 'Inspired',
    tags: ['Himalayas', 'Sunrise', 'Darjeeling', 'Snow', 'Mountains'],
    people: ['Rohan Sharma'],
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_3',
    notes: 'Warm ginger tea in glass tumblers saved our fingertips.',
    aiSummary: 'An awe-inspiring Himalayan dawn painting Kanchenjunga in molten gold at 8,400 feet.',
    privacy: 'private',
    isFavorite: true,
    createdAt: '2025-01-04T12:00:00.000Z',
    updatedAt: '2025-01-04T12:00:00.000Z',
  },
  {
    id: 'mem_5',
    userId: 'user_alex_demo',
    title: 'Monsoon Walk & Cliffside Tea',
    description: 'Heavy July fog rolling over the Western Ghats. Walking across the wet stone pathways with Ananya, drenched to our boots and laughing uncontrollably. The waterfall roar drowned out the entire universe.',
    latitude: 18.7557,
    longitude: 73.4091,
    locationName: 'Tiger Point, Lonavala',
    date: '2025-08-02',
    time: '16:20',
    category: 'Nature',
    mood: 'Peaceful',
    tags: ['Monsoon', 'Ghats', 'Waterfalls', 'Chai', 'Fog'],
    people: ['Ananya Deshmukh'],
    photos: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_2',
    notes: 'Hot roasted corn with lemon chili paste.',
    aiSummary: 'A serene misty afternoon amidst roaring waterfalls and warm cutting chai in Lonavala.',
    privacy: 'private',
    isFavorite: false,
    createdAt: '2025-08-02T19:00:00.000Z',
    updatedAt: '2025-08-02T19:00:00.000Z',
  },
  {
    id: 'mem_6',
    userId: 'user_alex_demo',
    title: 'Winning First Place at InnoHacks',
    description: '48 hours without sleep in Koramangala. 12 cups of filter coffee, whiteboard scribbles covering entire glass walls, and a demo that worked on the very last trial. When the judges called our team name, the room exploded in applause.',
    latitude: 12.9352,
    longitude: 77.6245,
    locationName: 'Koramangala, Bengaluru',
    date: '2025-09-10',
    time: '18:45',
    category: 'Milestone',
    mood: 'Joyful',
    tags: ['Hackathon', 'Tech', 'Milestone', 'Victory', 'Bengaluru'],
    people: ['Rohan Sharma', 'Ananya Deshmukh'],
    photos: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_1',
    notes: 'Received the golden trophy and our first seed angel introduction.',
    aiSummary: 'An adrenaline-filled 48-hour engineering triumph in Bengaluru resulting in our first major championship.',
    privacy: 'private',
    isFavorite: true,
    createdAt: '2025-09-10T22:00:00.000Z',
    updatedAt: '2025-09-10T22:00:00.000Z',
  },
  {
    id: 'mem_7',
    userId: 'user_alex_demo',
    title: 'Cherry Blossoms Along Philosopher\'s Path',
    description: 'Petals floating down the canal like pink snowflakes in Kyoto. The quiet chime of temple bells and elderly locals raking gravel. Truly felt like stepping into an ancient watercolored scroll.',
    latitude: 35.0272,
    longitude: 135.7982,
    locationName: 'Philosopher\'s Path, Kyoto',
    date: '2024-04-06',
    time: '11:15',
    category: 'Travel',
    mood: 'Peaceful',
    tags: ['Kyoto', 'Sakura', 'Travel', 'Temples', 'Spring'],
    people: [],
    photos: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    ],
    coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    collectionId: 'col_2',
    notes: 'Bought a wooden omamori talisman at Ginkaku-ji shrine.',
    aiSummary: 'A meditative springtime stroll through Kyoto enveloped in falling cherry blossoms and ancient zen calm.',
    privacy: 'private',
    isFavorite: true,
    createdAt: '2024-04-06T15:00:00.000Z',
    updatedAt: '2024-04-06T15:00:00.000Z',
  },
];

// Helper to read & write DB
interface DatabaseSchema {
  users: typeof defaultUsers;
  people: typeof defaultPeople;
  collections: typeof defaultCollections;
  memories: typeof defaultMemories;
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load DB file, using defaults:', err);
  }
  const initial = {
    users: defaultUsers,
    people: defaultPeople,
    collections: defaultCollections,
    memories: defaultMemories,
  };
  saveDB(initial);
  return initial;
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB file:', err);
  }
}

// In-memory working database
let db = loadDB();

// Simple Auth Middleware
function getUserFromRequest(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  // Find user by ID or token
  let user = db.users.find(u => u.id === token || `token_${u.id}` === token);
  if (!user) {
    const rawName = req.headers['x-user-name'];
    const decodedName = rawName ? decodeURIComponent(rawName as string) : 'Memory Explorer';
    const email = (req.headers['x-user-email'] as string) || `user_${token.slice(0, 8)}@memorymap.io`;

    user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: token,
        name: decodedName,
        email: email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(decodedName)}`,
        bio: 'Curating my geographical memories.',
        passwordHash: '',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    }
  }
  return user;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

function ensureStarterDataForUser(userId: string) {
  const existingMemories = db.memories.filter(m => m.userId === userId);
  if (existingMemories.length > 0) return;

  const colMap = new Map<string, string>();
  defaultCollections.forEach(c => {
    const newColId = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    colMap.set(c.id, newColId);
    db.collections.push({
      ...c,
      id: newColId,
      userId,
      createdAt: new Date().toISOString()
    });
  });

  defaultPeople.forEach(p => {
    db.people.push({
      ...p,
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      createdAt: new Date().toISOString()
    });
  });

  defaultMemories.forEach(m => {
    db.memories.push({
      ...m,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      collectionId: (m.collectionId ? colMap.get(m.collectionId) : '') || m.collectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
}

// ==========================================
// AUTH API
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    return;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`,
    bio: 'Passionate memory collector.',
    passwordHash: password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  ensureStarterDataForUser(newUser.id);
  saveDB(db);

  res.json({
    user: newUser,
    token: newUser.id,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    res.status(404).json({ 
      error: `No account found for ${normalizedEmail}. Please sign up or create an account.`,
      notFound: true 
    });
    return;
  }

  if (user.passwordHash !== password) {
    res.status(401).json({ error: 'Incorrect password for this account. Please try again.' });
    return;
  }

  ensureStarterDataForUser(user.id);
  res.json({
    user,
    token: user.id,
  });
});

app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Valid email is required from Google OAuth verification.' });
    return;
  }
  const userEmail = email.trim().toLowerCase();
  const userName = (name && typeof name === 'string' && name.trim())
    ? name.trim()
    : (userEmail.includes('@') ? userEmail.split('@')[0].replace('.', ' ') : 'Google Explorer');

  let user = db.users.find(u => u.email.toLowerCase() === userEmail);
  if (!user) {
    user = {
      id: `user_google_${Date.now()}`,
      name: userName,
      email: userEmail,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`,
      bio: 'Exploring memories through Google account.',
      passwordHash: 'oauth_google_token',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    ensureStarterDataForUser(user.id);
    saveDB(db);
  } else {
    ensureStarterDataForUser(user.id);
  }

  res.json({
    user,
    token: user.id,
  });
});

app.post('/api/auth/demo', (req, res) => {
  // Always log into Alex Rivera demo account with rich starter dataset
  const user = db.users[0];
  res.json({
    user,
    token: user.id,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({ user });
});

// ==========================================
// MEMORIES API
// ==========================================

app.get('/api/memories', requireAuth, (req, res) => {
  const user = (req as any).user;
  const {
    search,
    category,
    person,
    tag,
    mood,
    year,
    collectionId,
    sort = 'newest',
  } = req.query as Record<string, string>;

  let list = db.memories.filter(m => m.userId === user.id);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.locationName.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q)) ||
      m.people.some(p => p.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    list = list.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  if (person && person !== 'All') {
    list = list.filter(m => m.people.some(p => p.toLowerCase() === person.toLowerCase()));
  }

  if (tag && tag !== 'All') {
    list = list.filter(m => m.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (mood && mood !== 'All') {
    list = list.filter(m => m.mood?.toLowerCase() === mood.toLowerCase());
  }

  if (year && year !== 'All') {
    list = list.filter(m => m.date.startsWith(year));
  }

  if (collectionId) {
    list = list.filter(m => m.collectionId === collectionId);
  }

  // Sort
  list.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  res.json(list);
});

app.get('/api/memories/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const memory = db.memories.find(m => m.id === req.params.id && m.userId === user.id);
  if (!memory) {
    res.status(404).json({ error: 'Memory not found.' });
    return;
  }
  res.json(memory);
});

app.post('/api/memories', requireAuth, (req, res) => {
  const user = (req as any).user;
  const data = req.body;

  if (!data.title || !data.latitude || !data.longitude || !data.locationName || !data.date) {
    res.status(400).json({ error: 'Title, location, and date are required.' });
    return;
  }

  const newMemory = {
    id: `mem_${Date.now()}`,
    userId: user.id,
    title: data.title,
    description: data.description || '',
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    locationName: data.locationName,
    date: data.date,
    time: data.time || '',
    category: data.category || 'Travel',
    mood: data.mood || 'Joyful',
    tags: Array.isArray(data.tags) ? data.tags : [],
    people: Array.isArray(data.people) ? data.people : [],
    photos: Array.isArray(data.photos) ? data.photos : [],
    coverPhoto: data.coverPhoto || (data.photos && data.photos[0]) || '',
    collectionId: data.collectionId || undefined,
    notes: data.notes || '',
    aiSummary: data.aiSummary || '',
    privacy: data.privacy || 'private',
    isFavorite: Boolean(data.isFavorite),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.memories.unshift(newMemory);
  saveDB(db);

  res.status(201).json(newMemory);
});

app.put('/api/memories/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.memories.findIndex(m => m.id === req.params.id && m.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Memory not found.' });
    return;
  }

  const existing = db.memories[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    userId: existing.userId,
    updatedAt: new Date().toISOString(),
  };

  db.memories[index] = updated;
  saveDB(db);

  res.json(updated);
});

app.delete('/api/memories/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.memories.findIndex(m => m.id === req.params.id && m.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Memory not found.' });
    return;
  }

  db.memories.splice(index, 1);
  saveDB(db);

  res.json({ success: true, message: 'Memory deleted.' });
});

// ==========================================
// PEOPLE API
// ==========================================

app.get('/api/people', requireAuth, (req, res) => {
  const user = (req as any).user;
  const people = db.people.filter(p => p.userId === user.id);
  res.json(people);
});

app.post('/api/people', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { name, relationship, photo, notes } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }

  const newPerson = {
    id: `p_${Date.now()}`,
    userId: user.id,
    name,
    relationship: relationship || 'Friend',
    photo: photo || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  db.people.push(newPerson);
  saveDB(db);

  res.status(201).json(newPerson);
});

app.put('/api/people/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.people.findIndex(p => p.id === req.params.id && p.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Person not found.' });
    return;
  }

  db.people[index] = { ...db.people[index], ...req.body };
  saveDB(db);

  res.json(db.people[index]);
});

app.delete('/api/people/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.people.findIndex(p => p.id === req.params.id && p.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Person not found.' });
    return;
  }

  db.people.splice(index, 1);
  saveDB(db);

  res.json({ success: true });
});

// ==========================================
// COLLECTIONS API
// ==========================================

app.get('/api/collections', requireAuth, (req, res) => {
  const user = (req as any).user;
  const collections = db.collections.filter(c => c.userId === user.id);
  res.json(collections);
});

app.post('/api/collections', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { name, description, coverImage, color } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Collection name is required.' });
    return;
  }

  const newCollection = {
    id: `col_${Date.now()}`,
    userId: user.id,
    name,
    description: description || '',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    color: color || '#3b82f6',
    createdAt: new Date().toISOString(),
  };

  db.collections.push(newCollection);
  saveDB(db);

  res.status(201).json(newCollection);
});

app.put('/api/collections/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.collections.findIndex(c => c.id === req.params.id && c.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Collection not found.' });
    return;
  }

  db.collections[index] = { ...db.collections[index], ...req.body };
  saveDB(db);

  res.json(db.collections[index]);
});

app.delete('/api/collections/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const index = db.collections.findIndex(c => c.id === req.params.id && c.userId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Collection not found.' });
    return;
  }

  db.collections.splice(index, 1);
  // Also unbind memories
  db.memories.forEach(m => {
    if (m.collectionId === req.params.id) {
      (m as any).collectionId = undefined;
    }
  });
  saveDB(db);

  res.json({ success: true });
});

// ==========================================
// DASHBOARD STATS API
// ==========================================

app.get('/api/stats', requireAuth, (req, res) => {
  const user = (req as any).user;
  const memories = db.memories.filter(m => m.userId === user.id);
  const people = db.people.filter(p => p.userId === user.id);

  const currentYear = new Date().getFullYear().toString();
  const memoriesThisYear = memories.filter(m => m.date.startsWith(currentYear)).length;

  // Unique places
  const placesMap = new Map<string, { count: number; lat: number; lng: number }>();
  memories.forEach(m => {
    const loc = m.locationName;
    const existing = placesMap.get(loc) || { count: 0, lat: m.latitude, lng: m.longitude };
    existing.count += 1;
    placesMap.set(loc, existing);
  });

  const favoritePlaces = Array.from(placesMap.entries())
    .map(([locationName, data]) => ({
      locationName,
      count: data.count,
      latitude: data.lat,
      longitude: data.lng,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const categoryCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};

  memories.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    if (m.mood) {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    }
  });

  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    totalMemories: memories.length,
    totalPlaces: placesMap.size,
    totalPeople: people.length,
    memoriesThisYear,
    latestMemory: sortedMemories[0] || null,
    favoritePlaces,
    categoryCounts,
    moodCounts,
  });
});

// ==========================================
// IMAGE UPLOAD API
// ==========================================

app.post('/api/upload', requireAuth, (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl) {
    res.status(400).json({ error: 'Image data URL is required.' });
    return;
  }
  // Store or return the data URL for immediate rendering
  res.json({ url: dataUrl });
});

// ==========================================
// AI FEATURES (Powered by Gemini API)
// ==========================================

app.post('/api/ai/summarize', requireAuth, async (req, res) => {
  const { title, story, location, date, people, category } = req.body;

  if (!aiClient) {
    // Intelligent fallback summary if API key is not configured
    const peopleStr = people && people.length > 0 ? ` with ${people.join(', ')}` : '';
    const fallback = `A cherished ${category || 'memory'} in ${location || 'a memorable place'}${peopleStr}, capturing moments from ${date || 'the past'}.`;
    res.json({ summary: fallback });
    return;
  }

  try {
    const prompt = `You are the poet and chronicler of "Memory Map". 
Summarize this personal memory in 1 to 2 warm, evocative, emotional sentences that capture its essence, place, and people.
Title: ${title}
Location: ${location}
Date: ${date}
People: ${Array.isArray(people) ? people.join(', ') : people}
Category: ${category}
Story: ${story}

Provide ONLY the summary text, with no preamble, quotes, or markdown.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summary = response.text?.trim() || 'A cherished personal moment in time.';
    res.json({ summary });
  } catch (err: any) {
    console.error('Gemini Summarize Error:', err);
    res.json({
      summary: `A meaningful personal reflection from ${location || 'a special place'}, immortalizing shared smiles and experiences.`,
    });
  }
});

app.post('/api/ai/tags', requireAuth, async (req, res) => {
  const { title, story, location, category, mood } = req.body;

  if (!aiClient) {
    const defaultTags = [category, mood, location?.split(',')[0], 'Adventure', 'Moments'].filter(Boolean);
    res.json({ tags: Array.from(new Set(defaultTags)).slice(0, 5) });
    return;
  }

  try {
    const prompt = `Generate 4 to 6 concise, relevant, and aesthetic memory tags for:
Title: ${title}
Location: ${location}
Category: ${category}
Mood: ${mood}
Story: ${story}

Return a valid JSON array of strings, e.g. ["RoadTrip", "Sunset", "Friends", "Serenity"]. Do not include extra text.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let tags: string[] = [];
    try {
      tags = JSON.parse(response.text?.trim() || '[]');
    } catch {
      tags = [category, mood, location?.split(',')[0]].filter(Boolean);
    }

    res.json({ tags });
  } catch (err: any) {
    console.error('Gemini Tags Error:', err);
    res.json({ tags: [category || 'Memory', mood || 'Moments', 'Journey'].filter(Boolean) });
  }
});

app.post('/api/ai/organize', requireAuth, async (req, res) => {
  const { title, story, location } = req.body;

  const validCategories = [
    'Travel', 'College', 'Childhood', 'Family', 'Friends',
    'Milestone', 'Work', 'Nature', 'Food', 'Culture', 'Other',
  ];

  if (!aiClient) {
    res.json({ suggestedCategory: 'Travel', suggestedMood: 'Joyful' });
    return;
  }

  try {
    const prompt = `Analyze this memory and recommend the best matching Category (choose exactly one from: ${validCategories.join(', ')}) and Mood (choose from: Joyful, Peaceful, Nostalgic, Adventurous, Inspired, Grateful, Romantic, Excited).
Title: ${title}
Location: ${location}
Story: ${story}

Return a JSON object: {"category": "...", "mood": "..."}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      suggestedCategory: parsed.category || 'Travel',
      suggestedMood: parsed.mood || 'Joyful',
    });
  } catch (err: any) {
    res.json({ suggestedCategory: 'Travel', suggestedMood: 'Joyful' });
  }
});

app.post('/api/ai/recap', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { year = '2025' } = req.body;
  const memories = db.memories.filter(m => m.userId === user.id && m.date.startsWith(String(year)));

  if (memories.length === 0) {
    res.json({
      recapTitle: `My ${year} Memory Journey`,
      recapStory: `You have not added memories for ${year} yet. Start pinning your favorite moments onto the map!`,
      highlights: [],
    });
    return;
  }

  const places = Array.from(new Set(memories.map(m => m.locationName)));
  const allPeople = Array.from(new Set(memories.flatMap(m => m.people)));

  if (!aiClient) {
    res.json({
      recapTitle: `My ${year} Memory Journey`,
      recapStory: `In ${year}, you traversed across ${places.length} places, recorded ${memories.length} meaningful moments, and shared life with ${allPeople.length} connected souls.`,
      highlights: memories.slice(0, 3).map(m => `${m.title} at ${m.locationName}`),
    });
    return;
  }

  try {
    const memoryBriefs = memories.map(m => `- ${m.date}: "${m.title}" at ${m.locationName} with ${m.people.join(', ')} (${m.mood})`).join('\n');
    const prompt = `Write a nostalgic, uplifting, inspiring Year in Review ("My ${year} Memory Journey") for this user.
The user has ${memories.length} memories in ${places.length} places with ${allPeople.length} people.
List of memories:
${memoryBriefs}

Return a JSON object with:
{
  "recapTitle": "My ${year} Memory Journey: [Creative Subtitle]",
  "recapStory": "A 2-3 paragraph inspiring retrospective celebration of their life, travels, growth, and connections in ${year}.",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini Recap Error:', err);
    res.json({
      recapTitle: `My ${year} Memory Journey`,
      recapStory: `You visited ${places.length} places, created ${memories.length} memories, and enriched your journey with friends and family throughout ${year}.`,
      highlights: memories.slice(0, 3).map(m => `${m.title} at ${m.locationName}`),
    });
  }
});

app.post('/api/ai/connections', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const memories = db.memories.filter(m => m.userId === user.id);

  if (!aiClient || memories.length < 2) {
    res.json({
      insights: [
        'Your memories often intertwine outdoor natural wonders with lifelong friendships.',
        'Travel memories are your most frequent catalyst for deep reflective moods.',
      ],
    });
    return;
  }

  try {
    const sample = memories.map(m => `"${m.title}" at ${m.locationName}, People: ${m.people.join(', ')}, Mood: ${m.mood}, Category: ${m.category}`).join('\n');
    const prompt = `Analyze these personal memories and identify 3 subtle emotional or thematic connections between places, people, and feelings.
${sample}

Return a JSON array of 3 insightful strings.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const insights = JSON.parse(response.text?.trim() || '[]');
    res.json({ insights });
  } catch (err) {
    res.json({
      insights: [
        'Your journeys with close companions regularly bring out adventurous milestones.',
        'High-altitude destinations correlate strongly with your deepest reflective moments.',
      ],
    });
  }
});

// Seed endpoint to reset or seed demo data anytime
app.post('/api/seed', requireAuth, (req, res) => {
  db = {
    users: defaultUsers,
    people: defaultPeople,
    collections: defaultCollections,
    memories: defaultMemories,
  };
  saveDB(db);
  res.json({ success: true, message: 'Database reset to demo state.' });
});

// ==========================================
// VITE MIDDLEWARE & SERVER INITIALIZATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Memory Map server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
