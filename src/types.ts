export type PrivacyLevel = 'private' | 'shared' | 'public';

export type MemoryCategory = 
  | 'Travel'
  | 'College'
  | 'Childhood'
  | 'Family'
  | 'Friends'
  | 'Milestone'
  | 'Work'
  | 'Nature'
  | 'Food'
  | 'Culture'
  | 'Other';

export type MemoryMood = 
  | 'Joyful'
  | 'Peaceful'
  | 'Nostalgic'
  | 'Adventurous'
  | 'Inspired'
  | 'Grateful'
  | 'Romantic'
  | 'Excited'
  | 'Reflective';

export type RelationshipType = 
  | 'Friend'
  | 'Family'
  | 'Classmate'
  | 'Colleague'
  | 'Partner'
  | 'Mentor'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  defaultPrivacy?: PrivacyLevel | string;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: MemoryCategory | string;
  mood?: MemoryMood | string;
  tags: string[];
  people: string[]; // List of person names or IDs
  photos: string[];
  coverPhoto?: string;
  collectionId?: string;
  notes?: string;
  aiSummary?: string;
  privacy: PrivacyLevel;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  photo?: string;
  avatar?: string;
  relationship?: RelationshipType | string;
  notes?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  coverPhoto?: string;
  color?: string;
  memoryIds?: string[];
  createdAt: string;
}

export interface MemoryStats {
  totalMemories: number;
  totalPlaces: number;
  totalPeople: number;
  peopleConnected?: number;
  memoriesThisYear: number;
  latestMemory?: Memory;
  favoritePlaces: {
    locationName: string;
    count: number;
    latitude: number;
    longitude: number;
  }[];
  categoryCounts: Record<string, number>;
  moodCounts: Record<string, number>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'memory' | 'place' | 'person' | 'collection';
  subText?: string;
  image?: string;
  color?: string;
  data?: any;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  type?: string;
}
