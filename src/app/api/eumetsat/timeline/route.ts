import { NextRequest, NextResponse } from 'next/server';

// Confirmed real time value per layer, read from EUMETSAT's own
// GetCapabilities — NOT computed from this server's clock. A computed
// timestamp (Date.now() rounded to the nearest step) was tried and
// confirmed live to 502 against EUMETSAT: this environment's clock doesn't
// reliably match real-world time, so only an authoritative value read back
// from the provider itself is safe to send as an exact WMS `time` param.
const CAPABILITIES_URL =
  'https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.1.1&request=GetCapabilities';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedCapabilities: { xml: string; fetchedAt: number } | null = null;

async function getCapabilitiesXml(): Promise<string> {
  const now = Date.now();
  if (cachedCapabilities && now - cachedCapabilities.fetchedAt < CACHE_TTL_MS) {
    return cachedCapabilities.xml;
  }

  const res = await fetch(CAPABILITIES_URL, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`GetCapabilities HTTP ${res.status}`);

  const xml = await res.text();
  cachedCapabilities = { xml, fetchedAt: now };
  return xml;
}

/** Finds this layer's real current time value (see the WMS 1.1.1 <Extent> note below) within its own <Layer> block. */
function extractLayerTime(xml: string, layerName: string): string | null {
  const nameIdx = xml.indexOf(`<Name>${layerName}</Name>`);
  if (nameIdx === -1) return null;

  // Leaf layers are `<Layer queryable="1" opaque="0">` (attributes vary) —
  // matching the bare `<Layer>` literal only ever found the top-level group
  // wrapper hundreds of KB earlier, pulling in some other layer's dimension.
  const layerStart = xml.lastIndexOf('<Layer ', nameIdx);
  const layerEnd = xml.indexOf('</Layer>', nameIdx);
  if (layerStart === -1 || layerEnd === -1) return null;

  const block = xml.slice(layerStart, layerEnd);
  // WMS 1.1.1 (what this fetch uses) splits the time dimension into two tags:
  // <Dimension name="time" units="ISO8601"/> declares it exists, and the
  // actual current default/extent lives in a separate <Extent> tag. (WMS
  // 1.3.0 merges these into one <Dimension default="...">...</Dimension> —
  // different format, don't conflate the two if this URL's version changes.)
  const match = block.match(/<Extent name="time"[^>]*\bdefault="([^"]+)"/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const layer = request.nextUrl.searchParams.get('layer');
  if (!layer) {
    return NextResponse.json({ error: 'layer is required' }, { status: 400 });
  }

  try {
    const xml = await getCapabilitiesXml();
    const time = extractLayerTime(xml, layer);
    if (!time) {
      return NextResponse.json({ error: 'Layer not found or has no time dimension' }, { status: 404 });
    }
    return NextResponse.json({ layer, time });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error(`EUMETSAT timeline error: ${msg}`);
    return NextResponse.json({ error: 'Failed to fetch EUMETSAT timeline' }, { status: 502 });
  }
}
