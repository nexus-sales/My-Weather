import { NextRequest, NextResponse } from 'next/server';

const COUNTRY_FEEDS: Record<string, string> = {
  es: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-spain',
  de: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-germany',
  fr: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-france',
  it: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-italy',
  pt: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-portugal',
  nl: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-netherlands',
  be: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-belgium',
};

function extractTag(xml: string, tag: string): string {
  // (?=[\s>]) pins the tag name to a real boundary so e.g. tag="id" doesn't
  // also match <cap:identifier> — confirmed live: without it, `id` swallowed
  // everything up to the entry's real </id>, dragging in unrelated tags.
  const re = new RegExp(`<(?:[^:>]+:)?${tag}(?=[\\s>])[^>]*>([\\s\\S]*?)<\/(?:[^:>]+:)?${tag}>`, 'i');
  const match = xml.match(re);
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseAlerts(xml: string) {
  return xml
    .split(/<entry>/)
    .slice(1)
    .map((entry) => ({
      id: extractTag(entry, 'id'),
      title: extractTag(entry, 'title'),
      summary: extractTag(entry, 'summary'),
      updated: extractTag(entry, 'updated'),
      effective: extractTag(entry, 'effective'),
      expires: extractTag(entry, 'expires'),
      severity: extractTag(entry, 'severity'),
      urgency: extractTag(entry, 'urgency'),
      certainty: extractTag(entry, 'certainty'),
      event: extractTag(entry, 'event'),
      area: extractTag(entry, 'areaDesc'),
    }))
    .filter((a) => a.id);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const country = (searchParams.get('country') ?? 'es').toLowerCase();
  const feedUrl = COUNTRY_FEEDS[country];

  if (!feedUrl) {
    return NextResponse.json(
      { error: `Country "${country}" is not supported.` },
      { status: 400 }
    );
  }

  try {
    // Note: feeds.meteoalarm.org returns 406 Not Acceptable if an Accept header
    // with multiple/qualified values is sent — confirmed live, do not add one back
    // without testing against the real feed first.
    const res = await fetch(feedUrl, { next: { revalidate: 1800 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Meteoalarm feed unavailable', status: res.status },
        { status: res.status }
      );
    }

    const xml = await res.text();
    let alerts = parseAlerts(xml);

    // Filtrado geográfico opcional
    const query = searchParams.get('query')?.toLowerCase();
    if (query) {
      alerts = alerts.filter(
        (a) =>
          a.area.toLowerCase().includes(query) ||
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ country, alerts, count: alerts.length, filteredBy: query || 'none' });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Meteoalarm feed' }, { status: 502 });
  }
}
