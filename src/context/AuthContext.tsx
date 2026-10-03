import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  authService,
  LoginRequestPayload,
  CurrentUserResponse,
  TokenResponsePayload,
} from '../services/authService';

export interface AuthUser {
  userId: string;
  name: string;
  role: 'student' | 'parent';
  tokenExpires?: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: 'student' | 'parent' | 'guest';
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequestPayload) => Promise<TokenResponsePayload>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<'student' | 'parent' | 'guest'>('guest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate session on application mount
  const hydrateSession = useCallback(async () => {
    setIsLoading(true);
    const token = authService.getStoredToken();

    if (!token) {
      setUser(null);
      setRole('guest');
      setIsLoading(false);
      return;
    }

    try {
      // Validate token against backend /auth/me
      const me: CurrentUserResponse = await authService.getCurrentUser();
      if (me && me.user_id && me.role) {
        setUser({
          userId: me.user_id,
          name: me.name || (me.role === 'student' ? 'Student Explorer' : 'Parent Supervisor'),
          role: me.role,
          tokenExpires: me.token_expires,
        });
        setRole(me.role);
      } else {
        throw new Error('Malformed user profile returned from /auth/me');
      }
    } catch (err: any) {
      console.warn('Session hydration notice:', err?.response?.status || err?.message);
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        // Token is invalid or expired: clear storage completely
        authService.logout();
        setUser(null);
        setRole('guest');
      } else {
        // Backend offline or network failure: check if valid stored user metadata exists in local storage
        const storedUser = authService.getStoredUser();
        if (storedUser && storedUser.user_id && storedUser.role) {
          setUser({
            userId: storedUser.user_id,
            name: storedUser.name,
            role: storedUser.role,
          });
          setRole(storedUser.role);
        } else {
          authService.logout();
          setUser(null);
          setRole('guest');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const login = async (credentials: LoginRequestPayload): Promise<TokenResponsePayload> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser({
        userId: response.user_id,
        name: response.name,
        role: response.role,
      });
      setRole(response.role);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole('guest');
  };

  const refreshUser = async () => {
    await hydrateSession();
  };

  const value: AuthContextType = {
    user,
    role,
    isAuthenticated: Boolean(user && role !== 'guest'),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
