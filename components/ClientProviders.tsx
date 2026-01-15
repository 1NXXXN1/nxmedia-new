'use client';


import { AuthProvider, useAuth } from '@/lib/auth-context';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function FavoritesLink() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Link
      href="/favorites"
      className="rounded-lg px-3 py-1.5 text-sm
                 text-gray-300 hover:bg-white/5
                 transition-colors"
    >
      Избранное
    </Link>
  );
}

export { UserMenu };
