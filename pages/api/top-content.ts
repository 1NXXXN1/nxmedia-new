import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory cache (for demo; use Redis or similar for production)
const cache: Record<string, { data: any; expires: number }> = {};
const CACHE_TTL = 60 * 10 * 1000; // 10 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;
  if (!type || (type !== 'movie' && type !== 'tv')) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  const cacheKey = `top-${type}`;
  const now = Date.now();
  if (cache[cacheKey] && cache[cacheKey].expires > now) {
    return res.status(200).json(cache[cacheKey].data);
  }
  const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const TMDB_BASE = 'https://api.themoviedb.org/3';
  try {
    const url = `${TMDB_BASE}/${type}/popular?api_key=${TMDB_KEY}&language=ru-RU`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('TMDB error');
    const { results = [] } = await r.json();
    // Filter out Indian content and low rating
    const indianLanguages = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa'];
    const filtered = results.filter((t: any) => !indianLanguages.includes(t.original_language) && (t.vote_average || 0) > 5.0);
    const items = filtered.slice(0, 14).map((t: any) => ({
      id: t.id,
      title: type === 'movie' ? t.title : t.name,
      original: type === 'movie' ? t.original_title : t.original_name,
      poster: t.poster_path ? `https://image.tmdb.org/t/p/w342${t.poster_path}` : '',
      year: (type === 'movie' ? t.release_date : t.first_air_date)?.slice(0, 4),
      rating: t.vote_average,
      type,
    }));
    cache[cacheKey] = { data: { items }, expires: now + CACHE_TTL };
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
