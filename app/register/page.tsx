'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError('Ism kiritilishi shart');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Supabase sozlanmagan. .env.local faylini tekshiring.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) throw error;

      setSuccess(true);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setError('');
        setSuccess(false);
        setTimeout(() => {
          alert('Email manzilingizga tasdiqlash havolasi yuborildi. Emailingizni tekshiring.');
          router.push('/login');
        }, 1000);
      } else {
        // Auto-logged in, redirect to home
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Ro\'yxatdan o\'tishda xatolik';
      
      // Better error messages
      if (errorMsg.includes('already registered')) {
        setError('Bu email allaqachon ro\'yxatdan o\'tgan');
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
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
          <h1 className="text-2xl font-bold mb-1 text-center">Ro'yxatdan o'tish</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Yangi hisob yarating</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Muvaffaqiyatli ro'yxatdan o'tdingiz! Login sahifasiga yo'naltirish...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ism</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Ismingizni kiriting"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Kamida 6 ta belgi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parolni tasdiqlash</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Parolni takrorlang"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {loading ? 'Ro\'yxatdan o\'tish...' : 'Ro\'yxatdan o\'tish'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Hisobingiz bormi?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Kirish
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
