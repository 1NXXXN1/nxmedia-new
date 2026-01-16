'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { loadFromSupabase } from '@/lib/favorites-sync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, just set loading to false
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // User login bo'lganda Supabase dan favorites yuklaymiz
      if (session?.user) {
        await loadFromSupabase();
      } else if (event === 'SIGNED_OUT') {
        // Logout bo'lganda localStorage ni tozalaymiz
        if (typeof window !== 'undefined') {
          localStorage.removeItem('favoriteFilms');
          localStorage.removeItem('favoritesQueue');
          
          // Custom event yuboramiz
          window.dispatchEvent(new CustomEvent('favoritesChanged'));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // localStorage ni tozalaymiz
    if (typeof window !== 'undefined') {
      localStorage.removeItem('favoriteFilms');
      localStorage.removeItem('favoritesQueue');
      
      // Custom event yuboramiz
      window.dispatchEvent(new CustomEvent('favoritesChanged'));
    }
    
    // Supabase dan logout qilamiz
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
