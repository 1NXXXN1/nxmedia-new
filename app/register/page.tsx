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
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError('Имя обязательно для заполнения');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Supabase не настроен. Проверьте файл .env.local.');
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
          alert('Ссылка для подтверждения отправлена на ваш email. Проверьте почту.');
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
      const errorMsg = error.message || 'Ошибка регистрации';
      
      // Better error messages
      if (errorMsg.includes('already registered')) {
        setError('Этот email уже зарегистрирован');
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
          <h1 className="text-2xl font-bold mb-1 text-center">Регистрация</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Создайте новый аккаунт</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Вы успешно зарегистрировались! Перенаправление на страницу входа...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Введите ваше имя"
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
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Минимум 6 символов"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Повторите пароль"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Войти
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
