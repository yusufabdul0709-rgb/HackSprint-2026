import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthUser, Role } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('trialbridge_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('trialbridge_token');
      if (storedToken) {
        const storedUser = localStorage.getItem('trialbridge_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch {
            // invalid JSON
          }
        }
        try {
          const response = await api.get('/auth/me');
          if (response.data) {
            setUser(response.data);
          }
        } catch {
          // If backend is disconnected, retain local user
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password: password || 'Password123!' 
      });
      const { access_token, user: authUser } = response.data;
      
      localStorage.setItem('trialbridge_token', access_token);
      localStorage.setItem('trialbridge_user', JSON.stringify(authUser));
      
      setToken(access_token);
      setUser(authUser);
    } catch (error) {
      console.warn('Backend login fallback to demo credentials...', error);
      const demoRoles: Record<string, { role: Role; name: string }> = {
        'sarah.chen@trialbridge.io': { role: 'PLATFORM_ADMIN', name: 'Sarah Chen' },
        'j.patel@cityhospital.org': { role: 'PRINCIPAL_INVESTIGATOR', name: 'Dr. J Patel' },
        'maya.r@trialbridge.io': { role: 'RESEARCH_COORDINATOR', name: 'Maya R' },
        'm.torres@pharmaco.com': { role: 'ORGANIZATION', name: 'Maria Torres' },
        'rahul.mehta@email.com': { role: 'PARTICIPANT', name: 'Rahul Mehta' },
      };

      const demo = demoRoles[email.toLowerCase()];
      if (demo) {
        const authUser: AuthUser = {
          id: 'demo-' + demo.role.toLowerCase(),
          name: demo.name,
          email: email,
          role: demo.role,
        };
        const demoToken = 'demo-jwt-token-' + demo.role.toLowerCase();
        localStorage.setItem('trialbridge_token', demoToken);
        localStorage.setItem('trialbridge_user', JSON.stringify(authUser));
        setToken(demoToken);
        setUser(authUser);
        return;
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('trialbridge_token');
    localStorage.removeItem('trialbridge_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        role: user?.role || 'PARTICIPANT',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
