// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, getSession, clearSession } from '../utils/authStore';

interface AuthContextType {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session when app opens
  useEffect(() => {
    async function loadSession() {
      const session = await getSession();
      if (session.token && session.user) {
        setToken(session.token);
        setUser(session.user);
      }
      setIsLoading(false);
    }
    loadSession();
  }, []);

  const signIn = async (newToken: string, newUser: any) => {
    await saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);