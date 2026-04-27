'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, ZoomControl, ImageOverlay } from 'react-leaflet';
import type { ImageOverlay as LImageOverlay } from 'leaflet';
import { useLocationStore } from '@/store/useLocationStore';
import 'leaflet/dist/leaflet.css';

const MAP_HEIGHT = 300;

// AEMET "red/radar/nacional" composite.
// Lambert Conformal Conic product approximated to Leaflet's Web Mercator.
// Covers Peninsula, Baleares and Canarias.
const RADAR_BOUNDS: [[number, number], [number, number]] = [
  [26.0, -19.5],
  [44.5,  5.0],
];

function applyRadarFilter(layer: LImageOverlay) {
  const el = layer.getElement();
  if (!el) return;
  // mix-blend-mode:screen makes black (no-data) pixels transparent,
  // keeping only the coloured precipitation echoes visible.
  el.style.filter = 'brightness(2) contrast(1.5) saturate(3)';
  el.style.mixBlendMode = 'screen';
}

export default function RadarMap() {
  const { coords } = useLocationStore();
  const [radarUrl, setRadarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/aemet?path=__radar_probe__')
      .then(r => r.json())
      .then((data: { url?: string }[]) => {
        if (Array.isArray(data) && data[0]?.url) setRadarUrl(data[0].url);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ height: MAP_HEIGHT, width: '100%' }}>
      <MapContainer
        key={`${coords.lat}-${coords.lon}`}
        center={[coords.lat, coords.lon]}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {radarUrl && (
          <ImageOverlay
            url={radarUrl}
            bounds={RADAR_BOUNDS}
            opacity={1}
            zIndex={2}
            eventHandlers={{
              add: (e) => applyRadarFilter(e.target as LImageOverlay),
              load: (e) => applyRadarFilter(e.target as LImageOverlay),
            }}
          />
        )}

        <Circle
          center={[coords.lat, coords.lon]}
          radius={5000}
          pathOptions={{
            color: '#00d4ff',
            fillColor: '#00d4ff',
            fillOpacity: 0.3,
            weight: 2,
          }}
        />

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
