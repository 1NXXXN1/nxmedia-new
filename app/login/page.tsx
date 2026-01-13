'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('Supabase sozlanmagan. .env.local faylini tekshiring.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error: any) {
      const errorMsg = error.message || 'Kirish xatolik';
      
      // Better error messages in Uzbek
      if (errorMsg.includes('Invalid login credentials')) {
        setError('Email yoki parol noto\'g\'ri');
      } else if (errorMsg.includes('Email not confirmed')) {
        setError('Email tasdiqlanmagan. Emailingizni tekshiring.');
      } else if (errorMsg.includes('User not found')) {
        setError('Foydalanuvchi topilmadi. Avval ro\'yxatdan o\'ting.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl">
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 shadow-2xl">
          <h1 className="text-2xl font-bold mb-1 text-center">Kirish</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Hisobingizga kiring</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Hisobingiz yo'qmi?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Ro'yxatdan o'tish
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
              Asosiy sahifaga qaytish
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
