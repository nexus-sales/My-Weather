import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await response.json();
    
    return NextResponse.json({
      host: data.host,
      version: data.version,
      radar: data.radar.past,
      satellite: data.satellite.past
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RainViewer data' }, { status: 500 });
  }
}
