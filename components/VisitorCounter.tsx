'use client';


import { useEffect, useState } from 'react';


export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        const res = await fetch('/api/usercount');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === 'number') {
            setVisitorCount(data.count);
            setLoading(false);
            return;
          }
        }
        setVisitorCount(0);
        setLoading(false);
      } catch (error) {
        setVisitorCount(0);
        setLoading(false);
      }
    }
    fetchUserCount();
  }, []);

  if (loading || visitorCount === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
      <span>Foydalanuvchilar soni: <b>{visitorCount}</b></span>
    </div>
  );
}
