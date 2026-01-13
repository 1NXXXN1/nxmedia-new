'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
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
