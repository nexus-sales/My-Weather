import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const intlProxy = createMiddleware(routing);

// Shared store (Upstash Redis), not in-memory: this app targets serverless
// (Vercel), where an in-memory Map would give every instance its own counter
// and multiply the real quota available to an attacker. If the env vars
// aren't set (e.g. local dev), rate limiting is skipped rather than the app
// refusing to run — but it MUST be configured before a public deployment.
const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = hasUpstash ? Redis.fromEnv() : null;

// /api/ai costs real money per request (Anthropic billing) — much tighter
// than the rest, which only risk exhausting free/quota-limited provider keys.
const aiRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), analytics: true, prefix: 'mw-rl-ai' })
  : null;
const apiRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'), analytics: true, prefix: 'mw-rl-api' })
  : null;

function clientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (!apiRatelimit || !aiRatelimit) {
      // No shared store configured — fail open locally, but this route is
      // unprotected in production until UPSTASH_REDIS_REST_URL/TOKEN are set.
      return NextResponse.next();
    }

    const limiter = pathname.startsWith('/api/ai') ? aiRatelimit : apiRatelimit;
    const { success, limit, remaining, reset } = await limiter.limit(clientIp(request));

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      );
    }

    return NextResponse.next();
  }

  return intlProxy(request);
}

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/api/:path*'],
};
