import {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  initials: string;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toAuthUser(u: User): AuthUser {
  const name = u.displayName ?? u.email?.split('@')[0] ?? 'User';
  return { uid: u.uid, name, email: u.email ?? '', initials: toInitials(name) };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signup:  (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login:   (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout:  () => Promise<void>;
  updateProfile: (name: string) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: if Firebase never responds (e.g. network issue),
    // stop the loading spinner after 8 seconds so the UI doesn't hang blank.
    const timeout = setTimeout(() => setLoading(false), 8000);

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(u, { displayName: name });
      // Create user doc in Firestore
      await setDoc(doc(db, 'users', u.uid), {
        name, email, createdAt: serverTimestamp(),
      });
      setUser(toAuthUser({ ...u, displayName: name }));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: firebaseError(e) };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: firebaseError(e) };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: u } = await signInWithPopup(auth, provider);
      // Create/update user doc in Firestore (no-op if already exists due to merge)
      await setDoc(doc(db, 'users', u.uid), {
        name:  u.displayName ?? u.email?.split('@')[0] ?? 'User',
        email: u.email ?? '',
      }, { merge: true });
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: firebaseError(e) };
    }
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    if (!auth.currentUser) return { ok: false, error: 'Not logged in.' };
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName: name });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { name }, { merge: true });
      setUser(prev => prev ? { ...prev, name, initials: toInitials(name) } : null);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: firebaseError(e) };
    }
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    if (!auth.currentUser?.email) return { ok: false, error: 'Not logged in.' };
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, current);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, next);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: firebaseError(e) };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithGoogle, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function firebaseError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/invalid-credential':   'Incorrect email or password.',
    'auth/too-many-requests':    'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
