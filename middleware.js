import { NextResponse } from 'next/server';

/**
 * VERY BASIC Edge-compatible rate limiter
 * NOTE: This is "best effort" because Edge function memory is PER-INSTANCE.
 * For true global rate limiting, use @vercel/kv or @upstash/ratelimit.
 */
const rateLimitMap = new Map();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;     // 20 requests per window

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect the specific AI API routes that burn credits
  if (pathname.startsWith('/api/groq') || pathname.startsWith('/api/huggingface')) {
    // Get client IP (Vercel provides this)
    const ip = request.ip || request.headers.get('x-real-ip') || 'anonymous';
    const now = Date.now();
    
    // Get window for this IP
    const userLimit = rateLimitMap.get(ip);

    if (!userLimit) {
      rateLimitMap.set(ip, { count: 1, lastReset: now });
      return NextResponse.next();
    }

    // Reset window if expired
    if (now - userLimit.lastReset > WINDOW_MS) {
      userLimit.count = 1;
      userLimit.lastReset = now;
      return NextResponse.next();
    }

    // Increment count
    userLimit.count++;

    // Check limit
    if (userLimit.count > MAX_REQUESTS) {
      console.warn(`[RateLimit] Blocked IP: ${ip} for path: ${pathname}`);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please slow down and enjoy the cinematic experience responsibly.',
          type: 'RATE_LIMIT_EXCEEDED' 
        }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  return NextResponse.next();
}

// Config to only run on API routes to save on middleware execution time
export const config = {
  matcher: ['/api/groq/:path*', '/api/huggingface/:path*'],
};
