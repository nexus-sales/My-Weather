import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    const frames: { time?: number; path: string }[] = data?.radar?.past ?? [];
    if (frames.length === 0) return NextResponse.json({ path: null });
    return NextResponse.json({
      path: frames[frames.length - 1].path,
      host: data.host ?? 'https://tilecache.rainviewer.com',
    });
  } catch {
    return NextResponse.json({ path: null });
  }
}
