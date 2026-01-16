"use client";
import React from "react";
import dynamic from "next/dynamic";

const LoginRegisterModal = dynamic(() => import("@/components/LoginRegisterModal"), { ssr: false });

export default function LoginRegisterModalRoot() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  React.useEffect(() => {
    const handler = (e: any) => {
      setMode(e.detail?.mode === 'register' ? 'register' : 'login');
      setOpen(true);
    };
    window.addEventListener('openLoginRegisterModal', handler);
    return () => window.removeEventListener('openLoginRegisterModal', handler);
  }, []);

  return <LoginRegisterModal open={open} onClose={() => setOpen(false)} mode={mode} />;
}
