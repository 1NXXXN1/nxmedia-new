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
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search with debounce for dropdown
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?keyword=${encodeURIComponent(query)}&page=1`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.items?.slice(0, 5) || []); // Show only first 5 results in dropdown
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
  };

  return (
    <div ref={dropdownRef} className="w-full relative">
      <form onSubmit={handleSearch} className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
          placeholder="Поиск фильмов..."
          className="w-full px-4 py-2 pr-12 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:border-blue-400 focus:outline-none transition-colors"
        />
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

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {results.map((film) => {
                const mediaType = film.mediaType || (film.type === 'series' ? 'tv' : 'movie');
                const watchUrl = `/watch/${mediaType === 'tv' ? 'series' : 'movie'}/${film.kinopoiskId}`;
                
                return (
                  <Link
                    key={film.kinopoiskId}
                    href={watchUrl}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    {film.posterUrlPreview ? (
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                        <Image
                          src={film.posterUrlPreview}
                          alt={film.nameRu || film.nameEn || ''}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-16 flex-shrink-0 rounded bg-gray-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {film.nameRu || film.nameEn}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {film.year && <span>{film.year}</span>}
                        {(film.ratingKinopoisk || film.ratingImdb) && <span>•</span>}
                        {film.ratingKinopoisk && (
                          <span className="text-orange-400">КП {film.ratingKinopoisk.toFixed(1)}</span>
                        )}
                        {film.ratingKinopoisk && film.ratingImdb && <span>•</span>}
                        {film.ratingImdb && (
                          <span className="text-yellow-400">IMDb {film.ratingImdb.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* View All Results Button */}
            <button
              onClick={() => {
                setShowDropdown(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
              className="w-full p-3 text-sm text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors border-t border-white/10 text-center font-medium"
            >
              Показать все результаты →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
