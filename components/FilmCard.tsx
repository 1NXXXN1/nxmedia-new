'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FilmCardProps {
  id: string | number;
  title: string;
  poster?: string;
  year?: number | string;
  ratingKinopoisk?: number;
  ratingImdb?: number;
  mediaType?: 'movie' | 'tv';
  type?: string;
  priority?: boolean;
  onFavoriteClick?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}

export default function FilmCard({
  id,
  title,
  poster,
  year,
  ratingKinopoisk,
  ratingImdb,
  mediaType,
  type,
  priority = false,
  onFavoriteClick,
  isFavorite = false,
  showFavoriteButton = false
}: FilmCardProps) {
  const mediaTypeResolved = mediaType || (type === 'series' ? 'tv' : 'movie');
  const watchUrl = `/watch/${mediaTypeResolved === 'tv' ? 'series' : 'movie'}/${id}`;

  return (
    <motion.div
      className="group cursor-pointer relative"
    >
      <Link href={watchUrl as any} className="block">
        <div className="aspect-[2/3] relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, 160px"
              priority={priority}
              className="object-cover group-hover:scale-110 transition-transform duration-300 w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-xs">No poster</p>
            </div>
          )}

          {/* Rating Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {ratingKinopoisk && ratingKinopoisk > 0 && (
              <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
                <img src="/kinopoisk-favicon.ico" alt="Kinopoisk" className="w-3 h-3" />
                <span className="font-bold text-orange-400">{ratingKinopoisk.toFixed(1)}</span>
              </div>
            )}
            {ratingImdb && ratingImdb > 0 && (
              <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
                <img src="/imdb-favicon.ico" alt="IMDb" className="w-3 h-3" />
                <span className="font-bold text-yellow-400">{ratingImdb.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Favorite Button */}
          {showFavoriteButton && onFavoriteClick && (
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteClick(e);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm z-10"
            >
              <motion.span
                animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`text-lg block transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300'}`}
              >
                ♥
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* Title and Year */}
        <div className="mt-2 px-1">
          <p className="text-sm font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
            {title}
          </p>
          {year && (
            <p className="text-xs text-gray-400 mt-0.5">{year}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
