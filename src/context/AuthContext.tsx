import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  googleProvider, 
  fbSignOut, 
  sendPasswordResetEmail, 
  updateProfile,
  FirebaseUser 
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  loading: boolean;
  googleLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCurrentUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mm_token'));
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for redirect result on app initialization (for mobile or blocked-popup fallbacks)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Redirect login succeeded, onAuthStateChanged will handle setting the user state
          setGoogleLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Firebase getRedirectResult notification:', err);
        setGoogleLoading(false);
      });
  }, []);

  // Synchronize Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Memory Explorer';
          const avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;

          const currentUser: User = {
            id: fbUser.uid,
            name: displayName,
            email: fbUser.email || '',
            avatar: avatarUrl,
            bio: 'Exploring memories on Memory Map.',
            defaultPrivacy: 'private',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          };

          setFirebaseUser(fbUser);
          setUser(currentUser);
          setToken(idToken);
          localStorage.setItem('mm_token', idToken);
          localStorage.setItem('mm_user', JSON.stringify(currentUser));
        } catch (err) {
          console.warn('Error extracting Firebase user token:', err);
        } finally {
          setGoogleLoading(false);
        }
      } else {
        setFirebaseUser(null);
        // If not running demo mode, clear credentials
        const storedToken = localStorage.getItem('mm_token');
        const isDemo = storedToken === 'user_alex_demo' || localStorage.getItem('mm_is_demo') === 'true';
        if (!isDemo) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('mm_token');
          localStorage.removeItem('mm_user');
        } else {
          // Restore demo session if active
          try {
            const res = await api.getCurrentUser();
            setUser(res.user);
          } catch {
            localStorage.removeItem('mm_token');
            localStorage.removeItem('mm_is_demo');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    localStorage.removeItem('mm_is_demo');
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try local server database first
    try {
      const res = await api.login(normalizedEmail, password);
      localStorage.setItem('mm_token', res.token);
      localStorage.setItem('mm_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return;
    } catch (apiErr: any) {
      // 2. If not found or failed on server, attempt Firebase Auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();
        const displayName = fbUser.displayName || normalizedEmail.split('@')[0] || 'Memory Explorer';
        const avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;

        const currentUser: User = {
          id: fbUser.uid,
          name: displayName,
          email: fbUser.email || normalizedEmail,
          avatar: avatarUrl,
          bio: 'Exploring memories on Memory Map.',
          defaultPrivacy: 'private',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };

        setFirebaseUser(fbUser);
        setUser(currentUser);
        setToken(idToken);
        localStorage.setItem('mm_token', idToken);
        localStorage.setItem('mm_user', JSON.stringify(currentUser));
        return;
      } catch (fbErr: any) {
        // Return clear, actionable message from either API or Firebase
        const apiMessage = apiErr?.message || '';
        if (apiMessage && !apiMessage.includes('status 500')) {
          throw new Error(apiMessage);
        }
        throw fbErr;
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    localStorage.removeItem('mm_is_demo');
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // 1. Register on server database for instant persistence
    const res = await api.register(trimmedName, normalizedEmail, password);
    localStorage.setItem('mm_token', res.token);
    localStorage.setItem('mm_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);

    // 2. Safely sync to Firebase in background
    createUserWithEmailAndPassword(auth, normalizedEmail, password)
      .then(async (cred) => {
        await updateProfile(cred.user, {
          displayName: trimmedName,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(trimmedName)}`,
        }).catch(() => {});
        setFirebaseUser(cred.user);
      })
      .catch((fbErr) => {
        console.warn('Background Firebase registration sync info:', fbErr?.code || fbErr?.message);
      });
  };

  /**
   * Google OAuth flow using Firebase Authentication.
   * Uses GoogleAuthProvider with prompt: 'select_account'.
   * This instructs Google's OAuth endpoint to always present the "Choose an account"
   * interface, even if only one account is signed into the browser.
   */
  const loginWithGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    localStorage.removeItem('mm_is_demo');

    // Create a new GoogleAuthProvider and strictly configure prompt: 'select_account'
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    provider.addScope('profile');
    provider.addScope('email');

    console.log('[Auth] Google login button clicked - initiating OAuth provider with prompt=select_account');

    try {
      let fbUser: FirebaseUser | null = null;

      try {
        const userCredential = await signInWithPopup(auth, provider);
        fbUser = userCredential.user;
        console.log('[Auth] Google OAuth popup authentication success for UID:', fbUser.uid);
      } catch (popupErr: any) {
        // If popup was blocked by browser, seamlessly fallback to signInWithRedirect
        if (popupErr?.code === 'auth/popup-blocked') {
          console.warn('[Auth] Popup blocked by browser; falling back to redirect flow with prompt=select_account');
          await signInWithRedirect(auth, provider);
          return;
        }

        console.error('[Auth] Google OAuth authentication error:', popupErr?.code || popupErr?.message);
        throw popupErr;
      }

      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Explorer';
        const avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;
        const userEmail = fbUser.email || '';

        // Synchronize authenticated user profile with application server database
        const serverRes = await api.loginWithGoogle(userEmail, displayName, avatarUrl).catch((err) => {
          console.warn('[Auth] Server profile sync notice:', err?.message);
          return null;
        });

        const currentUser: User = serverRes?.user || {
          id: fbUser.uid,
          name: displayName,
          email: userEmail,
          avatar: avatarUrl,
          bio: 'Exploring memories on Memory Map.',
          defaultPrivacy: 'private',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };

        setFirebaseUser(fbUser);
        setUser(currentUser);
        setToken(serverRes?.token || idToken);
        localStorage.setItem('mm_token', serverRes?.token || idToken);
        localStorage.setItem('mm_user', JSON.stringify(currentUser));
        console.log('[Auth] Authentication session successfully established for:', userEmail);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginAsDemo = async () => {
    if (auth.currentUser) {
      await fbSignOut(auth).catch(() => {});
    }
    const res = await api.loginAsDemo();
    localStorage.setItem('mm_token', res.token);
    localStorage.setItem('mm_is_demo', 'true');
    localStorage.setItem('mm_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setFirebaseUser(null);
  };

  const logout = async () => {
    console.log('[Auth] User logging out, clearing application session and signing out from Firebase Auth');
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_is_demo');
    localStorage.removeItem('mm_user');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    if (auth.currentUser) {
      await fbSignOut(auth).catch(() => {});
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('mm_user', JSON.stringify(updated));

    if (auth.currentUser) {
      const updates: { displayName?: string; photoURL?: string } = {};
      if (userData.name) updates.displayName = userData.name;
      if (userData.avatar) updates.photoURL = userData.avatar;
      if (Object.keys(updates).length > 0) {
        await updateProfile(auth.currentUser, updates).catch(() => {});
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        loading,
        googleLoading,
        login,
        register,
        loginWithGoogle,
        loginAsDemo,
        logout,
        resetPassword,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
