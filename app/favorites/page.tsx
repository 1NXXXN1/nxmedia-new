'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import FilmCard from '@/components/FilmCard';
import ShimmerGrid from '@/components/ShimmerGrid';
import { useAuth } from '@/lib/auth-context';
import { getLocalFavorites, removeLocalFavorite } from '@/lib/favorites-sync';

export const dynamic = 'force-dynamic';

interface Media {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
  rating?: number | null;
  imdbRating?: number | null;
  type: string;
}

function FavoritesContent() {
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'film' | 'series' | 'cartoon'>('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadFavorites = () => {
      // User yo'q bo'lsa, favorites ni bo'shatamiz
      if (!user) {
        setFavorites([]);
        setMounted(true);
        return;
      }
      // User bor bo'lsa, localStorage dan o'qiymiz
      const localFavs = getLocalFavorites();
      setFavorites(localFavs);
      setMounted(true);
    };

    loadFavorites();

    // Custom event tinglaymiz
    const handleFavoritesChanged = () => {
      loadFavorites();
    };
    window.addEventListener('favoritesChanged', handleFavoritesChanged);

    // Storage event listener - boshqa tabda localStorage o'zgarganda
    const handleStorageChange = () => {
      const localFavs = getLocalFavorites();
      setFavorites(localFavs);
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Redirect to main page if user logs out
  useEffect(() => {
    if (mounted && !user) {
      window.location.replace('/');
    }
  }, [mounted, user]);

  if (!mounted) return null;

  const removeFavorite = (id: string, mediaType?: string) => {
    if (!user) return; // User login qilmagan bo'lsa, hech narsa qilmaymiz
    const mt = (mediaType || 'movie') as 'movie' | 'tv';
    removeLocalFavorite(id, mt);
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  // ...existing code...

  const getType = (media: Media) => {
    const mt = (media as any).mediaType || media.type;
    if (mt === 'movie' || mt === 'film') return 'film';
    if (mt === 'tv' || mt === 'series') return 'series';
    if (mt === 'cartoon' || mt === 'anime' || mt === 'multfilm') return 'cartoon';
    return 'film';
  };

  const filteredFavorites = filter === 'all'
    ? favorites
    : favorites.filter((media) => getType(media) === filter);

  if (favorites.length === 0) {
    return (
      <div>
        <ShimmerGrid />
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Нет избранных</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Обзор фильмов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Избранное</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-medium border ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setFilter('all')}
        >Все</button>
        <button
          className={`px-4 py-2 rounded-lg font-medium border ${filter === 'film' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setFilter('film')}
        >Фильмы</button>
        <button
          className={`px-4 py-2 rounded-lg font-medium border ${filter === 'series' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setFilter('series')}
        >Сериалы</button>
        <button
          className={`px-4 py-2 rounded-lg font-medium border ${filter === 'cartoon' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setFilter('cartoon')}
        >Мультфильмы</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {filteredFavorites.map((media, i) => (
          <div key={`${media.id}-${i}`} className="relative group h-full w-full flex flex-col">
            <FilmCard
              id={media.id}
              title={media.title}
              poster={media.poster ?? undefined}
              year={media.year}
              ratingKinopoisk={media.rating ?? undefined}
              ratingImdb={media.imdbRating ?? undefined}
              mediaType={(media as any).mediaType || 'movie'}
              priority={i < 6}
              showFavoriteButton={true}
              isFavorite={true}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFavorite(media.id, (media as any).mediaType);
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition-all z-20 opacity-0 group-hover:opacity-100"
              title="Удалить из избранного"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mb-4" />
          <div className="text-gray-400">Загрузка...</div>
        </div>
      }
    >
      <FavoritesContent />
    </Suspense>
  );
}
