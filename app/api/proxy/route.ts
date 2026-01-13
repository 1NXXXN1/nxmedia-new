import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  
  console.log(`[Proxy API] Request received with id: ${id}`);
  
  if (!id) {
    console.error('[Proxy API] No ID provided');
    return new NextResponse('Invalid request', { status: 400 });
  }

  const urlTemplate = process.env.PLAYER_URL_TEMPLATE;
  
  if (!urlTemplate) {
    console.error('[Proxy API] PLAYER_URL_TEMPLATE not configured in environment');
    return new NextResponse('Configuration error', { status: 500 });
  }

  // Replace {ID} placeholder with actual kinopoisk ID
  const fullUrl = urlTemplate.replace('{ID}', id);
  
  console.log(`[Proxy API] Generated player URL template (first 30 chars): ${fullUrl.substring(0, 30)}...`);

  // Return HTML that loads the player in an iframe
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
      user-select: none;
    }
    html, body { 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      background: #000; 
    }
    iframe { 
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      border: 0;
    }
  </style>
</head>
<body oncontextmenu="return false;">
  <script>
    (function() {
      // Disable console logs
      if (typeof console !== 'undefined') {
        ['log', 'info', 'warn', 'debug', 'trace'].forEach(function(method) {
          console[method] = function(){};
        });
      }
      
      // Split and encode URL in multiple parts
      const parts = [
        '${Buffer.from(fullUrl.substring(0, 20)).toString('base64')}',
        '${Buffer.from(fullUrl.substring(20, 40)).toString('base64')}',
        '${Buffer.from(fullUrl.substring(40)).toString('base64')}'
      ];
      
      const reconstructUrl = function() {
        return atob(parts[0]) + atob(parts[1]) + atob(parts[2]);
      };
      
      const frame = document.createElement('iframe');
      frame.src = reconstructUrl();
      frame.allowFullscreen = true;
      frame.allow = 'autoplay *; encrypted-media *';
      frame.referrerPolicy = 'no-referrer';
      document.body.appendChild(frame);
      
      // Clear evidence
      setTimeout(function() {
        parts.length = 0;
      }, 1000);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'no-referrer'
    }
  });
}
