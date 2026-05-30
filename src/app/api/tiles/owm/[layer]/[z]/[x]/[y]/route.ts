import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> }
) {
  const { layer, z, x, y } = await params;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    // Return a transparent 1x1 PNG to avoid console errors if key is missing
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    return new NextResponse(transparentPixel, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
    });
  }

  // OWM Tile layers: clouds_new, precipitation_new, pressure_new, wind_new, temp_new
  const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return new NextResponse('Tile fetch error', { status: res.status });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
