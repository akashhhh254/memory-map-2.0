import { 
  db, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection 
} from './firebase';
import { Memory, Person, Collection } from '../types';

/**
 * Firestore synchronization helper.
 * Manages per-user documents in Cloud Firestore under:
 * - users/{userId}/memories/{memoryId}
 * - users/{userId}/people/{personId}
 * - users/{userId}/collections/{collectionId}
 */

export const firestoreSync = {
  // --- Memories ---
  async saveMemory(userId: string, memory: Memory): Promise<void> {
    try {
      const memoryRef = doc(db, 'users', userId, 'memories', memory.id);
      await setDoc(memoryRef, {
        ...memory,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore: Could not sync memory to cloud, stored locally:', err);
    }
  },

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    try {
      const memoryRef = doc(db, 'users', userId, 'memories', memoryId);
      await deleteDoc(memoryRef);
    } catch (err) {
      console.warn('Firestore: Could not delete memory from cloud:', err);
    }
  },

  async getMemories(userId: string): Promise<Memory[]> {
    try {
      const memoriesCol = collection(db, 'users', userId, 'memories');
      const snapshot = await getDocs(memoriesCol);
      if (snapshot.empty) return [];
      return snapshot.docs.map(docSnap => docSnap.data() as Memory);
    } catch (err) {
      console.warn('Firestore: Could not fetch memories from cloud:', err);
      return [];
    }
  },

  // --- People ---
  async savePerson(userId: string, person: Person): Promise<void> {
    try {
      const personRef = doc(db, 'users', userId, 'people', person.id);
      await setDoc(personRef, person, { merge: true });
    } catch (err) {
      console.warn('Firestore: Could not sync person to cloud:', err);
    }
  },

  async deletePerson(userId: string, personId: string): Promise<void> {
    try {
      const personRef = doc(db, 'users', userId, 'people', personId);
      await deleteDoc(personRef);
    } catch (err) {
      console.warn('Firestore: Could not delete person from cloud:', err);
    }
  },

  async getPeople(userId: string): Promise<Person[]> {
    try {
      const peopleCol = collection(db, 'users', userId, 'people');
      const snapshot = await getDocs(peopleCol);
      if (snapshot.empty) return [];
      return snapshot.docs.map(docSnap => docSnap.data() as Person);
    } catch (err) {
      console.warn('Firestore: Could not fetch people from cloud:', err);
      return [];
    }
  },

  // --- Collections ---
  async saveCollection(userId: string, col: Collection): Promise<void> {
    try {
      const colRef = doc(db, 'users', userId, 'collections', col.id);
      await setDoc(colRef, col, { merge: true });
    } catch (err) {
      console.warn('Firestore: Could not sync collection to cloud:', err);
    }
  },

  async deleteCollection(userId: string, colId: string): Promise<void> {
    try {
      const colRef = doc(db, 'users', userId, 'collections', colId);
      await deleteDoc(colRef);
    } catch (err) {
      console.warn('Firestore: Could not delete collection from cloud:', err);
    }
  },

  async getCollections(userId: string): Promise<Collection[]> {
    try {
      const colCollection = collection(db, 'users', userId, 'collections');
      const snapshot = await getDocs(colCollection);
      if (snapshot.empty) return [];
      return snapshot.docs.map(docSnap => docSnap.data() as Collection);
    } catch (err) {
      console.warn('Firestore: Could not fetch collections from cloud:', err);
      return [];
    }
  }
};
