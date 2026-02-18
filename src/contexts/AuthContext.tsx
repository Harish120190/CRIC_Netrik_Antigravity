import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  UserCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/services/api';
import { User, mockDB } from '@/services/mockDatabase';
import { toast } from 'sonner';

// Helper to check if Firebase is configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && apiKey !== 'YOUR_API_KEY_HERE';
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: User | null;
  profile: User | null; // Alias for user
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<User | null>;
  logout: () => Promise<void>;
  loginWithPhone: (mobile: string) => Promise<boolean>;
  verifyOtp: (mobile: string, otp: string) => Promise<boolean>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // MOCK AUTH STATE
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn("Firebase not configured or invalid API Key. key=" + import.meta.env.VITE_FIREBASE_API_KEY);
      console.info("Using MOCK authentication system.");

      // Check for mock session
      const mockUid = localStorage.getItem('cric_hub_mock_uid');
      if (mockUid) {
        const mockUser = mockDB.getUsers().find(u => u.id === mockUid || u.email === mockUid); // Fallback to email as ID if needed
        if (mockUser) {
          setUser(mockUser);
          // Create a fake Firebase User to keep types happy if components allow it
          setCurrentUser({
            uid: mockUser.id,
            email: mockUser.email,
            displayName: mockUser.fullName,
            photoURL: mockUser.photoURL,
          } as any);
        }
      } else {
        // If no session, create default admin if not exists
        const admin = mockDB.getUsers().find(u => u.role === 'admin');
        if (admin && localStorage.getItem('cric_hub_auto_login_admin') === 'true') {
          // Auto login admin for convenience in dev
          setUser(admin);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        try {
          // Sync with real backend if available
          const token = await firebaseUser.getIdToken();
          // TRY to sync, but if backend fails (500/404), fall back to mock/local user construction
          try {
            const response = await api.post('/auth/sync', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
            setUser(response.data.user);
          } catch (apiError) {
            console.warn("Backend auth sync failed, reverting to local user object", apiError);
            // Fallback to locally constructed user or mockDB fetch
            // Try fetching from mockDB by email
            const localUser = mockDB.getUsers().find(u => u.email === firebaseUser.email);
            if (localUser) {
              setUser(localUser);
            } else {
              // Create minimal user
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                fullName: firebaseUser.displayName || 'User',
                mobile: firebaseUser.phoneNumber || '',
                role: 'player',
                isMobileVerified: !!firebaseUser.phoneNumber,
                created_at: new Date().toISOString(),
                verificationBadge: 'none'
              } as User);
            }
          }
        } catch (error) {
          console.error("Auth Err", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    if (!isFirebaseConfigured()) {
      // Mock Login
      // Simple password check (allow any password for existing users in mock mode for simplicity, or check strict)
      // Since mockDB doesn't store passwords, we accept any password for valid email.
      const mockUser = mockDB.getUsers().find(u => u.email === email);
      if (mockUser) {
        setUser(mockUser);
        setCurrentUser({ uid: mockUser.id, email: mockUser.email, displayName: mockUser.fullName } as any);
        localStorage.setItem('cric_hub_mock_uid', mockUser.id);
        toast.success(`Welcome back, ${mockUser.fullName}! (Mock Mode)`);
        return true;
      } else {
        toast.error("User not found (Mock Mode)");
        return false;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
      return false;
    }
  };

  const signup = async (userData: any): Promise<User | null> => {
    if (!isFirebaseConfigured()) {
      // Mock Signup
      try {
        const existingRequest = {
          ...userData,
          mobile: userData.mobile || userData.phone // normalizing
        };

        const newUser = mockDB.createUser(existingRequest);

        // Auto login
        setUser(newUser);
        setCurrentUser({ uid: newUser.id, email: newUser.email, displayName: newUser.fullName } as any);
        localStorage.setItem('cric_hub_mock_uid', newUser.id);

        toast.success("Account created! (Mock Mode)");
        return newUser;
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Signup failed");
        return null;
      }
    }

    try {
      const { email, password, fullName, mobile } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: fullName
        });

        // Sync immediately with mobile
        try {
          const response = await api.post('/auth/sync', {
            uid: userCredential.user.uid,
            email: email,
            displayName: fullName,
            mobile: mobile
          });
          setUser(response.data.user);
          return response.data.user;
        } catch (e) {
          console.error("Backend sync failed during signup", e);
          // Fallback to creating user in mockDB if backend fails
          const fallbackUser = mockDB.createUser({
            email, fullName, mobile, role: 'player'
          } as any);
          setUser(fallbackUser);
          return fallbackUser;
        }
      }
      return null;
    } catch (error: any) {
      console.error("Signup failed", error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured()) {
      localStorage.removeItem('cric_hub_mock_uid');
      setUser(null);
      setCurrentUser(null);
      toast.success("Logged out (Mock Mode)");
      return;
    }
    await firebaseSignOut(auth);
    setUser(null);
  };

  const loginWithPhone = async (mobile: string): Promise<boolean> => {
    if (!isFirebaseConfigured()) {
      // Mock Phone Login
      const mockUser = mockDB.getUserByMobile(mobile);
      if (mockUser) {
        // Skip OTP for mock
        setUser(mockUser);
        setCurrentUser({ uid: mockUser.id, email: mockUser.email, displayName: mockUser.fullName } as any);
        localStorage.setItem('cric_hub_mock_uid', mockUser.id);
        toast.success("Phone Verified! (Mock Mode)");
        return true;
      }
      // If user doesn't exist, we might need a "mock signup" flow for phone, but for now return false
      toast.error("User not found. Please sign up first. (Mock Mode)");
      return false;
    }

    try {
      if (!window.recaptchaVerifier) {
        const recaptchaContainerId = 'recaptcha-container';
        let container = document.getElementById(recaptchaContainerId);
        if (!container) {
          container = document.createElement('div');
          container.id = recaptchaContainerId;
          document.body.appendChild(container);
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, mobile, appVerifier);
      setConfirmationResult(result);
      return true;
    } catch (error) {
      console.error("Phone login failed", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      return false;
    }
  };

  const verifyOtp = async (mobile: string, otp: string): Promise<boolean> => {
    if (!isFirebaseConfigured()) return true; // Handled in loginWithPhone for mock

    if (!confirmationResult) {
      console.error("No OTP request found");
      return false;
    }
    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (error) {
      console.error("OTP verification failed", error);
      return false;
    }
  };

  const updateProfile = async (updates: any) => {
    if (user && !isFirebaseConfigured()) {
      const updated = mockDB.updateUser(user.id, updates);
      if (updated) {
        setUser(updated);
        toast.success("Profile Updated (Mock Mode)");
      }
      return updated;
    }

    if (currentUser) {
      await firebaseUpdateProfile(currentUser, {
        displayName: updates.displayName || updates.fullName,
        photoURL: updates.photoURL || updates.avatar_url
      });
      if (user) {
        setUser({ ...user, ...updates });
      }
      return user;
    }
    return null;
  };

  const value = {
    currentUser,
    user,
    profile: user,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    loading,
    isLoading: loading,
    loginWithEmail,
    signup,
    logout,
    loginWithPhone,
    verifyOtp,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}