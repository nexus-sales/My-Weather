import { NextRequest, NextResponse } from 'next/server';

const AEMET_BASE = 'https://opendata.aemet.es/opendata/api';

const RADAR_PATHS = [
  'red/radar/nacional',
  'red/radar/2d/nacional',
  'observacion/radar/2d/nacional',
];

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, image/*, */*',
};

/** AEMET returns ISO-8859-15; .json() silently mangles accented chars. */
const parseAemet = async (res: Response): Promise<any> => {
  const ct = res.headers.get('content-type') ?? '';
  const charsetMatch = ct.match(/charset=([^\s;,]+)/i);
  const charset = charsetMatch ? charsetMatch[1] : 'utf-8';
  const buf = await res.arrayBuffer();
  const text = new TextDecoder(charset).decode(buf);
  return JSON.parse(text);
};

/**
 * Fetch an AEMET path through the two-step metadata → datos pattern.
 * Returns the parsed datos payload, the raw datos URL (for binary content),
 * or null on any failure.
 */
const fetchAemetPath = async (
  path: string,
  apiKey: string
): Promise<{ json: any; datosUrl: string | null; isBinary: boolean } | null> => {
  const url = `${AEMET_BASE}/${path}?api_key=${apiKey}`;
  const metaRes = await fetch(url, { headers: FETCH_HEADERS, next: { revalidate: 600 } });
  if (!metaRes.ok) return null;

  const meta = await parseAemet(metaRes);
  if (!meta.datos) return { json: meta, datosUrl: null, isBinary: false };

  const dataRes = await fetch(meta.datos, { headers: FETCH_HEADERS, next: { revalidate: 600 } });
  if (!dataRes.ok) return null;

  const dataCt = dataRes.headers.get('content-type') ?? '';
  if (dataCt.startsWith('image/') || dataCt.includes('octet-stream')) {
    return { json: null, datosUrl: meta.datos, isBinary: true };
  }

  const json = await parseAemet(dataRes);
  return { json, datosUrl: meta.datos, isBinary: false };
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const path = searchParams.get('path') ?? 'avisos_cap/ultimoelaborado/area/esp';
  const apiKey = process.env.AEMET_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'AEMET API key not configured.' }, { status: 503 });
  }

  // Server-side radar probing — one client request, no browser 404s
  if (path === '__radar_probe__') {
    for (const radarPath of RADAR_PATHS) {
      try {
        const result = await fetchAemetPath(radarPath, apiKey);
        if (!result) continue;

        if (result.isBinary && result.datosUrl) {
          console.log(`[AEMET Radar] Image at: ${radarPath} → ${result.datosUrl}`);
          return NextResponse.json([{ nombre: radarPath, url: result.datosUrl }]);
        }
        if (result.json) {
          const arr = Array.isArray(result.json) ? result.json : [result.json];
          if (arr.length > 0) {
            console.log(`[AEMET Radar] JSON data at: ${radarPath}`);
            return NextResponse.json(arr);
          }
        }
      } catch (e) {
        console.warn(`[AEMET Radar] Path failed: ${radarPath}`, e);
      }
    }
    return NextResponse.json([]);
  }

  try {
    console.log(`[AEMET Proxy] ${path}`);
    const result = await fetchAemetPath(path, apiKey);
    if (!result) {
      return NextResponse.json({ error: 'AEMET request failed' }, { status: 404 });
    }
    if (result.isBinary && result.datosUrl) {
      return NextResponse.json({ url: result.datosUrl });
    }
    return NextResponse.json(result.json);
  } catch {
    return NextResponse.json({ error: 'Failed to reach AEMET API' }, { status: 502 });
  }
}
