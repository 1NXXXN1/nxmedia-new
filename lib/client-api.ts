/**
 * Client API - TMDB Integration
 */

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Country name translation to Russian
const COUNTRY_RU: Record<string, string> = {
  'United States of America': 'США',
  'United Kingdom': 'Великобритания',
  'Russia': 'Россия',
  'France': 'Франция',
  'Germany': 'Германия',
  'Italy': 'Италия',
  'Spain': 'Испания',
  'Canada': 'Канада',
  'Japan': 'Япония',
  'South Korea': 'Южная Корея',
  'China': 'Китай',
  'India': 'Индия',
  'Australia': 'Австралия',
  'Brazil': 'Бразилия',
  'Mexico': 'Мексика',
  'Argentina': 'Аргентина',
  'Netherlands': 'Нидерланды',
  'Belgium': 'Бельгия',
  'Switzerland': 'Швейцария',
  'Austria': 'Австрия',
  'Sweden': 'Швеция',
  'Norway': 'Норвегия',
  'Denmark': 'Дания',
  'Finland': 'Финляндия',
  'Poland': 'Польша',
  'Czech Republic': 'Чехия',
  'Ireland': 'Ирландия',
  'New Zealand': 'Новая Зеландия',
  'South Africa': 'ЮАР',
  'Turkey': 'Турция',
  'Israel': 'Израиль',
  'Thailand': 'Таиланд',
  'Vietnam': 'Вьетнам',
  'Philippines': 'Филиппины',
  'Indonesia': 'Индонезия',
  'Malaysia': 'Малайзия',
  'Singapore': 'Сингапур',
  'Hong Kong': 'Гонконг',
  'Taiwan': 'Тайвань',
  'Greece': 'Греция',
  'Portugal': 'Португалия',
  'Romania': 'Румыния',
  'Hungary': 'Венгрия',
  'Ukraine': 'Украина',
  'Belarus': 'Беларусь',
  'Kazakhstan': 'Казахстан',
  'Egypt': 'Египет',
  'Iran': 'Иран',
  'Pakistan': 'Пакистан',
  'Bangladesh': 'Бангладеш',
  'Colombia': 'Колумбия',
  'Chile': 'Чили',
  'Peru': 'Перу',
  'Venezuela': 'Венесуэла'
};

// Helper to map TMDB items
const mapTmdbItem = (t: any, type: 'movie' | 'tv') => ({
  kinopoiskId: t.id,
  filmId: t.id,
  tmdbId: t.id,
  nameRu: type === 'movie' ? t.title : t.name,
  nameOriginal: type === 'movie' ? t.original_title : t.original_name,
  posterUrlPreview: t.poster_path ? `https://image.tmdb.org/t/p/w342${t.poster_path}` : '',
  year: (type === 'movie' ? t.release_date : t.first_air_date)?.slice(0,4),
  type: type === 'movie' ? 'film' : 'series',
  mediaType: type,
  ratingKinopoisk: t.vote_average,
  ratingImdb: t.vote_average
});

export async function fetchTopFilms(){ 
  if (!TMDB_KEY) return { items: [] };
  try {
    const r = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ru-RU`, { cache: 'no-store' });
    if (!r.ok) return { items: [] };
    const { results = [] } = await r.json();
    // Filter out Indian movies and movies with rating below 50% (5.0 on TMDB scale)
    const indianLanguages = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa'];
    const filtered = results.filter((t: any) => !indianLanguages.includes(t.original_language) && (t.vote_average || 0) > 5.0);
    return { items: filtered.slice(0, 12).map((t: any) => mapTmdbItem(t, 'movie')) };
  } catch (e) {
    console.error('TMDB top films error:', e);
    return { items: [] };
  }
}

export async function fetchTopSeries(){ 
  if (!TMDB_KEY) return { items: [] };
  try {
    const r = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=ru-RU`, { cache: 'no-store' });
    if (!r.ok) return { items: [] };
    const { results = [] } = await r.json();
    // Filter out Indian series and series with rating below 50% (5.0 on TMDB scale)
    const indianLanguages = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa'];
    const filtered = results.filter((t: any) => !indianLanguages.includes(t.original_language) && (t.vote_average || 0) > 5.0);
    return { items: filtered.map((t: any) => mapTmdbItem(t, 'tv')) };
  } catch (e) {
    console.error('TMDB top series error:', e);
    return { items: [] };
  }
}

