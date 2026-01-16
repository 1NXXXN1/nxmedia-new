"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      setError("Supabase client is not initialized.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message || "Ошибка при смене пароля");
    } else {
      setSuccess("Пароль успешно изменён!");
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5 p-0 bg-transparent">
      <div className="space-y-3">
        <input
          type="password"
          className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400"
          placeholder="Новый пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 outline-none text-base transition placeholder-gray-400"
          placeholder="Повторите пароль"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          minLength={6}
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm font-medium mt-1">{error}</div>}
      {success && <div className="text-green-500 text-sm font-medium mt-1">{success}</div>}
      <button
        type="submit"
        className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Сохранение..." : "Сменить пароль"}
      </button>
    </form>
  );
}
