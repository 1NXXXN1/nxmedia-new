'use client';

import { AuthProvider } from '@/lib/auth-context';
import UserMenu from '@/components/UserMenu';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export { UserMenu };
