'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchFilmsByFilters } from '@/lib/client-api';
import FilmCard from '@/components/FilmCard';
import { isLocalFavorite, addLocalFavorite, removeLocalFavorite } from '@/lib/favorites-sync';
import { useAuth } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

type Film = {
  kinopoiskId: number;
  tmdbId?: number;
  filmId?: number;
  nameRu?: string;
  nameEn?: string;
  nameOriginal?: string;
  posterUrl?: string;
  posterUrlPreview?: string;
  year?: number;
  type?: string;
  ratingKinopoisk?: number;
};

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // const [films, setFilms] = useState<Film[]>([]);
  // const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localFilms, setFilms] = useState<Film[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>({});

  // Get filters from URL or use defaults
  const [filterType, setFilterType] = useState<'all' | 'movies' | 'tv' | 'cartoons'>(
    (searchParams.get('type') as any) || 'all'
  );
  const [filterYear, setFilterYear] = useState<number | ''>(
    searchParams.get('year') ? Number(searchParams.get('year')) : ''
  );
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'popularity'>(
    (searchParams.get('sort') as any) || 'rating'
  );
  const hasSearched = searchParams.has('searched');

  const { data: filmsData, isLoading: loadingQuery } = useQuery({
    queryKey: ['catalog-films', filterType, filterYear, sortBy, hasSearched],
    queryFn: async () => {
      const [result1, result2] = await Promise.all([
        searchFilmsByFilters({
          type:
            filterType === 'movies'
              ? 'FILM'
              : filterType === 'tv'
              ? 'TV_SERIES'
              : filterType === 'cartoons'
              ? 'CARTOON'
              : undefined,
          order: sortBy === 'rating' ? 'RATING' : sortBy === 'year' ? 'YEAR' : 'NUM_VOTE',
          yearFrom: filterYear ? Number(filterYear) : undefined,
          page: 1,
        }),
        searchFilmsByFilters({
          type:
            filterType === 'movies'
              ? 'FILM'
              : filterType === 'tv'
              ? 'TV_SERIES'
              : filterType === 'cartoons'
              ? 'CARTOON'
              : undefined,
          order: sortBy === 'rating' ? 'RATING' : sortBy === 'year' ? 'YEAR' : 'NUM_VOTE',
          yearFrom: filterYear ? Number(filterYear) : undefined,
          page: 2,
        })
      ]);
      return [...(result1.items || []), ...(result2.items || [])].slice(0, 21);
    },
    enabled: hasSearched,
    staleTime: 1000 * 60 * 10,
  });

  const updateFavoritesState = useCallback(() => {
    const newState: Record<string, boolean> = {};
    (filmsData || []).forEach(film => {
      const id = String(film.tmdbId || film.filmId || film.kinopoiskId);
      const mediaType = (film.type === 'series' ? 'tv' : 'movie') as 'movie' | 'tv';
      newState[id] = isLocalFavorite(id, mediaType);
    });
    setFavoritesState(newState);
  }, [filmsData, user]);

  // Load films only when filters change (not on initial mount)
  // useEffect(() => {
  //   if (!hasSearched) return;
  //   loadInitialFilms();
  // }, [hasSearched, loadInitialFilms]);

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

  const loadMore = async () => {
    if (!hasSearched) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      // Load 2 pages to get 24 items
      const [result1, result2] = await Promise.all([
        searchFilmsByFilters({
          type:
            filterType === 'movies'
              ? 'FILM'
              : filterType === 'tv'
              ? 'TV_SERIES'
              : filterType === 'cartoons'
              ? 'CARTOON'
              : undefined,
          order: sortBy === 'rating' ? 'RATING' : sortBy === 'year' ? 'YEAR' : 'NUM_VOTE',
          yearFrom: filterYear ? Number(filterYear) : undefined,
          page: nextPage,
        }),
        searchFilmsByFilters({
          type:
            filterType === 'movies'
              ? 'FILM'
              : filterType === 'tv'
              ? 'TV_SERIES'
              : filterType === 'cartoons'
              ? 'CARTOON'
              : undefined,
          order: sortBy === 'rating' ? 'RATING' : sortBy === 'year' ? 'YEAR' : 'NUM_VOTE',
          yearFrom: filterYear ? Number(filterYear) : undefined,
          page: nextPage + 1,
        })
      ]);
      const newFilms = [...(result1.items || []), ...(result2.items || [])].slice(0, 21);
      
      setFilms([...localFilms, ...newFilms]);
      setPage(nextPage + 1);
      setHasMore(newFilms.length >= 21);
    } catch (e) {
      console.error('Loading more failed:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (type?: string, year?: number | '', sort?: string) => {
    const params = new URLSearchParams();
    params.set('searched', 'true');
    if (type && type !== 'all') params.set('type', type);
    if (year) params.set('year', String(year));
    if (sort) params.set('sort', sort);
    router.push(`/catalog?${params.toString()}`);
  };

  const mapTmdbToFilm = (item: any): Film => ({
    kinopoiskId: item.id,
    tmdbId: item.id,
    filmId: item.id,
    nameRu: item.nameRu || item.title || item.name,
    nameOriginal: item.nameOriginal || item.original_title || item.original_name,
    posterUrlPreview: item.posterUrlPreview || '',
    posterUrl: item.posterUrl || '',
    year: item.year,
    type: item.type,
    ratingKinopoisk: item.ratingKinopoisk
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-3">
            Каталог
          </h1>
          <p className="text-gray-400">Найди свой любимый фильм или сериал</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg backdrop-blur border border-gray-700/50 flex flex-wrap gap-4 items-end  ">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-300 block mb-2">ТИП</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 hover:border-blue-400 focus:outline-none focus:border-blue-400 text-sm"
            >
              <option value="all">Все</option>
              <option value="movies">Фильмы</option>
              <option value="tv">Сериалы</option>
              <option value="cartoons">Мультфильмы</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-300 block mb-2">СОРТИРОВКА</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 hover:border-blue-400 focus:outline-none focus:border-blue-400 text-sm"
            >
              <option value="rating">По рейтингу</option>
              <option value="year">По году</option>
              <option value="popularity">По популярности</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-300 block mb-2">ГОД</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
              placeholder="2024"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 hover:border-blue-400 focus:outline-none focus-border-blue-400 text-sm"
            />
          </div>

          <div className="flex items-end gap-3 ml-auto justify-center w-full">
            <button
              onClick={() => updateFilters(filterType, filterYear, sortBy)}
              className="w-28 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition text-sm font-medium"
            >
              Искать
            </button>
            <button
              onClick={() => {
                setFilterType('all');
                setFilterYear('');
                setSortBy('rating');
                setPage(1);
                setFilms([]);
                router.push('/catalog');
              }}
              className="w-28 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 rounded transition text-sm font-medium"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Films Grid */}
        {!hasSearched ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">📽️ Выбери фильтры и нажми "Искать"</p>
            <p className="text-sm">Пока поиск не запущен, результаты не показываем</p>
          </div>
        ) : (filmsData?.length === 0 && !loadingQuery) ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Фильмы не найдены</p>
          </div>
        ) : (
          <>
            {Array.from({ length: Math.ceil((filmsData?.length || 0) / 14) }).map((_, gridIdx) => {
              const posters = (filmsData || []).slice(gridIdx * 14, gridIdx * 14 + 14);
              return (
                <div key={gridIdx} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6 mb-8">
                  {posters.map((film, i) => {
                    const filmId = String(film.tmdbId || film.filmId || film.kinopoiskId);
                    const mediaType = (film as any).mediaType || (film.type === 'series' ? 'tv' : 'movie');
                    const handleFavoriteClick = (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const isFav = isLocalFavorite(filmId, mediaType);
                      if (isFav) {
                        removeLocalFavorite(filmId, mediaType);
                      } else {
                        addLocalFavorite({
                          id: filmId,
                          title: film.nameRu || film.nameEn || film.nameOriginal || 'Film',
                          poster: film.posterUrlPreview,
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
                        key={`${film.tmdbId || film.filmId || film.kinopoiskId}-${gridIdx * 14 + i}-${favoritesState[filmId]}`}
                        id={filmId}
                        title={film.nameRu || film.nameEn || film.nameOriginal || 'Film'}
                        poster={film.posterUrlPreview}
                        year={film.year}
                        ratingKinopoisk={film.ratingKinopoisk}
                        ratingImdb={film.ratingKinopoisk}
                        mediaType={mediaType}
                        type={film.type}
                        priority={i < 5}
                        showFavoriteButton={!!user}
                        isFavorite={favoritesState[filmId] || false}
                        onFavoriteClick={handleFavoriteClick}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Load More Button */}
            {loadingQuery ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full"></div>
                </div>
              </div>
            ) : hasMore && filmsData && filmsData.length > 0 ? (
              <div className="text-center py-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition shadow-lg"
                >
                  Загрузить еще
                </button>
              </div>
            ) : null}
          </>
        )}
    </>
  );
}

export default CatalogContent;
