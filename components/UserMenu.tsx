'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import LoginRegisterModal from './LoginRegisterModal';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';
const ChangePasswordForm = dynamic(() => import('./ChangePasswordForm'), { ssr: false });
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');

  // Close dropdown on route change or when user state changes
  useEffect(() => {
    setIsOpen(false);
  }, [user]);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <button
        className="rounded-lg px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
        onClick={() => window.dispatchEvent(new CustomEvent('openLoginRegisterModal', { detail: { mode: 'login' } }))}
      >
        Войти
      </button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    // Supabase session kechikishi uchun kichik delay
    setTimeout(() => {
      if (pathname) {
        router.replace(pathname as unknown as Parameters<typeof router.replace>[0]);
      }
      router.refresh();
    }, 200);
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
                  <div className="mt-6">
                    <button
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                      onClick={() => { setShowChangePassword(true); setIsOpen(false); }}
                    >
                      Сменить пароль
                    </button>
                  </div>
              </div>

              <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-red-400/40"
                  >
                    Выйти
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Change Password */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-md" aria-hidden="true"></div>
          <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-center">
            <div className="relative w-full bg-gradient-to-br from-blue-700/60 via-purple-700/40 to-gray-900 rounded-2xl shadow-2xl border-0 p-[2px] animate-fade-in">
              <div className="bg-gray-900 rounded-2xl w-full flex flex-col items-center justify-center p-0 shadow-xl">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold z-10 transition-colors"
                  onClick={() => setShowChangePassword(false)}
                  aria-label="Закрыть"
                >
                  ×
                </button>
                <div className="w-full flex flex-col items-center justify-center px-2 py-2">
                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm6 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a2 2 0 012-2h8a2 2 0 012 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Сменить пароль</h2>
                  </div>
                  <ChangePasswordForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
