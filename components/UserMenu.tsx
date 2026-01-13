'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown on route change or when user state changes
  useEffect(() => {
    setIsOpen(false);
  }, [user]);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
      >
        Kirish
      </Link>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const displayName = (user.user_metadata?.display_name || user.email?.split('@')[0] || 'User') as string;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold text-sm hover:scale-110 transition-transform"
      >
        {displayName[0].toUpperCase()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <p className="text-sm text-gray-400">Пользователь</p>
                <p className="font-semibold truncate">{displayName}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700/50 rounded transition-colors"
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
