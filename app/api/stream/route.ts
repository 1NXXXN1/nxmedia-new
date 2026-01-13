import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  
  if (!id) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const playerUrl = process.env.PLAYER_BASE_URL;
  
  if (!playerUrl) {
    return new NextResponse('Configuration error', { status: 500 });
  }

  try {
    // Fetch from external player and proxy it
    const response = await fetch(`${playerUrl}?id=${id}&n=0`, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        'Referer': playerUrl,
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to load player', { status: response.status });
    }

    const content = await response.text();
    
    // Rewrite any absolute URLs in the content to go through our proxy
    const rewrittenContent = content
      .replace(/https?:\/\/ddbb\.lol/gi, '/api/stream-asset')
      .replace(/https?:\/\/[^"'\s]+/gi, (match) => {
        // Preserve our internal URLs
        if (match.includes('/api/')) return match;
        // Proxy external resources
        return `/api/stream-asset?url=${encodeURIComponent(match)}`;
      });

    return new NextResponse(rewrittenContent, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });
  } catch (error) {
    console.error('Stream error:', error);
    return new NextResponse('Stream error', { status: 500 });
  }
}
