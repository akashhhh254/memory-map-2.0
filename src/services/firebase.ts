import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  Firestore
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Firebase Client Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCpx7_rX6d05Fw7om_c5q-VTxD6MDhjTE0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "memory-map-53334.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "memory-map-53334",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "memory-map-53334.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "490108697733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:490108697733:web:3d3f01c114e7e0b0cb7dec",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5E26ZBTBFY"
};

// Initialize or reuse Firebase App instance
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth
export const auth: Auth = getAuth(app);

// Official Google Auth Provider configured for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Firebase Firestore and Storage
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Safe Analytics initialization (only in supported browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase analytics initialization skipped:', err);
      }
    }
  }).catch(() => {
    // Ignore unsupported analytics environments
  });
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  ref,
  uploadString,
  getDownloadURL
};

export type { FirebaseUser };
