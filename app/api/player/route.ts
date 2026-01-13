import { NextResponse } from 'next/server';

// Simple rate limiting (in production, use Redis or similar)
const requestCache = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = requestCache.get(ip) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = requests.filter(time => now - time < 60000);
  
  // Allow max 20 requests per minute per IP
  if (recentRequests.length >= 20) {
    return false;
  }
  
  recentRequests.push(now);
  requestCache.set(ip, recentRequests);
  
  // Clean up old entries every 100 requests
  if (requestCache.size > 1000) {
    requestCache.clear();
  }
  
  return true;
}

export async function GET(request: Request) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Get URL from environment variable (server-side only, never exposed to client)
  const baseUrl = process.env.PLAYER_BASE_URL;
  
  if (!baseUrl) {
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }
  
  const playerUrl = `${baseUrl}?id=${id}&n=0`;
  
  return NextResponse.json({ url: playerUrl }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}
