import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  requestLoginOtp: (identifier: string, channelPreference?: 'EMAIL' | 'SMS') => Promise<any>;
  verifyLoginOtp: (userId: string, code: string) => Promise<any>;
  register: (data: { name: string; email?: string; phoneNumber?: string; password: string }) => Promise<any>;
  verifyRegistrationOtp: (userId: string, code: string) => Promise<any>;
  requestResetOtp: (identifier: string) => Promise<any>;
  resetPassword: (data: { userId: string; code: string; newPassword: string }) => Promise<any>;
  resendOtp: (userId: string, purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET', channel?: 'EMAIL' | 'SMS') => Promise<any>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.user);
    }
    return data;
  };

  const requestLoginOtp = async (identifier: string, channelPreference?: 'EMAIL' | 'SMS') => {
    const res = await fetch('/api/auth/request-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, channelPreference }),
    });
    return res.json();
  };

  const verifyLoginOtp = async (userId: string, code: string) => {
    const res = await fetch('/api/auth/verify-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, code }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (regData: {
    name: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(regData),
    });
    return res.json();
  };

  const verifyRegistrationOtp = async (userId: string, code: string) => {
    const res = await fetch('/api/auth/verify-registration-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, code }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.user);
    }
    return data;
  };

  const requestResetOtp = async (identifier: string) => {
    const res = await fetch('/api/auth/request-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier }),
    });
    return res.json();
  };

  const resetPassword = async (data: { userId: string; code: string; newPassword: string }) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const resendOtp = async (
    userId: string,
    purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET',
    channel?: 'EMAIL' | 'SMS'
  ) => {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, purpose, channel }),
    });
    return res.json();
  };

  const demoLogin = async () => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Demo login failed.');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        requestLoginOtp,
        verifyLoginOtp,
        register,
        verifyRegistrationOtp,
        requestResetOtp,
        resetPassword,
        resendOtp,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
