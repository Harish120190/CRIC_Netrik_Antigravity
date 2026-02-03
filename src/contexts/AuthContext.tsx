import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDB, User } from '@/services/mockDatabase';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithPhone: (mobile: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<User | null>;
  verifyOtp: (mobile: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('cric_hub_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithPhone = async (mobile: string): Promise<boolean> => {
    try {
      const dbUser = mockDB.getUserByMobile(mobile);
      if (dbUser) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.access_token) {
        const { access_token, user } = response.data;
        setUser(user);
        localStorage.setItem('cric_hub_user', JSON.stringify(user));
        localStorage.setItem('access_token', access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email login error:', error);
      return false;
    }
  };

  const signup = async (userData: any): Promise<User> => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data && response.data.access_token) {
        const { access_token, user } = response.data;
        setUser(user);
        localStorage.setItem('cric_hub_user', JSON.stringify(user));
        localStorage.setItem('access_token', access_token);
        return user;
      }
      throw new Error("Registration failed");
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cric_hub_user');
    localStorage.removeItem('access_token');
  };

  // ... keep other methods as is for now or stub them ...


  const updateProfile = async (updates: Partial<User>): Promise<User | null> => {
    if (!user) return null;
    try {
      const updatedUser = mockDB.updateUser(user.id, updates);
      if (updatedUser) {
        const fullUpdatedUser = updatedUser as User;
        setUser(fullUpdatedUser);
        localStorage.setItem('cric_hub_user', JSON.stringify(fullUpdatedUser));
        return fullUpdatedUser;
      }
      return null;
    } catch (error) {
      console.error('Profile update error:', error);
      return null;
    }
  };

  const verifyOtp = async (mobile: string, otp: string): Promise<boolean> => {
    try {
      // Mock OTP verification - in real app would verify against backend
      if (otp === '1234') {
        const dbUser = mockDB.getUserByMobile(mobile);
        if (dbUser) {
          const updatedUser = mockDB.updateUser(dbUser.id, { isMobileVerified: true });
          if (updatedUser) {
            setUser(updatedUser as User);
            localStorage.setItem('cric_hub_user', JSON.stringify(updatedUser)); // Persist session
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loginWithPhone,
        loginWithEmail,
        signup,
        logout,
        isLoading,
        updateProfile,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};