import { NextRequest, NextResponse } from 'next/server';

const EUMETSAT_TOKEN_URL = 'https://api.eumetsat.int/token';

// MSG Full Earth Scan layers → EUMETView geoserver (public WMS)
const EUMETVIEW_WMS_URL = 'https://view.eumetsat.int/geoserver/wms';
// MTG Full Disc layers → EUMETSAT Data Store Map WMS (separate endpoint)
const MTG_WMS_URL = 'https://api.eumetsat.int/data/map/wms';

// MSG layers served by view.eumetsat.int
const MSG_LAYERS = new Set([
  'msg_fes:rgb_natural',
  'msg_fes:rgb_naturalenhncd',
  'msg_fes:wv062',
]);

// MTG Full Disc layers served by api.eumetsat.int/data/map/wms
const MTG_LAYERS = new Set([
  'mtg_fd:ir105_hrfi',
  'mtg_fd:rgb_cloudphase',
]);

const ALLOWED_LAYERS = new Set([...MSG_LAYERS, ...MTG_LAYERS]);

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getEumetsatToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  const consumerKey = process.env.EUMETSAT_CONSUMER_KEY;
  const consumerSecret = process.env.EUMETSAT_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('EUMETSAT_CREDENTIALS_MISSING');
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
    // Invalidate cache so next request retries
    cachedToken = null;
    throw new Error(`EUMETSAT_TOKEN_HTTP_${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token ?? data.token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('EUMETSAT_TOKEN_MISSING_FROM_RESPONSE');
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
  // Leaflet sends both lower and upper-case key variants depending on WMS version
  const layers = params.get('layers') ?? params.get('LAYERS') ?? '';

  if (!ALLOWED_LAYERS.has(layers)) {
    return NextResponse.json({ error: 'Unsupported EUMETSAT WMS layer.' }, { status: 400 });
  }

  // Pick the correct upstream WMS base URL based on the product family
  const baseWmsUrl = MTG_LAYERS.has(layers) ? MTG_WMS_URL : EUMETVIEW_WMS_URL;
  const upstream = new URL(baseWmsUrl);

  // Forward all client query params to the upstream WMS
  params.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  // Apply WMS defaults
  upstream.searchParams.set('service', params.get('service') ?? params.get('SERVICE') ?? 'WMS');
  upstream.searchParams.set('version', params.get('version') ?? params.get('VERSION') ?? '1.3.0');
  upstream.searchParams.set('request', params.get('request') ?? params.get('REQUEST') ?? 'GetMap');
  upstream.searchParams.set('format', params.get('format') ?? params.get('FORMAT') ?? 'image/png');
  upstream.searchParams.set('transparent', params.get('transparent') ?? params.get('TRANSPARENT') ?? 'true');
  upstream.searchParams.set('styles', params.get('styles') ?? params.get('STYLES') ?? '');

  try {
    const token = await getEumetsatToken();
    const response = await fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'image/png,image/*,*/*',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`EUMETSAT WMS upstream error: ${response.status} for layer ${layers}`);
      return NextResponse.json(
        { error: 'EUMETSAT WMS upstream error', status: response.status },
        { status: response.status }
      );
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'public, max-age=120, s-maxage=120',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error(`EUMETSAT WMS route error: ${msg}`);
    // Return a transparent 1×1 PNG so Leaflet doesn't break the tile grid
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    return new NextResponse(transparentPixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'X-EUMETSAT-Error': msg.substring(0, 80),
      },
    });
  }
}
