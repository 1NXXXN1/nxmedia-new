'use client';

import { useEffect, useState } from 'react';

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // Check if this is a unique visitor
    const visitorId = localStorage.getItem('nxmedia_visitor_id');
    
    if (!visitorId) {
      // New visitor - generate unique ID
      const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('nxmedia_visitor_id', newId);
      
      // Increment counter
      const currentCount = parseInt(localStorage.getItem('nxmedia_total_visitors') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('nxmedia_total_visitors', String(newCount));
      setVisitorCount(newCount);
    } else {
      // Returning visitor - just get count
      const currentCount = parseInt(localStorage.getItem('nxmedia_total_visitors') || '0');
      setVisitorCount(currentCount);
    }
  }, []);

  if (visitorCount === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
        />
      </svg>
      <span>Посетителей: {visitorCount.toLocaleString('ru-RU')}</span>
    </div>
  );
}
