import { NextResponse } from 'next/server';

const BASE = 'https://kinopoiskapiunofficial.tech';
const KEYS = (process.env.KINOPOISK_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

function mapType(kpType?: string, fullData?: any): string {
  // API formatidagi type qiymatlarini normalize qilamiz
  if (kpType === 'TV_SERIES' || kpType === 'MINI_SERIES' || kpType === 'TV_SHOW') return 'series';
  if (kpType === 'CARTOON' || kpType === 'ANIME' || kpType === 'ANIMATED_SERIES') return 'cartoon';
  
  // Agar genres-da 'мультфильм', 'аниме' yoki 'анимационный' bo'lsa
  if (fullData?.genres && Array.isArray(fullData.genres)) {
    const genreNames = fullData.genres.map((g: any) => g.genre?.toLowerCase() || '');
    if (genreNames.some((g: string) => 
      g.includes('мультфильм') || 
      g.includes('аниме') || 
      g.includes('анимация')
    )) {
      return 'cartoon';
    }
  }
  
  return 'film';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  if (KEYS.length === 0) {
    return NextResponse.json(
      { error: 'No API keys configured' },
      { status: 500 }
    );
  }

  // Random key tanlash - load balancing uchun
  const shuffledKeys = [...KEYS].sort(() => Math.random() - 0.5);
  //console.log(`[KP API] Total keys: ${KEYS.length}, Using order: ${shuffledKeys.map(k => k.substring(0, 8)).join(', ')}`);

  let lastError = null;
  let quotaExceeded = false;

  for (const key of shuffledKeys) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: {
          'X-API-KEY': key,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.ok) {
        //console.log(`[KP API] ✅ Success with key: ${key.substring(0, 8)}...`);
        const data = await res.json();
        
        // Agar film ma'lumoti bo'lsa, type'ni normalizatsiya qilamiz
        if (data && typeof data === 'object') {
          const originalType = data.type;
          const mappedType = mapType(data.type, data);
          
          // Agar type mavjud yoki genres bo'lsa, normalize qilamiz
          if (originalType || data.genres) {
            data.type = mappedType;
          }
        }
        
        return NextResponse.json(data);
      }

      // Quota exceeded status codes
      if (res.status === 402 || res.status === 429) {
        quotaExceeded = true;
        lastError = await res.text();
        //console.log(`[KP API] ⚠️  Quota exceeded on key: ${key.substring(0, 8)}...`);
        break; // Don't try other keys, quota is account-wide
      }

      // agar noto'g'ri endpoint bo'lsa → keyingi kalitga o'tmaymiz
      if (res.status === 404) {
        //console.log(`[KP API] 404 Not Found - endpoint yoki key muammo: ${key.substring(0, 8)}...`);
        break;
      }

      //console.log(`[KP API] ❌ Key failed (${res.status}): ${key.substring(0, 8)}...`);
      lastError = await res.text();

    } catch (e) {
      // keyingi API key bilan davom etamiz
      lastError = String(e);
      continue;
    }
  }

  // Return appropriate error based on what happened
  if (quotaExceeded) {
    return NextResponse.json(
      { error: 'API quota exceeded. Please try again tomorrow.', details: lastError },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: 'Kinopoisk API failed (check endpoint or keys)', details: lastError },
    { status: 502 }
  );
}
