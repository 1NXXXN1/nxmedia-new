import { NextRequest, NextResponse } from 'next/server';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const page = searchParams.get('page') || '1';

  if (!keyword || !TMDB_KEY) {
    return NextResponse.json({ items: [] });
  }

  try {
    // Search both movies and TV shows in parallel
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(keyword)}&page=${page}&language=ru-RU`),
      fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(keyword)}&page=${page}&language=ru-RU`)
    ]);

    const moviesData = moviesRes.ok ? await moviesRes.json() : { results: [] };
    const tvData = tvRes.ok ? await tvRes.json() : { results: [] };



    // Helper: check if release date is in the future
    const isFutureRelease = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      // Only allow if release date is valid and not in the future
      const today = new Date();
      const releaseDate = new Date(dateStr);
      // Ignore if year is in the future
      if (releaseDate.getFullYear() > today.getFullYear()) return true;
      // Ignore if date is after today
      if (releaseDate > today) return true;
      return false;
    };

    // Combine and map results, filter only those with Russian name, released, and known runtime
    const movies = (moviesData.results || [])
      .filter((item: any) => {
        // title must exist
        if (!item.title) return false;
        // must be released (not in the future)
        if (!item.release_date || isFutureRelease(item.release_date)) return false;
        // must have runtime
        if (!item.runtime && item.runtime !== 0) return false;
        return true;
      })
      .map((item: any) => ({
        kinopoiskId: item.id,
        nameRu: item.title,
        nameEn: item.original_title,
        posterUrlPreview: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '',
        year: item.release_date?.slice(0, 4),
        ratingKinopoisk: item.vote_average,
        ratingImdb: item.vote_average,
        type: 'film',
        mediaType: 'movie'
      }));

    const tvShows = (tvData.results || [])
      .filter((item: any) => {
        // name must exist
        if (!item.name) return false;
        // must be released (not in the future)
        if (!item.first_air_date || isFutureRelease(item.first_air_date)) return false;
        // must have episode_run_time
        if (!item.episode_run_time || item.episode_run_time.length === 0) return false;
        return true;
      })
      .map((item: any) => ({
        kinopoiskId: item.id,
        nameRu: item.name,
        nameEn: item.original_name,
        posterUrlPreview: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '',
        year: item.first_air_date?.slice(0, 4),
        ratingKinopoisk: item.vote_average,
        ratingImdb: item.vote_average,
        type: 'series',
        mediaType: 'tv'
      }));

    // Combine and sort by rating
    const combined = [...movies, ...tvShows].sort((a, b) => 
      (b.ratingKinopoisk || 0) - (a.ratingKinopoisk || 0)
    );

    return NextResponse.json({
      items: combined,
      total: combined.length
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ items: [] });
  }
}
