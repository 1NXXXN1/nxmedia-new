'use client';

/**
 * Watch Series Page - TMDB Integration
 * 
 * This page displays TV series details and player.
 * Uses TMDB API for all metadata, Kinopoisk ID for player iframe only.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchFilmDetails, fetchFilmStaff, getKinopoiskIdFromTmdb } from '@/lib/client-api';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { addLocalFavorite, removeLocalFavorite, isLocalFavorite } from '@/lib/favorites-sync';

interface FilmDetail {
  kinopoiskId: number | string;
  tmdbId?: number;
  nameRu?: string;
  nameEn?: string;
  description?: string;
  year?: number;
  posterUrlPreview?: string;
  posterUrl?: string;
  ratingKinopoisk?: number;
  ratingImdb?: number;
  filmLength?: number;
  genres?: Array<{ genre: string }>;
  countries?: Array<{ country: string }>;
  type?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status?: string;
  lastAirDate?: string;
}

interface Actor {
  kinopoiskId: number;
  nameRu?: string;
  nameEn?: string;
  posterUrl?: string;
  description?: string;
}

export default function WatchSeriesPage() {
  const params = useParams();
  const id = params.id as string;
  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [kinopoiskId, setKinopoiskId] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [playerError, setPlayerError] = useState<string>('');
  const { user } = useAuth();

  const checkFavorite = (filmId: string) => {
    const favStatus = isLocalFavorite(filmId, 'tv');
    setIsFav(favStatus);
  };

  useEffect(() => {
    async function loadFilmAndActors() {
      console.log(`[Watch Series] Loading series with TMDB ID: ${id}`);
      try {
        // 1) Fetch TMDB details
        console.log('[Watch Series] Fetching TMDB details...');
        const tmdbData = await fetchFilmDetails(Number(id), 'tv');
        if (!tmdbData) {
          console.error('[Watch Series] No series data found for ID:', id);
          setLoading(false);
          return;
        }

        setFilm(tmdbData);
        console.log('[Watch Series] Series data set:', tmdbData.nameRu || tmdbData.nameEn);

        // 2) Convert to Kinopoisk ID (for iframe)
        console.log('[Watch Series] Requesting Kinopoisk ID...');
        const kpResult = await getKinopoiskIdFromTmdb(Number(id), 'tv');
        console.log(`[Watch Series] Received KP: ID=${kpResult.id}, Type=${kpResult.type}`);

        if (kpResult.id && kpResult.id !== String(id)) {
          console.log(`[Watch Series] ✓ Valid Kinopoisk ID found: ${kpResult.id}`);
          setKinopoiskId(kpResult.id);
          setPlayerError('');
        } else {
          console.warn(`[Watch Series] ✗ Kinopoisk ID not found (got ${kpResult.id} for TMDB ${id})`);
          setPlayerError('Видеоплеер временно недоступен для этого контента');
        }

        // 3) Load actors
        console.log('[Watch Series] Loading actors...');
        const staffData = await fetchFilmStaff(Number(id), 'tv');
        if (staffData?.items) {
          const actorsList = staffData.items.filter((person: any) => person.professionKey === 'ACTOR').slice(0, 10);
          console.log(`[Watch Series] Loaded ${actorsList.length} actors`);
          setActors(actorsList || []);
        }
      } catch (e) {
        console.error('[Watch Series] Error loading series:', e);
      } finally {
        setLoading(false);
        console.log('[Watch Series] Loading complete');
      }
    }

    if (id) {
      console.log(`[Watch Series] Series ID changed to: ${id}, resetting state...`);
      setKinopoiskId('');
      setIframeLoaded(false);
      setPlayerError('');
      setLoading(true);
      
      loadFilmAndActors();
      checkFavorite(id);

      const handleStorageChange = () => {
        checkFavorite(id);
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [id]);

  // Load iframe with obfuscated URL
  useEffect(() => {
    if (!kinopoiskId || loading || !film) {
      return;
    }
    
    console.log(`[Watch Series] Creating iframe for Kinopoisk ID: ${kinopoiskId}`);
    
    const container = document.getElementById('player-container');
    if (!container) {
      return;
    }
    
    const existingIframe = container.querySelector('iframe');
    if (existingIframe) {
      existingIframe.remove();
    }
    
    const frame = document.createElement('iframe');
    frame.src = `/api/proxy?id=${kinopoiskId}`;
    frame.className = 'absolute inset-0 w-full h-full border-0';
    frame.allowFullscreen = true;
    frame.allow = 'autoplay *; encrypted-media *';
    frame.referrerPolicy = 'no-referrer';
    
    frame.onload = () => {
      console.log('[Watch Series] Iframe loaded successfully');
      setIframeLoaded(true);
    };
    
    frame.onerror = (e) => {
      console.error('[Watch Series] Iframe load error:', e);
    };
    
    container.appendChild(frame);
  }, [kinopoiskId, loading, film]);

  const toggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!film) return;

    // Darhol localStorage ni yangilaymiz
    if (isFav) {
      removeLocalFavorite(id, 'tv');
      setIsFav(false);
    } else {
      const newFavorite = {
        id,
        mediaType: 'tv',
        title: film.nameRu || film.nameEn,
        poster: film.posterUrlPreview,
        rating: film.ratingKinopoisk,
        imdbRating: film.ratingImdb,
        year: film.year,
        type: 'film'
      };
      addLocalFavorite(newFavorite);
      setIsFav(true);
    }
    
    // Background da sync bo'ladi avtomatik
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Загрузка...</div>;
  }

  if (!film) {
    return <div className="text-center py-12 text-gray-400">Сериал не найден</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poster with Heart Button */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl flex-shrink-0 group bg-gray-900 max-w-xs">
          {film.posterUrl || film.posterUrlPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={film.posterUrl || film.posterUrlPreview}
              alt={film.nameRu || film.nameEn || 'Series'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center gap-3">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">Poster mavjud emas</p>
            </div>
          )}
          
          {/* Heart Button Overlay */}
          <motion.button
            onClick={toggleFavorite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm z-10"
          >
            <motion.span
              animate={isFav ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`text-2xl block transition-colors ${isFav ? 'text-red-500' : 'text-gray-300'}`}
            >
              ♥
            </motion.span>
          </motion.button>
        </div>

        {/* Info and Description */}
        <div className="md:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-1">{film.nameRu || film.nameEn}</h1>
            {film.nameEn && film.nameRu !== film.nameEn && (
              <p className="text-xs text-gray-400">{film.nameEn}</p>
            )}
          </div>

          {/* Rating and Stats */}
          <div className="flex flex-wrap gap-2">
            {film.ratingKinopoisk && (
              <div className="flex items-center gap-1.5 bg-gray-900/60 px-2.5 py-1.5 rounded-md border border-orange-600/40 w-fit hover:bg-gray-800/70 transition">
                <img src="/kinopoisk-favicon.ico" alt="Kinopoisk" className="w-5 h-5" />
                <div>
                  <div className="text-xs text-orange-400 font-semibold">{film.ratingKinopoisk.toFixed(1)}</div>
                </div>
              </div>
            )}
            {film.ratingImdb && (
              <div className="flex items-center gap-1.5 bg-gray-900/60 px-2.5 py-1.5 rounded-md border border-yellow-600/40 w-fit hover:bg-gray-800/70 transition">
                <img src="/imdb-favicon.ico" alt="IMDb" className="w-5 h-5" />
                <div>
                  <div className="text-xs text-yellow-400 font-semibold">{film.ratingImdb.toFixed(1)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-gray-300 py-3 border-y border-gray-700">
            <div>
              <div className="text-xs text-gray-400 mb-1">Дата выпуска</div>
              <div className="font-semibold">{film.year}</div>
            </div>
            {film.filmLength && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Длительность эпизода</div>
                <div className="font-semibold">{film.filmLength} мин</div>
              </div>
            )}
            {film.countries && film.countries.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Страна</div>
                <div className="font-semibold">{film.countries.map(c => c.country).join(', ')}</div>
              </div>
            )}
            {film.numberOfSeasons && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Сезоны</div>
                <div className="font-semibold">{film.numberOfSeasons}</div>
              </div>
            )}
            {film.numberOfEpisodes && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Эпизоды</div>
                <div className="font-semibold">{film.numberOfEpisodes}</div>
              </div>
            )}
            {film.status && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Статус</div>
                <div className="font-semibold">
                  {film.status === 'Ended' ? 'Завершён' : 
                   film.status === 'Returning Series' ? 'Продолжается' : 
                   film.status === 'Canceled' ? 'Отменён' : film.status}
                </div>
              </div>
            )}
          </div>

          {/* Genres */}
          {film.genres && film.genres.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-3 font-semibold">Жанры</p>
              <div className="flex flex-wrap gap-2">
                {film.genres.map((g) => (
                  <span key={g.genre} className="px-2.5 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-medium border border-blue-500/50">
                    {g.genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {film.description && (
            <div className="space-y-2 bg-gray-800/30 p-5 rounded-lg border border-gray-700">
              <h3 className="text-sm font-bold text-gray-300">Описание</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{film.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      <div className="space-y-2 max-w-5xl mx-auto">
        <h2 className="text-lg font-bold">Смотреть</h2>
        <div 
          id="player-container" 
          className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
        >
          {playerError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="text-gray-400 text-sm">{playerError}</div>
              <div className="text-gray-500 text-xs">Информация о сериале доступна выше</div>
            </div>
          ) : !iframeLoaded && !kinopoiskId ? (
            <div className="loader-text absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400">Загрузка плеера...</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Cast */}
      {actors.length > 0 && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-lg font-bold">Актёры</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {actors.map((actor, idx) => (
              <Link 
                key={`${actor.kinopoiskId}-${idx}`} 
                href={`/person/${actor.kinopoiskId}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center cursor-pointer group"
                >
                  {actor.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={actor.posterUrl}
                      alt={actor.nameRu || actor.nameEn || 'Actor'}
                      className="w-full h-auto rounded-lg object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <p className="mt-1 text-xs font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {actor.nameRu || actor.nameEn}
                  </p>
                  {actor.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">{actor.description}</p>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
