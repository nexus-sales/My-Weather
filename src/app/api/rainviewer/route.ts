import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({ error: `RainViewer responded ${response.status}` }, { status: response.status });
    }
    const data = await response.json();
    
    return NextResponse.json({
      host: data.host,
      version: data.version,
      radar: data.radar.past,
      satellite: data.satellite.past
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch RainViewer data' }, { status: 500 });
  }
}
