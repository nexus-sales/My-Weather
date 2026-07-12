import { NextRequest, NextResponse } from 'next/server';

const EUMETSAT_TOKEN_URL = 'https://api.eumetsat.int/token';

// Both MSG and MTG layers are served from the same public EUMETView geoserver.
// Verified live: api.eumetsat.int/data/map/wms (the "MTG Data Store Map WMS"
// this route used to send MTG layers to) 404s on EVERY request, including
// GetCapabilities and known-good layers — that endpoint has never worked
// for any MTG layer added to this route, they just went unnoticed because
// no frontend component rendered them. view.eumetsat.int/geoserver/wms
// serves ir105_hrfi, rgb_cloudphase, li_afa, rgb_dust and rgb_geocolour
// directly (confirmed via its own GetCapabilities + live GetMap requests),
// and needs no auth token at all — it's a public WMS, same as MSG.
const EUMETVIEW_WMS_URL = 'https://view.eumetsat.int/geoserver/wms';

// MSG layers
const MSG_LAYERS = new Set([
  'msg_fes:rgb_naturalenhncd',
  'msg_fes:wv062',
]);

// MTG Full Disc layers
const MTG_LAYERS = new Set([
  'mtg_fd:ir105_hrfi',
  'mtg_fd:rgb_cloudphase',
  'mtg_fd:li_afa',           // Accumulated Flash Area (lightning), updates every 5 min
  'mtg_fd:rgb_dust',         // Dust RGB — Saharan dust / volcanic ash
  'mtg_fd:rgb_geocolour',    // GeoColour RGB
]);

const ALLOWED_LAYERS = new Set([...MSG_LAYERS, ...MTG_LAYERS]);

let cachedToken: { value: string; expiresAt: number } | null = null;

// view.eumetsat.int/geoserver/wms is a public WMS and doesn't require this
// token at all (verified live). Kept best-effort in case EUMETSAT ever
// starts requiring it, or credentials happen to be configured anyway — but
// its absence or failure must never block serving the tile, since the tile
// works fine without it.
async function getEumetsatToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  const consumerKey = process.env.EUMETSAT_CONSUMER_KEY;
  const consumerSecret = process.env.EUMETSAT_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return null;
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
    return null;
  }

  const data = await response.json();
  const token = data.access_token ?? data.token;
  if (typeof token !== 'string' || token.length === 0) {
    return null;
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

  const upstream = new URL(EUMETVIEW_WMS_URL);

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
    const token = await getEumetsatToken().catch(() => null);
    const response = await fetch(upstream.toString(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
