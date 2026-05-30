import { NextRequest, NextResponse } from 'next/server';

const EUMETSAT_TOKEN_URL = 'https://api.eumetsat.int/token';
const EUMETVIEW_WMS_URL = 'https://view.eumetsat.int/geoserver/wms';

const ALLOWED_LAYERS = new Set([
  'msg_fes:rgb_natural',
  'msg_fes:rgb_naturalenhncd',
  'msg_fes:wv062',
  'mtg_fd:ir105_hrfi',
  'mtg_fd:rgb_cloudphase',
]);

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getEumetsatToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  const consumerKey = process.env.EUMETSAT_CONSUMER_KEY;
  const consumerSecret = process.env.EUMETSAT_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('EUMETSAT credentials are not configured.');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await fetch(EUMETSAT_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`EUMETSAT token request failed with ${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token ?? data.token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('EUMETSAT token response did not include an access token.');
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  cachedToken = {
    value: token,
    expiresAt: now + Math.max(60, expiresIn - 60) * 1000,
  };

  return token;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const layers = params.get('layers') ?? params.get('LAYERS') ?? '';

  if (!ALLOWED_LAYERS.has(layers)) {
    return NextResponse.json({ error: 'Unsupported EUMETSAT WMS layer.' }, { status: 400 });
  }

  const upstream = new URL(EUMETVIEW_WMS_URL);
  params.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  upstream.searchParams.set('service', params.get('service') ?? 'WMS');
  upstream.searchParams.set('version', params.get('version') ?? '1.3.0');
  upstream.searchParams.set('request', params.get('request') ?? 'GetMap');
  upstream.searchParams.set('format', params.get('format') ?? 'image/png');
  upstream.searchParams.set('transparent', params.get('transparent') ?? 'true');
  upstream.searchParams.set('styles', params.get('styles') ?? '');
  upstream.searchParams.set('requestor', params.get('requestor') ?? 'myweather');

  try {
    const token = await getEumetsatToken();
    const response = await fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'image/png,image/*,*/*',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'EUMETSAT WMS request failed', status: response.status },
        { status: response.status }
      );
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reach EUMETSAT WMS.' },
      { status: 502 }
    );
  }
}
