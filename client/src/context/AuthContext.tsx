import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  requestLoginOtp: (
    identifier: string,
    channelPreference?: 'EMAIL' | 'SMS'
  ) => Promise<any>;
  verifyLoginOtp: (userId: string, code: string) => Promise<any>;
  register: (data: {
    name: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }) => Promise<any>;
  verifyRegistrationOtp: (userId: string, code: string) => Promise<any>;
  requestResetOtp: (identifier: string) => Promise<any>;
  resetPassword: (data: {
    userId: string;
    code: string;
    newPassword: string;
  }) => Promise<any>;
  resendOtp: (
    userId: string,
    purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET',
    channel?: 'EMAIL' | 'SMS'
  ) => Promise<any>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_HINT_KEY = 'waygo_session_active';
const USER_CACHE_KEY = 'waygo_cached_user';
const SESSION_CHECK_TIMEOUT_MS = 8000;

const readCachedUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  if (window.localStorage.getItem(SESSION_HINT_KEY) !== 'true') {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(USER_CACHE_KEY);

    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser) as User;

    return parsedUser?.id ? parsedUser : null;
  } catch {
    return null;
  }
};

const saveSessionCache = (user: User) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(SESSION_HINT_KEY, 'true');
  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};

const clearSessionCache = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(SESSION_HINT_KEY);
  window.localStorage.removeItem(USER_CACHE_KEY);
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readCachedUser());

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;

    const hasSessionHint =
      window.localStorage.getItem(SESSION_HINT_KEY) === 'true';

    return hasSessionHint && !readCachedUser();
  });

  const rememberUser = useCallback((authenticatedUser: User) => {
    setUser(authenticatedUser);
    saveSessionCache(authenticatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const cachedUser = readCachedUser();
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, SESSION_CHECK_TIMEOUT_MS);

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.user) {
          rememberUser(data.user);
          return;
        }
      }

      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        clearSessionCache();
        setUser(null);
      }
    } catch {
      // Keep the cached user visible when Render is waking up.
      if (!cachedUser) {
        setUser(null);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [rememberUser]);

  useEffect(() => {
    const hasSessionHint =
      window.localStorage.getItem(SESSION_HINT_KEY) === 'true';

    // Logged-out visitors should see the login page immediately.
    if (!hasSessionHint) {
      setLoading(false);
      return;
    }

    void refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.user) {
      rememberUser(data.user);
    }

    return data;
  };

  const requestLoginOtp = async (
    identifier: string,
    channelPreference?: 'EMAIL' | 'SMS'
  ) => {
    const response = await fetch('/api/auth/request-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, channelPreference }),
    });

    return response.json();
  };

  const verifyLoginOtp = async (userId: string, code: string) => {
    const response = await fetch('/api/auth/verify-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, code }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.user) {
      rememberUser(data.user);
    }

    return data;
  };

  const register = async (registrationData: {
    name: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(registrationData),
    });

    return response.json();
  };

  const verifyRegistrationOtp = async (
    userId: string,
    code: string
  ) => {
    const response = await fetch('/api/auth/verify-registration-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, code }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.user) {
      rememberUser(data.user);
    }

    return data;
  };

  const requestResetOtp = async (identifier: string) => {
    const response = await fetch('/api/auth/request-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier }),
    });

    return response.json();
  };

  const resetPassword = async (resetData: {
    userId: string;
    code: string;
    newPassword: string;
  }) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(resetData),
    });

    return response.json();
  };

  const resendOtp = async (
    userId: string,
    purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET',
    channel?: 'EMAIL' | 'SMS'
  ) => {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, purpose, channel }),
    });

    return response.json();
  };

  const demoLogin = async () => {
    const response = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.success && data.user) {
      rememberUser(data.user);
    } else {
      throw new Error(data.message || 'Demo login failed.');
    }
  };

  const logout = async () => {
    clearSessionCache();
    setUser(null);

    // Send logout in the background so the UI does not wait for Render.
    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
    }).catch(() => {
      // Local logout has already completed.
    });
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

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
