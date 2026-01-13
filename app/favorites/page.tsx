'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import FilmCard from '@/components/FilmCard';
import { useAuth } from '@/lib/auth-context';
import { getLocalFavorites, removeLocalFavorite, addLocalFavorite } from '@/lib/favorites-sync';

export const dynamic = 'force-dynamic';

// Encryption/decryption using base64 with UTF-8 support
const encryptData = (data: string): string => {
  const utf8Bytes = new TextEncoder().encode(data);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
};

const decryptData = (encrypted: string): string => {
  try {
    const binary = atob(encrypted);
    const utf8Bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      utf8Bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(utf8Bytes);
  } catch {
    throw new Error('Invalid encrypted file');
  }
};

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

  if (!mounted) return null;

  const removeFavorite = (id: string, mediaType?: string) => {
    const mt = (mediaType || 'movie') as 'movie' | 'tv';
    removeLocalFavorite(id, mt);
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const exportFavorites = () => {
    const data = JSON.stringify(favorites, null, 2);
    const encrypted = encryptData(data);
    
    const blobData = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blobData);
    
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', `favorites-backup-${new Date().toISOString().split('T')[0]}.dat`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    URL.revokeObjectURL(url);
  };

  const importFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encrypted = e.target?.result as string;
        const decrypted = decryptData(encrypted);
        const imported = JSON.parse(decrypted);
        
        if (Array.isArray(imported)) {
          // Import qilishda har birini localStorage ga qo'shamiz
          imported.forEach((fav: any) => {
            const mediaType = (fav.mediaType || 'movie') as 'movie' | 'tv';
            addLocalFavorite(fav);
          });
          setFavorites(imported);
          alert('Избранное успешно импортировано!');
        } else {
          alert('Некорректный формат файла');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Ошибка при импорте файла');
      }
    };
    reader.readAsText(file);
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Нет избранных</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          Обзор фильмов
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Избранное</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-300 text-sm">Ручное управление избранным:</span>
          <div className="flex gap-2">
            <button
              onClick={exportFavorites}
              disabled={favorites.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              📥 Экспорт
            </button>
            <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer">
              📤 Импорт
              <input
                type="file"
                accept=".dat"
                onChange={importFavorites}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7l mx-auto grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {favorites.map((media, i) => (
          <div key={`${media.id}-${i}`} className="relative group">
            <FilmCard
              id={media.id}
              title={media.title}
              poster={media.poster}
              year={media.year}
              ratingKinopoisk={media.rating}
              ratingImdb={media.imdbRating}
              mediaType={(media as any).mediaType || 'movie'}
              priority={i < 6}
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
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Загрузка...</div>}>
      <FavoritesContent />
    </Suspense>
  );
}