export async function searchKinopoisk(keyword: string, page = 1){
  if (!TMDB_KEY) return { items: [] };
  try {
    const r = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(keyword)}&page=${page}&language=ru-RU`, { cache: 'no-store' });
    if (!r.ok) return { items: [] };
    const { results = [] } = await r.json();
    // Show content with posters
    return {
      items: results
        .filter((t: any) => t.media_type !== 'person' && t.poster_path)
        .slice(0, 15)
        .map((t: any) => ({
          kinopoiskId: t.id,
          filmId: t.id,
          tmdbId: t.id,
          nameRu: t.title || t.name,
          nameOriginal: t.original_title || t.original_name,
          posterUrlPreview: t.poster_path ? `https://image.tmdb.org/t/p/w342${t.poster_path}` : '',
          year: (t.release_date || t.first_air_date)?.slice(0,4),
          type: t.media_type === 'tv' ? 'series' : 'film',
          ratingKinopoisk: t.vote_average,
          ratingImdb: t.vote_average
        }))
    };
  } catch (e) {
    console.error('TMDB search error:', e);
    return { items: [] };
  }
}

export async function searchFilmsByFilters(params: {
  countries?: number[];
  genres?: number[];
  order?: string;
  type?: string;
  ratingFrom?: number;
  ratingTo?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
}) {
  if (!TMDB_KEY) return { items: [] };
  
  try {
    const mediaType = params.type === 'TV_SERIES' ? 'tv' : 'movie';
    const isAnimation = params.type === 'CARTOON';
    const endpoint = `${TMDB_BASE}/discover/${mediaType}`;
    
    const query = new URLSearchParams({
      api_key: TMDB_KEY,
      language: 'ru-RU',
      page: String(params.page || 1)
    });
    
    // Genres (add animation genre 16 for cartoons)
    const genres = isAnimation 
      ? (params.genres?.length ? [...params.genres, 16] : [16])
      : params.genres;
    if (genres?.length) query.append('with_genres', genres.join(','));
    
    // Countries (inline mapping)
    if (params.countries?.length) {
      const countryMap: Record<number, string> = {
        1: 'US', 2: 'RU', 3: 'GB', 4: 'FR', 5: 'DE', 6: 'IT', 7: 'ES',
        8: 'CA', 9: 'JP', 10: 'KR', 11: 'CN', 12: 'IN', 13: 'AU', 14: 'BR', 15: 'MX'
      };
      const isoCodes = params.countries.map(id => countryMap[id]).filter(Boolean);
      if (isoCodes.length) query.append('with_origin_country', isoCodes.join('|'));
    }
    
    if (params.order === 'RATING') {
      query.append('sort_by', 'vote_average.desc');
      query.append('vote_count.gte', '50');
    } else if (params.order === 'YEAR') {
      query.append('sort_by', mediaType === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc');
    } else if (params.order === 'NUM_VOTE') {
      query.append('sort_by', 'vote_count.desc');
    } else {
      query.append('sort_by', 'popularity.desc');
    }
    
    // Only allow Russian and English language content (with Russian posters)
    query.append('with_original_language', 'ru|en');
    
    if (params.yearFrom) {
      query.append(mediaType === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte', `${params.yearFrom}-01-01`);
    }
    if (params.yearTo) {
      query.append(mediaType === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte', `${params.yearTo}-12-31`);
    }
    
    if (params.ratingFrom) {
      query.append('vote_average.gte', String(params.ratingFrom));
    }
    if (params.ratingTo) {
      query.append('vote_average.lte', String(params.ratingTo));
    }
    
    const r = await fetch(`${endpoint}?${query.toString()}`, { cache: 'no-store' });
    if (!r.ok) return { items: [] };
    
    const data = await r.json();
    return {
      items: (data.results || [])
        .filter((t: any) => t.poster_path)
        .map((t: any) => ({
          kinopoiskId: t.id,
          filmId: t.id,
          tmdbId: t.id,
          nameRu: t.title || t.name,
          nameOriginal: t.original_title || t.original_name,
          posterUrlPreview: t.poster_path ? `https://image.tmdb.org/t/p/w342${t.poster_path}` : '',
          posterUrl: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : '',
          year: (t.release_date || t.first_air_date) ? Number((t.release_date || t.first_air_date).slice(0, 4)) : undefined,
          type: isAnimation ? 'cartoon' : (mediaType === 'tv' ? 'series' : 'film'),
          ratingKinopoisk: t.vote_average,
          ratingImdb: t.vote_average
        }))
    };
  } catch (e) {
    console.error('TMDB search by filters error:', e);
    return { items: [] };
  }
}

export async function fetchFilmDetails(filmId: number, type: 'movie' | 'tv') {
  if (!TMDB_KEY) return null;
  
  try {
    // Fetch data for specified type only
    const endpoint = type === 'movie' ? `movie/${filmId}` : `tv/${filmId}`;
    const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${TMDB_KEY}&language=ru-RU`, { cache: 'no-store' });
    
    if (!res.ok) {
      console.error(`[fetchFilmDetails] TMDB ${type} ${filmId} not found`);
      return null;
    }
    
    const data = await res.json();
    
    // Validate data based on type
    const isValid = type === 'movie' ? data.title : data.name;
    if (!isValid) {
      console.error(`[fetchFilmDetails] Invalid ${type} data for ${filmId}`);
      return null;
    }
    
    console.log(`[fetchFilmDetails] TMDB ${filmId} loaded as ${type}: ${data.title || data.name}`);
    
    return {
      kinopoiskId: data.id,
      filmId: data.id,
      tmdbId: data.id,
      nameRu: data.title || data.name,
      nameEn: data.original_title || data.original_name,
      nameOriginal: data.original_title || data.original_name,
      posterUrlPreview: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : '',
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
      description: data.overview,
      year: data.release_date ? Number(data.release_date.slice(0, 4)) : 
            data.first_air_date ? Number(data.first_air_date.slice(0, 4)) : undefined,
      ratingKinopoisk: data.vote_average,
      ratingImdb: data.vote_average,
      filmLength: data.runtime || (data.episode_run_time && data.episode_run_time[0]),
      genres: (data.genres || []).map((g: any) => ({ id: g.id, genre: g.name })),
      countries: (data.production_countries || []).map((c: any) => ({ 
        country: COUNTRY_RU[c.name] || c.name 
      })),
      type: type === 'tv' ? 'series' : 'film',
      mediaType: type,
      // TV series specific data
      numberOfSeasons: type === 'tv' ? data.number_of_seasons : undefined,
      numberOfEpisodes: type === 'tv' ? data.number_of_episodes : undefined,
      status: data.status,
      lastAirDate: type === 'tv' ? data.last_air_date : undefined
    };
  } catch (e) {
    console.error('TMDB fetch error:', e);
    return null;
  }
}

export async function fetchFilmStaff(filmId: number, mediaType: 'movie' | 'tv' = 'movie') {
  if (!TMDB_KEY) return { items: [] };
  
  const types: ('movie' | 'tv')[] = mediaType === 'movie' ? ['movie', 'tv'] : ['tv', 'movie'];
  
  for (const type of types) {
    try {
      const r = await fetch(`${TMDB_BASE}/${type}/${filmId}/credits?api_key=${TMDB_KEY}&language=ru-RU`, { cache: 'no-store' });
      if (!r.ok) continue;
      
      const data = await r.json();
      return {
        items: [
          ...(data.cast || []).slice(0, 10).map((p: any) => ({
            kinopoiskId: p.id,
            nameRu: p.name,
            nameEn: p.name,
            nameOriginal: p.name,
            posterUrl: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : '',
            professionKey: 'ACTOR',
            description: p.character || ''
          })),
          ...(data.crew || []).filter((p: any) => ['Director', 'Screenplay', 'Writer'].includes(p.job)).slice(0, 5).map((p: any) => ({
            kinopoiskId: p.id,
            nameRu: p.name,
            nameEn: p.name,
            nameOriginal: p.name,
            posterUrl: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : '',
            professionKey: p.job === 'Director' ? 'DIRECTOR' : 'WRITER',
            description: p.job || ''
          }))
        ]
      };
    } catch (e) {
      continue;
    }
  }
  
  console.error('TMDB staff not found:', filmId);
  return { items: [] };
}

export async function getKinopoiskIdFromTmdb(tmdbId: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<{ id: string; type: 'movie' | 'tv' }> {
  /**
   * NEW PIPELINE: TMDB ID → IMDb ID → Kinopoisk ID
   * 
   * 1. Get TMDB details and external IDs (IMDb ID)
   * 2. Search Kinopoisk by IMDb ID
   * 3. Fallback: keyword search if IMDb lookup fails
   */
  
  if (!TMDB_KEY) {
    console.warn('[KP ID Search] No TMDB key, returning tmdbId');
    return { id: String(tmdbId), type: mediaType };
  }
  
  console.log(`[KP ID Search] ===========================================`);
  console.log(`[KP ID Search] Pipeline: TMDB ${tmdbId} (${mediaType}) → IMDb ID → KP ID`);
  console.log(`[KP ID Search] ===========================================`);
  
  const types: ('movie' | 'tv')[] = mediaType === 'movie' ? ['movie'] : ['tv'];
  
  // Helper: parse year safely
  const parseYear = (y: any): number | null => {
    if (typeof y === 'number' && Number.isFinite(y)) return y;
    if (typeof y === 'string') {
      const n = Number(y);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  // Helper: check if TMDB has animation genre (16)
  const hasAnimationGenre = (tmdbGenres: any): boolean => {
    if (!Array.isArray(tmdbGenres)) return false;
    return tmdbGenres.some((g: any) => g?.id === 16 || (typeof g?.name === 'string' && /animation|анимац/i.test(g.name)));
  };

  // Helper: check if KP film has animation genre
  const isKpAnimationCandidate = (kpFilm: any): boolean => {
    const genres = Array.isArray(kpFilm?.genres) ? kpFilm.genres : [];
    return genres.some((g: any) => typeof g?.genre === 'string' && /мульт|аниме|анимац/i.test(g.genre));
  };

  // Helper: score and pick best KP candidate
  const pickBestCandidate = (films: any[], opts: { type: 'movie' | 'tv'; year: number | null; wantsAnimation: boolean }) => {
    const candidates = Array.isArray(films) ? films : [];
    
    // First, filter by type match - only consider exact type matches
    const typeMatched = candidates.filter(f => {
      if (!f?.filmId && !f?.kinopoiskId) return false;
      return opts.type === 'tv' ? f.type === 'TV_SERIES' : f.type !== 'TV_SERIES';
    });
    
    // If we have type-matched candidates, use only those
    const candidatesToScore = typeMatched.length > 0 ? typeMatched : candidates;
    
    let best: any = null;
    let bestScore = -Infinity;

    for (const f of candidatesToScore) {
      if (!f?.filmId && !f?.kinopoiskId) continue;

      const kpYear = parseYear(f.year);
      const isTypeMatch = opts.type === 'tv' ? f.type === 'TV_SERIES' : f.type !== 'TV_SERIES';

      let score = 0;
      // Type match is critical - heavily prioritize it
      if (isTypeMatch) score += 1000;
      else score -= 500; // Strong penalty for type mismatch

      if (opts.year != null && kpYear != null) {
        const diff = Math.abs(kpYear - opts.year);
        if (diff === 0) score += 80;
        else if (diff === 1) score += 60;
        else if (diff <= 3) score += 30;
        else score -= diff * 10;
      }

      if (opts.wantsAnimation && isKpAnimationCandidate(f)) score += 25;
      if (!opts.wantsAnimation && isKpAnimationCandidate(f)) score -= 5;

      if (score > bestScore) {
        bestScore = score;
        best = f;
      }
    }

    return best;
  };
  
  // Try each media type (movie/tv)
  for (const type of types) {
    try {
      console.log(`[KP ID Search] Step 1: Fetching TMDB ${type} details and external IDs...`);
      
      // Fetch TMDB details and external IDs in parallel
      const [detailsRes, externalRes] = await Promise.all([
        fetch(`${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=ru-RU`, { cache: 'no-store' }).catch(() => null),
        fetch(`${TMDB_BASE}/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`, { cache: 'no-store' }).catch(() => null)
      ]);
      
      if (!detailsRes?.ok) {
        console.log(`[KP ID Search] TMDB ${type} details request failed`);
        continue;
      }
      
      const tmdbData = await detailsRes.json();
      const titleRu = tmdbData.title || tmdbData.name;
      const titleOriginal = tmdbData.original_title || tmdbData.original_name;
      const year = tmdbData.release_date ? Number(tmdbData.release_date.slice(0, 4)) : 
                   tmdbData.first_air_date ? Number(tmdbData.first_air_date.slice(0, 4)) : null;
      const wantsAnimation = hasAnimationGenre(tmdbData.genres);
      
      console.log(`[KP ID Search] TMDB Info: "${titleRu}" (${year}), Animation: ${wantsAnimation}`);
      
      // Try IMDb ID lookup first
      if (externalRes?.ok) {
        const externalData = await externalRes.json();
        const imdbId = externalData.imdb_id;
        
        if (imdbId && typeof imdbId === 'string' && imdbId.startsWith('tt')) {
          console.log(`[KP ID Search] Step 2: IMDb ID found: ${imdbId}`);
          console.log(`[KP ID Search] Step 3: Searching Kinopoisk by IMDb ID...`);
          
          try {
            const kpByImdbUrl = `/api/kp?path=${encodeURIComponent(`/api/v2.2/films?imdbId=${imdbId}`)}`;
            const kpImdbRes = await fetch(kpByImdbUrl, { cache: 'no-store' }).catch(() => null);
            
            if (kpImdbRes?.ok) {
              const kpImdbData = await kpImdbRes.json();
              const items = kpImdbData.items || [];
              
              console.log(`[KP ID Search] IMDb search returned ${items.length} result(s)`);
              
              if (items.length > 0) {
                // Pick best match (prefer type match + year proximity)
                const best = pickBestCandidate(items, { type, year, wantsAnimation });
                if (best?.kinopoiskId) {
                  console.log(`[KP ID Search] ✓ SUCCESS via IMDb: KP ID ${best.kinopoiskId} (${best.nameRu}, ${best.year})`);
                  return { id: String(best.kinopoiskId), type };
                }
              }
            }
          } catch (e) {
            console.warn('[KP ID Search] IMDb lookup failed:', e);
          }
        } else {
          console.log(`[KP ID Search] No valid IMDb ID found in TMDB external_ids`);
        }
      }
      
      // Fallback: keyword search
      console.log('[KP ID Search] Step 4: Fallback to keyword search...');
      
      if (!titleRu && !titleOriginal) continue;
      
      const titlesToTry = [titleRu, titleOriginal].filter(Boolean);
      
      for (const searchTitle of titlesToTry) {
        try {
          const searchUrl = `/api/kp?path=${encodeURIComponent(`/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(searchTitle)}`)}`;
          console.log(`[KP ID Search] Searching: "${searchTitle}"`);
          
          const kpRes = await fetch(searchUrl, { cache: 'no-store' }).catch(() => null);
          
          if (kpRes?.ok) {
            const kpData = await kpRes.json();
            const films = kpData.films || [];
            console.log(`[KP ID Search] Found ${films.length} results`);
            
            if (films.length > 0) {
              const best = pickBestCandidate(films, { type, year, wantsAnimation });
              if (best?.filmId) {
                console.log(`[KP ID Search] ✓ SUCCESS via keyword: KP ID ${best.filmId} (${best.nameRu}, ${best.year})`);
                return { id: String(best.filmId), type };
              }
            }
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.error(`[KP ID Search] Error for type ${type}:`, e);
      continue;
    }
  }
  
  console.error(`[KP ID Search] ✗ FAILED: Kinopoisk ID not found for TMDB ID ${tmdbId}`);
  console.warn(`[KP ID Search] Player will be unavailable`);
  return { id: String(tmdbId), type: mediaType };
}
