'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchTopFilms, fetchTopSeries } from '@/lib/client-api';
import FilmCard from '@/components/FilmCard';
import { useAuth } from '@/lib/auth-context';
import { 
  addLocalFavorite, 
  removeLocalFavorite, 
  isLocalFavorite
} from '@/lib/favorites-sync';

export const dynamic = 'force-dynamic';

interface Film {
  kinopoiskId: number;
  nameRu?: string;
  nameEn?: string;
  posterUrl?: string;
  posterUrlPreview?: string;
  year?: number;
  type?: string;
  ratingKinopoisk?: number;
  ratingImdb?: number;
  genres?: Array<{ genre: string }>;
}

function formatTypeToRussian(type?: string): string {
  if (!type) return 'Фильм';
  const normalized = type.toLowerCase();
  if (normalized === 'series' || normalized === 'tv_series') return 'Сериал';
  if (normalized === 'cartoon' || normalized === 'anime') return 'Мультфильм';
  return 'Фильм';
}

function normalizeType(type?: string, genres?: any[]): string {
  if (!type) {
    if (genres?.some((g: any) =>
      g.genre?.toLowerCase().includes('мультфильм') ||
      g.genre?.toLowerCase().includes('аниме') ||
      g.genre?.toLowerCase().includes('анимация')
    )) {
      return 'cartoon';
    }
    return 'film';
  }

  const normalized = type.toLowerCase();
  if (normalized === 'series' || normalized === 'tv_series' || normalized === 'tv_show' || normalized === 'mini_series') return 'series';
  if (normalized === 'cartoon' || normalized === 'anime' || normalized === 'animated_series') return 'cartoon';

  if (genres?.some((g: any) =>
    g.genre?.toLowerCase().includes('мультфильм') ||
    g.genre?.toLowerCase().includes('аниме') ||
    g.genre?.toLowerCase().includes('анимация')
  )) {
    return 'cartoon';
  }

  return 'film';
}

export default function Home() {
  const { user } = useAuth();

  const { data: filmsData, isLoading: filmsLoading } = useQuery({
    queryKey: ['top-films'],
    queryFn: fetchTopFilms,
    staleTime: 1000 * 60 * 10, // 10 minut cache
  });

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['top-series'],
    queryFn: fetchTopSeries,
    staleTime: 1000 * 60 * 10,
  });

  const loading = filmsLoading || seriesLoading;
  const films = (filmsData?.items || []).map((f: any) => ({
    ...f,
    type: normalizeType(f.type, f.genres)
  }));
  const series = (seriesData?.items || []).map((s: any) => ({
    ...s,
    type: normalizeType(s.type, s.genres) || 'series'
  }));

  const FilmCardWithFavorite = ({ film, idx }: { film: Film; idx: number }) => {
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
      const checkFavorite = () => {
        // Agar user yo'q bo'lsa, darhol false qilamiz
        if (!user) {
          setIsFav(false);
          return;
        }
        
        const mediaType = (film as any).mediaType || (film.type === 'series' ? 'tv' : 'movie');
        const favStatus = isLocalFavorite(String(film.kinopoiskId), mediaType);
        setIsFav(favStatus);
      };
      
      checkFavorite();
      
      // Custom event tinglaymiz
      const handleFavoritesChanged = () => {
        checkFavorite();
      };
      
      window.addEventListener('favoritesChanged', handleFavoritesChanged);
      
      return () => {
        window.removeEventListener('favoritesChanged', handleFavoritesChanged);
      };
    }, [film.kinopoiskId, user]);

    const toggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const mediaType = (film as any).mediaType || (film.type === 'series' ? 'tv' : 'movie');
      
      // Darhol localStorage ni yangilaymiz
      if (isFav) {
        removeLocalFavorite(String(film.kinopoiskId), mediaType);
        setIsFav(false);
      } else {
        const newFavorite = {
          id: film.kinopoiskId,
          mediaType: mediaType,
          title: film.nameRu || film.nameEn,
          poster: film.posterUrlPreview,
          rating: film.ratingKinopoisk,
          imdbRating: film.ratingImdb || null,
          year: film.year,
          type: 'film'
        };
        addLocalFavorite(newFavorite);
        setIsFav(true);
      }
      
      // Background da sync bo'ladi avtomatik
    };

    return (
      <FilmCard
        id={film.kinopoiskId}
        title={film.nameRu || film.nameEn || 'Film'}
        poster={film.posterUrl || film.posterUrlPreview}
        year={film.year}
        ratingKinopoisk={film.ratingKinopoisk}
        ratingImdb={film.ratingImdb}
        mediaType={(film as any).mediaType || (film.type === 'series' ? 'tv' : 'movie')}
        type={film.type}
        priority={idx < 3}
        onFavoriteClick={toggleFavorite}
        isFavorite={isFav}
        showFavoriteButton={!!user}
      />
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Добро пожаловать в NXMedia</h1>
        <p className="text-gray-300 text-lg">Смотрите популярные фильмы и сериалы онлайн</p>
      </div> */}

      {films.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🎬 Популярные Фильмы</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 md:grid-rows-2 gap-4">
            {films.slice(0, 14).map((film, i) => (
              <FilmCardWithFavorite key={film.kinopoiskId} film={film} idx={i} />
            ))}
            {Array.from({ length: 14 - films.slice(0, 14).length }).map((_, idx) => (
              <div key={`empty-film-${idx}`} />
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📺 Популярные Сериалы</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 md:grid-rows-2 gap-4">
            {series.slice(0, 14).map((s, i) => (
              <FilmCardWithFavorite key={s.kinopoiskId} film={s} idx={i} />
            ))}
            {Array.from({ length: 14 - series.slice(0, 14).length }).map((_, idx) => (
              <div key={`empty-series-${idx}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}