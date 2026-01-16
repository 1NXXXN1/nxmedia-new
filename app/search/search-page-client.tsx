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
  const query = searchParams?.get('q') || '';
  // No per-page limit, show all results
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
      setHasMore(false);
      return;
    }

    async function search() {
      setLoading(true);
      try {
        const data = await searchKinopoisk(query, 1, 14);
        setResults(data.items || []);
        setHasMore((data.items?.length || 0) === 14);
        setPage(1);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [query]);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await searchKinopoisk(query, nextPage, 14);
      setResults(prev => [...prev, ...(data.items || [])]);
      setPage(nextPage);
      setHasMore((data.items?.length || 0) === 14);
    } catch (e) {
      console.error('Search error:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 mb-8">
            {results.filter(film => film.kinopoiskId).map((film, i) => {
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
          </div>
          {hasMore && (
            <div className="flex justify-center mb-12">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Загрузка...' : 'Показать ещё'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
