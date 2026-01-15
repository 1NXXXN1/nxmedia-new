'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  profile_path?: string;
  known_for_department?: string;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  character?: string;
}

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const ITEMS_PER_PAGE = 21;

  const { data: person, isLoading: loading } = useQuery({
    queryKey: ['person-details', id],
    queryFn: async () => {
      if (!TMDB_KEY) return null;
      const personRes = await fetch(
        `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_KEY}&language=ru-RU`,
        { cache: 'no-store' }
      );
      if (personRes.ok) {
        const personData = await personRes.json();
        if (!personData.biography || personData.biography.trim() === '') {
          const personEnRes = await fetch(
            `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_KEY}&language=en-US`,
            { cache: 'no-store' }
          );
          if (personEnRes.ok) {
            const personEnData = await personEnRes.json();
            personData.biography = personEnData.biography || '';
          }
        }
        return personData;
      }
      return null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  const { data: creditsData } = useQuery({
    queryKey: ['person-credits', id],
    queryFn: async () => {
      if (!TMDB_KEY) return [];
      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${TMDB_KEY}&language=ru-RU`,
        { cache: 'no-store' }
      );
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        const allCreditsList = [...(creditsData.cast || []), ...(creditsData.crew || [])];
        const uniqueMap = new Map();
        allCreditsList.forEach((c: any) => {
          const key = `${c.id}-${c.media_type}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, c);
          }
        });
        const sorted = Array.from(uniqueMap.values())
          .filter((c: any) => c.media_type === 'movie' || c.media_type === 'tv')
          .filter((c: any) => (c.vote_average || 0) >= 6.0)
          .sort((a: any, b: any) => {
            const popA = a.popularity || 0;
            const popB = b.popularity || 0;
            return popB - popA;
          });
        return sorted;
      }
      return [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  const allCredits = creditsData || [];
  const [page, setPage] = useState(1);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [hasMore, setHasMore] = useState(false);

  // When allCredits changes, always reset page to 1 (but do not update credits/hasMore here)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCredits]);

  // When page or allCredits changes, update credits and hasMore
  useEffect(() => {
    const newCredits = allCredits.slice(0, page * ITEMS_PER_PAGE);
    if (credits.length !== newCredits.length) {
      setCredits(newCredits);
    }
    const newHasMore = allCredits.length > page * ITEMS_PER_PAGE;
    if (hasMore !== newHasMore) {
      setHasMore(newHasMore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, allCredits]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Информация не найдена</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Photo */}
          <div>
            {person.profile_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.name}
                className="w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 rounded-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
              {person.known_for_department && (
                <p className="text-gray-400">{person.known_for_department}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {person.birthday && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Дата рождения</div>
                  <div className="font-semibold">{new Date(person.birthday).toLocaleDateString('ru-RU')}</div>
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Место рождения</div>
                  <div className="font-semibold">{person.place_of_birth}</div>
                </div>
              )}
            </div>

            {person.biography && (
              <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                <h3 className="text-sm font-bold mb-3">Биография</h3>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filmography */}
      {credits.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Фильмография</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {credits.map((credit) => {
              const mediaType = credit.media_type === 'tv' ? 'series' : 'movie';
              const watchUrl = `/watch/${mediaType}/${credit.id}`;
              
              return (
              <Link
                key={`${credit.id}-${credit.media_type}`}
                href={watchUrl as any}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                    {credit.poster_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`}
                        alt={credit.title || credit.name || ''}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                    {credit.vote_average && credit.vote_average > 0 && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
                          <img src="/kinopoisk-favicon.ico" alt="Kinopoisk" className="w-3 h-3" />
                          <span className="font-bold text-orange-400">{credit.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
                          <img src="/imdb-favicon.ico" alt="IMDb" className="w-3 h-3" />
                          <span className="font-bold text-yellow-400">{credit.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {credit.title || credit.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {credit.release_date?.slice(0, 4) || credit.first_air_date?.slice(0, 4)}
                  </p>
                  {credit.character && (
                    <p className="text-xs text-gray-500 line-clamp-1">{credit.character}</p>
                  )}
                </motion.div>
              </Link>
            )})}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <motion.button
                onClick={() => {
                  const nextPage = page + 1;
                  const newCredits = allCredits.slice(0, nextPage * ITEMS_PER_PAGE);
                  setCredits(newCredits);
                  setPage(nextPage);
                  setHasMore(newCredits.length < allCredits.length);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Загрузить ещё
              </motion.button>
            </div>
          )}
          
          {/* Stats */}
          <p className="text-center text-gray-400 text-sm">
            Показано {credits.length} из {allCredits.length} работ
          </p>
        </div>
      )}
    </div>
  );
}
