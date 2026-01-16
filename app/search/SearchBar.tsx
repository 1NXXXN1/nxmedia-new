'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  kinopoiskId: number;
  nameRu?: string;
  nameEn?: string;
  posterUrlPreview?: string;
  year?: number;
  ratingKinopoisk?: number;
  ratingImdb?: number;
  type?: string;
  mediaType?: 'movie' | 'tv';
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams ? searchParams.get('q') || '' : '');
  const [loading, setLoading] = useState(false);

  // Live search with debounce for dropdown
  // Dropdown qismi olib tashlandi

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleResultClick = () => {
    setShowDropdown(false);
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleSearch} className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск фильмов..."
          className="w-full px-4 py-2 pr-20 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:border-blue-400 focus:outline-none transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Очистить"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Search"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
