'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { searchKinopoisk } from '@/lib/client-api';
import FilmCard from '@/components/FilmCard';
import { isLocalFavorite, addLocalFavorite, removeLocalFavorite } from '@/lib/favorites-sync';
import { useAuth } from '@/lib/auth-context';

function formatTypeToRussian(type?: string): string {
  if (!type) return 'Фильм';
  const normalized = type.toLowerCase();
  if (normalized === 'series' || normalized === 'tv_series') return 'Сериал';
  if (normalized === 'cartoon' || normalized === 'anime') return 'Мультфильм';
  return 'Фильм';
}

interface SearchResult {
  kinopoiskId?: number;
  nameRu?: string;
  nameEn?: string;
  posterUrl?: string;
  posterUrlPreview?: string;
  year?: number;
  ratingKinopoisk?: number;
  type?: string;
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const FILMS_PER_PAGE = 14;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const updateFavoritesState = useCallback(() => {
    const newState: Record<string, boolean> = {};
    results.forEach(film => {
      if (film.kinopoiskId) {
        const id = String(film.kinopoiskId);
        const mediaType = (film.type === 'series' ? 'tv' : 'movie') as 'movie' | 'tv';
        newState[id] = isLocalFavorite(id, mediaType);
      }
    });
    setFavoritesState(newState);
  }, [results, user]);
  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    async function search() {
      setLoading(true);
      try {
        const data = await searchKinopoisk(query, page, FILMS_PER_PAGE);
        setResults(data.items || []);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [query, page]);

  useEffect(() => {
    updateFavoritesState();
    
    // Custom event tinglaymiz
    const handleFavoritesChanged = () => {
      updateFavoritesState();
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    };
  }, [updateFavoritesState]);

  if (!query) {
    return <div className="text-center py-12 text-gray-400">Введите поисковый запрос</div>;
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Поиск...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Результаты поиска "{query}"</h1>

      {results.length === 0 ? (
        <p className="text-center text-gray-400">Результатов не найдено</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-7 md:grid-rows-2 gap-4 mb-8">
            {results.filter(film => film.kinopoiskId).slice(0, 14).map((film, i) => {
              const mediaType = (film as any).mediaType || (film.type === 'series' ? 'tv' : 'movie');
              const filmId = String(film.kinopoiskId);
              
              const handleFavoriteClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isFav = isLocalFavorite(filmId, mediaType);
                if (isFav) {
                  removeLocalFavorite(filmId, mediaType);
                } else {
                  addLocalFavorite({
                    id: filmId,
                    title: film.nameRu || film.nameEn || 'Film',
                    poster: film.posterUrl || film.posterUrlPreview,
                    year: film.year,
                    rating: film.ratingKinopoisk,
                    imdbRating: film.ratingKinopoisk,
                    type: mediaType,
                    mediaType: mediaType
                  });
                }
                updateFavoritesState();
              };
              
              return (
                <FilmCard
                  key={`${film.kinopoiskId}-${i}-${favoritesState[filmId]}`}
                  id={filmId}
                  title={film.nameRu || film.nameEn || 'Film'}
                  poster={film.posterUrl || film.posterUrlPreview}
                  year={film.year}
                  ratingKinopoisk={film.ratingKinopoisk}
                  ratingImdb={film.ratingKinopoisk}
                  mediaType={mediaType}
                  priority={i < 3}
                  showFavoriteButton={!!user}
                  isFavorite={favoritesState[filmId] || false}
                  onFavoriteClick={handleFavoriteClick}
                />
              );
            })}
            {Array.from({ length: 14 - results.filter(film => film.kinopoiskId).slice(0, 14).length }).map((_, idx) => (
              <div key={`empty-search-${idx}`} />
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-gray-400">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={results.length === 0}
              className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
            >
              Далее
            </button>
          </div>
        </>
      )}
    </div>
  );
}
