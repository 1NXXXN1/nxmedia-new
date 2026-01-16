'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link 
          href="/" 
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
