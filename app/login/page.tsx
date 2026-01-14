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
      setError('Supabase не настроен. Проверьте файл .env.local.');
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
      const errorMsg = error.message || 'Ошибка входа';
      
      // Better error messages in Russian
      if (errorMsg.includes('Invalid login credentials')) {
        setError('Неверный email или пароль');
      } else if (errorMsg.includes('Email not confirmed')) {
        setError('Email не подтвержден. Проверьте почту.');
      } else if (errorMsg.includes('User not found')) {
        setError('Пользователь не найден. Сначала зарегистрируйтесь.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] max-h-screen flex items-start justify-center px-4 pb-4 overflow-auto">
      <div className="w-full max-w-5xl bg-white/5 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-800/30">
        {/* Left illustration or gradient */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-12 relative">
          {/* Background image behind logo */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <img src="/i.webp" alt="Movies Collage" className="w-full h-full object-cover opacity-20 rounded-2xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <img src="/favicon-white.png" alt="Register Illustration" className="mb-8 w-24 h-24 object-contain" />
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Добро пожаловать!</h2>
            <p className="text-blue-100 text-base text-center">Войдите в свой аккаунт, чтобы смотреть фильмы и сериалы</p>
          </div>
        </div>
        {/* Right form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-10 bg-white/10 backdrop-blur-lg">
          <h1 className="text-2xl font-extrabold mb-3 text-center text-gray-900 dark:text-white tracking-tight">Вход</h1>
          <p className="text-gray-500 dark:text-gray-300 text-center mb-8 text-base font-medium">Войдите в свой аккаунт, чтобы продолжить</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-base text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-5 py-3 bg-white/60 dark:bg-[#232733] border border-gray-300 dark:border-gray-700 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base transition shadow-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-5 py-3 bg-white/60 dark:bg-[#232733] border border-gray-300 dark:border-gray-700 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base transition shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-bold text-white text-base shadow-lg transition"
            >
              {loading ? 'Вход...' : 'Войти'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400 font-semibold">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-400 hover:text-gray-500 text-sm">
              На главную страницу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
