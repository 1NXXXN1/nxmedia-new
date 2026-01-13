# TMDB Migration Summary

## Overview
The application has been migrated from Kinopoisk API to TMDB (The Movie Database) API as the primary data source.

## Key Changes

### 1. New TMDB Provider (`lib/providers/tmdb.ts`)
- Created a new TMDB provider module
- Implements functions for:
  - `tmdbPopular()` - Fetch popular movies/series
  - `tmdbSearch()` - Search movies and TV shows
  - `tmdbDetails()` - Get detailed information with cast/crew

### 2. Updated Client API (`lib/client-api.ts`)
All API functions now use TMDB as the primary source:

- **`fetchTopFilms()`** - Uses TMDB popular movies endpoint
- **`fetchTopSeries()`** - Uses TMDB popular TV shows endpoint  
- **`searchKinopoisk()`** - Uses TMDB multi-search endpoint
- **`fetchFilmDetails()`** - Uses TMDB movie/tv details with external IDs
- **`fetchFilmStaff()`** - Uses TMDB credits endpoint
- **`getKinopoiskIdFromTmdb()`** - New function to convert TMDB ID to Kinopoisk ID via IMDB ID

### 3. Updated Watch Page (`app/watch/[id]/page.tsx`)
- Now fetches all data from TMDB
- Uses TMDB ID as the primary identifier
- Converts TMDB ID to Kinopoisk ID (via IMDB) specifically for the video player iframe
- Only the iframe uses Kinopoisk ID for video playback

### 4. Updated Main API (`lib/api.ts`)
- Simplified to use only TMDB provider
- Removed Kinopoisk provider dependency
- Uses `tmdbPopular()` and `tmdbSearch()` directly

## Data Flow

```
User Request → TMDB API → Get Movie/TV data (by TMDB ID)
                    ↓
            Kinopoisk search by title/year/type (returns KP ID + mediaType)
                    ↓
            Display: TMDB metadata | Video: Kinopoisk ID via iframe
```

## Important Notes

1. **Backward Compatibility**: The `kinopoiskId` field in API responses now contains TMDB IDs for backward compatibility with existing code.

2. **Video Player**: Only the video player iframe uses actual Kinopoisk IDs (obtained from IMDB IDs via TMDB's external_ids endpoint).

3. **Data Source**: All movie information (titles, descriptions, ratings, posters, actors) comes from TMDB.

4. **IMDB Bridge**: TMDB provides IMDB IDs which are used as a bridge to get Kinopoisk IDs for the video player.

5. **Fallback**: If no Kinopoisk ID is found, TMDB ID is used as a fallback for the iframe.

## Environment Variables Required

Ensure `TMDB_API_KEY` or `NEXT_PUBLIC_TMDB_API_KEY` is set in your environment:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

## Benefits

- ✅ More reliable API with better rate limits
- ✅ Better data quality and coverage
- ✅ Multilingual support
- ✅ No quota limitations (compared to unofficial Kinopoisk API)
- ✅ Maintained and documented API
- ✅ Free tier available

## Migration Status

- ✅ TMDB provider created
- ✅ Client API migrated to TMDB
- ✅ Watch page updated with TMDB integration
- ✅ Server API simplified
- ✅ Kinopoisk ID mapping for video player
- ✅ All error handling in place
