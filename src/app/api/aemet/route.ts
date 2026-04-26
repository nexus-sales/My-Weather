import { NextRequest, NextResponse } from 'next/server';

const AEMET_BASE = 'https://opendata.aemet.es/opendata/api';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const path = searchParams.get('path') ?? 'avisos_cap/ultimoelaborado/area/esp';
  const apiKey = process.env.AEMET_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AEMET API key not configured on server.' },
      { status: 503 }
    );
  }

  try {
    // AEMET uses a two-step API: first request returns a URL, second fetches the data
    const metaRes = await fetch(`${AEMET_BASE}/${path}?api_key=${apiKey}`, {
      next: { revalidate: 1800 },
    });
    if (!metaRes.ok) {
      return NextResponse.json(
        { error: 'AEMET metadata error', status: metaRes.status },
        { status: metaRes.status }
      );
    }

    const meta = await metaRes.json();

    if (!meta.datos) {
      return NextResponse.json(meta);
    }

    const dataRes = await fetch(meta.datos, { next: { revalidate: 1800 } });
    if (!dataRes.ok) {
      return NextResponse.json(
        { error: 'AEMET data fetch error', status: dataRes.status },
        { status: dataRes.status }
      );
    }

    const data = await dataRes.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to reach AEMET API' }, { status: 502 });
  }
}
