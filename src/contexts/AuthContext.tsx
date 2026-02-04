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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        try {
          // Get freshly minted token
          const token = await firebaseUser.getIdToken();

          // Sync with backend
          const response = await api.post('/auth/sync', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });

          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to sync user with backend", error);
          // Fallback? Or set error state?
          // For now, at least set the partial user so app works
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'User',
            mobile: '',
            role: 'player',
            isMobileVerified: !!firebaseUser.phoneNumber,
            created_at: new Date().toISOString(),
            verificationBadge: 'none'
          } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const signup = async (userData: any): Promise<User | null> => {
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
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  // Store confirmation result for OTP verification
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const loginWithPhone = async (mobile: string): Promise<boolean> => {
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
      // Reset recaptcha if error occurs so it can be retried
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      return false;
    }
  };

  const verifyOtp = async (mobile: string, otp: string): Promise<boolean> => {
    if (!confirmationResult) {
      console.error("No OTP request found");
      return false;
    }
    try {
      await confirmationResult.confirm(otp);
      // onAuthStateChanged will handle the sync
      return true;
    } catch (error) {
      console.error("OTP verification failed", error);
      return false;
    }
  };

  const updateProfile = async (updates: any) => { // Type relaxed to match usage
    if (currentUser) {
      await firebaseUpdateProfile(currentUser, {
        displayName: updates.displayName || updates.fullName,
        photoURL: updates.photoURL || updates.avatar_url
      });
      // Update local state if needed
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