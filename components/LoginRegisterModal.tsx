"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginRegisterModal({ open, onClose, mode = "login" }: { open: boolean; onClose: () => void; mode?: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [localMode, setLocalMode] = useState<"login" | "register">((mode === "register") ? "register" : "login");

  // Listen for global openLoginRegisterModal event
  React.useEffect(() => {
    const handler = (e: any) => {
      setLocalMode(e.detail?.mode === "register" ? "register" : "login");
      setError(""); setSuccess(false); setDisplayName(""); setConfirmPassword(""); setPassword(""); setEmail("");
    };
    window.addEventListener("openLoginRegisterModal", handler);
    return () => window.removeEventListener("openLoginRegisterModal", handler);
  }, []);

  // Reset mode when modal is closed/opened
  React.useEffect(() => {
    if (open) {
      setLocalMode(mode === "register" ? "register" : "login");
      setError(""); setSuccess(false); setDisplayName(""); setConfirmPassword(""); setPassword(""); setEmail("");
    }
  }, [open, mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!supabase) {
      setError("Supabase не настроен. Проверьте файл .env.local.");
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onClose();
    } catch (error: any) {
      setError(error.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }
    if (!displayName.trim()) {
      setError("Имя обязательно для заполнения");
      setLoading(false);
      return;
    }
    if (!supabase) {
      setError("Supabase не настроен. Проверьте файл .env.local.");
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      setError(error.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-md" aria-hidden="true" onClick={onClose}></div>
          <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-center">
            <div className="relative w-full bg-gradient-to-br from-blue-700/60 via-purple-700/40 to-gray-900 rounded-2xl shadow-2xl border-0 p-[2px] animate-fade-in">
              <div className="bg-gray-900 rounded-2xl w-full flex flex-col items-center justify-center p-0 shadow-xl">
                <div className="w-full flex flex-col items-center justify-center px-2 py-2">
                  <img src="/favicon-white.png" alt="Modal Illustration" className="mb-4 w-16 h-16 object-contain" />
                  <h1 className="text-2xl font-extrabold mb-2 text-center text-white tracking-tight">{localMode === "login" ? "Вход" : "Регистрация"}</h1>
                  <p className="text-gray-400 text-center mb-4 text-base font-medium">{localMode === "login" ? "Войдите в свой аккаунт, чтобы продолжить" : "Создайте новый аккаунт, чтобы продолжить"}</p>
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-base text-center font-medium">{error}</div>
                  )}
                  {success && mode === "register" && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-base text-center font-medium">Вы успешно зарегистрировались!</div>
                  )}
                  <form onSubmit={localMode === "login" ? handleLogin : handleRegister} className="space-y-5 w-full max-w-xs mx-auto">
                    {localMode === "register" && (
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400" placeholder="Введите ваше имя" />
                    )}
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400" placeholder="email@example.com" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={localMode === "login" ? "current-password" : undefined} minLength={6} className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400" placeholder={localMode === "login" ? "••••••••" : "Минимум 6 символов"} />
                    {localMode === "register" && (
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400" placeholder="Повторите пароль" />
                    )}
                    <motion.button type="submit" disabled={loading || (localMode === "register" && success)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-bold text-white text-base shadow-lg transition">
                      {loading ? (localMode === "login" ? "Вход..." : "Регистрация...") : (localMode === "login" ? "Войти" : "Зарегистрироваться")}
                    </motion.button>
                  </form>
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      {localMode === "login" ? (
                        <>Нет аккаунта? <button type="button" className="text-blue-400 hover:text-blue-300 font-semibold" onClick={() => setLocalMode("register")}>{"Зарегистрироваться"}</button></>
                      ) : (
                        <>Уже есть аккаунт? <button type="button" className="text-blue-400 hover:text-blue-300 font-semibold" onClick={() => setLocalMode("login")}>{"Войти"}</button></>
                      )}
                    </p>
                  </div>
                  <div className="mt-2 text-center">
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-400 text-sm">Закрыть</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
