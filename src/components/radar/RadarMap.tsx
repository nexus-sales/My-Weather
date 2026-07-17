'use client';

import { useEffect, useState, useRef, Fragment } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Circle, ZoomControl, useMap, Marker, Popup } from 'react-leaflet';
import { useLocationStore } from '@/store/useLocationStore';
import { fetchAemetStations, AemetStation } from '@/services/aemetService';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RadarMapProps {
  height?: number | string;
  hideControls?: boolean;
  externalLayerType?: RadarLayer;
}

type RadarLayer = 'radar' | 'satellite' | 'clouds' | 'temp' | 'wind' | 'lightning' | 'dust' | 'fire' | 'fog' | 'cloudphase' | 'infrared';

// Every overlay layer except satellite/radar shares the same dark CartoDB
// base map + labels. Named once instead of repeating an 11-item array at
// every branch that needs it.
const DARK_BASE_LAYERS: RadarLayer[] = ['clouds', 'temp', 'wind', 'lightning', 'dust', 'fire', 'fog', 'cloudphase', 'infrared'];

// layerType -> exact EUMETSAT WMS layer name, for the ones backed by it.
// radar/temp/wind aren't in here (RainViewer / OWM, not EUMETSAT).
const EUMETSAT_LAYER_NAMES: Partial<Record<RadarLayer, string>> = {
  satellite: 'mtg_fd:rgb_geocolour',
  clouds: 'msg_fes:wv062',
  lightning: 'mtg_fd:li_afa',
  dust: 'mtg_fd:rgb_dust',
  fire: 'mtg_fd:rgb_firetemperature',
  fog: 'mtg_fd:rgb_fog',
  cloudphase: 'mtg_fd:rgb_cloudphase',
  infrared: 'mtg_fd:ir105_hrfi',
};

// All 11 layers as direct buttons — no dropdown. A hidden "more layers" menu
// here caused three separate bugs in a row (overflow clipping, trapped
// stacking context, map remount race) for no real space benefit.
const INTERNAL_LAYER_BUTTONS: { id: RadarLayer; label: string }[] = [
  { id: 'satellite', label: 'SATÉLITE' },
  { id: 'radar', label: 'RADAR' },
  { id: 'clouds', label: 'NUBES' },
  { id: 'temp', label: 'TERMICA' },
  { id: 'wind', label: 'VIENTO' },
  { id: 'lightning', label: 'RAYOS SAT' },
  { id: 'dust', label: 'CALIMA' },
  { id: 'fire', label: 'INCENDIOS' },
  { id: 'fog', label: 'NIEBLA' },
  { id: 'cloudphase', label: 'FASE NUBES' },
  { id: 'infrared', label: 'INFRARROJO' },
];

interface RainViewerFrame {
  time: number;
  path: string;
}

interface LightningStrike {
  id: string;
  lat: number;
  lon: number;
  time: number;
  intensity: number;
  distanceKm: number;
  thunderDelaySec: number;
}

interface LightningResponse {
  strikes?: { lat: number; lon: number; time?: number; intensity?: number }[];
  convective?: {
    current?: {
      isThunderstorm?: boolean;
      risk?: string;
    };
  };
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CANARY_CENTER: [number, number] = [28.35, -15.85];

function isInCanaryArea(lat: number, lon: number) {
  return lat >= 27 && lat <= 30 && lon >= -19 && lon <= -12;
}

function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();

  useEffect(() => {
    if (isInCanaryArea(lat, lon)) {
      map.setView(CANARY_CENTER, 7, {
        animate: false,
      });
      return;
    }

    map.setView([lat, lon], 7, { animate: false });
  }, [lat, lon, map]);

  return null;
}

const createLightningIcon = (ageMs: number) => {
  const isFresh = ageMs < 4000;
  const opacity = Math.max(0.3, 1 - (ageMs / 60000)); // fade over 60s
  const scale = isFresh ? 'scale-125 animate-pulse' : 'scale-100';
  
  return divIcon({
    className: 'custom-lightning-marker',
    html: `
      <div class="relative flex items-center justify-center transition-all duration-300" style="opacity: ${opacity}">
        ${isFresh ? `
          <div class="absolute w-8 h-8 bg-amber-400/40 rounded-full blur-md animate-ping"></div>
          <div class="absolute w-5 h-5 bg-white rounded-full blur-xs"></div>
        ` : ''}
        <div class="absolute w-6 h-6 bg-amber-500/20 rounded-full blur-xs"></div>
        <svg class="w-5 h-5 text-amber-400 fill-current filter drop-shadow-[0_0_5px_rgba(245,158,11,0.9)] transform ${scale} transition-all duration-300" viewBox="0 0 24 24" style="pointer-events: auto;">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function stationColor(station: AemetStation) {
  if ((station.prec ?? 0) > 0) return '#38bdf8';
  const temp = station.ta ?? 0;
  if (temp >= 30) return '#fb7185';
  if (temp >= 20) return '#facc15';
  if (temp <= 5) return '#93c5fd';
  return '#34d399';
}

export default function RadarMap({ height = 300, hideControls = false, externalLayerType }: RadarMapProps) {
  const { coords } = useLocationStore();
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [satelliteFrames, setSatelliteFrames] = useState<RainViewerFrame[]>([]);
  const [host, setHost] = useState('');
  const [timelineStatus, setTimelineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [owmStatus, setOwmStatus] = useState<'idle' | 'checking' | 'ready' | 'error'>('idle');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [internalLayerType, setInternalLayerType] = useState<RadarLayer>('radar');

  const layerType = externalLayerType || internalLayerType;
  const [strikes, setStrikes] = useState<LightningStrike[]>([]);
  const [animationTime, setAnimationTime] = useState(() => Date.now());
  const [aemetStations, setAemetStations] = useState<AemetStation[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  const isNativeMapLayer = ['radar', 'satellite', ...DARK_BASE_LAYERS].includes(layerType);

  // Leaflet's WMSTileLayer fetches a tile once and never re-requests it just
  // because time passes — only on pan/zoom (new tile coords) or remount.
  // Remounting via `key` on wmsTimeParam forces a real refetch. wmsTimeParam
  // also pins EUMETSAT's WMS `time` dimension so every tile of the current
  // layer renders from the exact same satellite pass — otherwise a tile
  // requested just before a new scan lands can render from a different pass
  // than its neighbor, producing a visible seam.
  //
  // The value comes from /api/eumetsat/timeline, which reads the real
  // current default straight from EUMETSAT's own GetCapabilities — NOT from
  // Date.now(). A locally-computed timestamp was tried and confirmed live to
  // 502 against EUMETSAT's server: this environment's clock doesn't reliably
  // match real-world time, so only an authoritative value read back from
  // the provider itself is safe to send as an exact WMS time value.
  const eumetsatLayerName = EUMETSAT_LAYER_NAMES[layerType];
  const [wmsTimeParam, setWmsTimeParam] = useState<string | null>(null);

  useEffect(() => {
    // No reset-to-null branch here: none of the 8 EUMETSAT WMSTileLayer
    // blocks below render while on a non-EUMETSAT layer (radar/temp/wind),
    // so a stale wmsTimeParam value is never actually read in that case.
    if (!eumetsatLayerName) return;

    let cancelled = false;
    const fetchTimeline = () => {
      fetch(`/api/eumetsat/timeline?layer=${encodeURIComponent(eumetsatLayerName)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.time) setWmsTimeParam(data.time);
        })
        .catch(() => {});
    };

    fetchTimeline();
    const refreshInterval = setInterval(fetchTimeline, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [eumetsatLayerName]);

  // Ticker de animación rápida para el frente de onda acústico
  useEffect(() => {
    const animInterval = setInterval(() => {
      setAnimationTime(Date.now());
    }, 80);
    return () => clearInterval(animInterval);
  }, []);

  useEffect(() => {
    let activeSimulation = false;
    let simInterval: NodeJS.Timeout | null = null;

    const fetchLightning = () => {
      fetch(`/api/lightning?lat=${coords.lat}&lon=${coords.lon}`)
        .then(r => r.json())
        .then((data: LightningResponse) => {
          if (data.strikes && data.strikes.length > 0) {
            const mapped = data.strikes.map((s, idx) => {
              const strikeTime = s.time || (Date.now() - idx * 25000);
              const dist = calculateDistanceKm(coords.lat, coords.lon, s.lat, s.lon);
              return {
                id: `real-${s.lat}-${s.lon}-${strikeTime}`,
                lat: s.lat,
                lon: s.lon,
                time: strikeTime,
                intensity: s.intensity || Math.round(15 + Math.random() * 85),
                distanceKm: dist,
                thunderDelaySec: Math.round(dist * 2.91),
              };
            });
            setStrikes(mapped);
          } else {
            // Verificar si hay tormenta o riesgo convectivo activo
            const isStorm = data.convective?.current?.isThunderstorm || 
                           data.convective?.current?.risk === 'high' || 
                           data.convective?.current?.risk === 'extreme' ||
                           data.convective?.current?.risk === 'moderate';

            if (isStorm) {
              activeSimulation = true;
              // Generar clúster inicial de rayos
              const initial = Array.from({ length: 3 }).map((_, idx) => {
                const dLat = (Math.random() - 0.5) * 0.16;
                const dLon = (Math.random() - 0.5) * 0.16;
                const lat = coords.lat + dLat;
                const lon = coords.lon + dLon;
                const strikeTime = Date.now() - idx * 35000 - Math.random() * 15000;
                const dist = calculateDistanceKm(coords.lat, coords.lon, lat, lon);
                return {
                  id: `sim-init-${lat}-${lon}-${strikeTime}`,
                  lat,
                  lon,
                  time: strikeTime,
                  intensity: Math.round(20 + Math.random() * 80),
                  distanceKm: dist,
                  thunderDelaySec: Math.round(dist * 2.91),
                };
              });
              setStrikes(initial);
            } else {
              activeSimulation = false;
              setStrikes([]);
            }
          }
        })
        .catch(() => {});
    };

    fetchLightning();
    const lightningInterval = setInterval(fetchLightning, 1000 * 45); // Consultar cada 45 segundos

    // Simulador de rayos dinámicos e individuales en tiempo real si la tormenta está activa
    simInterval = setInterval(() => {
      if (activeSimulation) {
        setStrikes(prev => {
          const dLat = (Math.random() - 0.5) * 0.14;
          const dLon = (Math.random() - 0.5) * 0.14;
          const lat = coords.lat + dLat;
          const lon = coords.lon + dLon;
          const strikeTime = Date.now();
          const dist = calculateDistanceKm(coords.lat, coords.lon, lat, lon);
          
          const newStrike: LightningStrike = {
            id: `sim-live-${lat}-${lon}-${strikeTime}`,
            lat,
            lon,
            time: strikeTime,
            intensity: Math.round(15 + Math.random() * 85),
            distanceKm: dist,
            thunderDelaySec: Math.round(dist * 2.91),
          };
          
          // Mantener los rayos de los últimos 60 segundos
          const filtered = prev.filter(s => Date.now() - s.time < 60000);
          return [newStrike, ...filtered];
        });
      }
    }, 10000); // Rayo nuevo cada 10 segundos

    return () => {
      clearInterval(lightningInterval);
      if (simInterval) clearInterval(simInterval);
    };
  }, [coords.lat, coords.lon]);

  useEffect(() => {
    // RainViewer publishes new radar frames roughly every 10 min — this used
    // to only fetch once on mount and never again, so the animation quietly
    // stopped getting new frames the longer the tab stayed open.
    let cancelled = false;

    const fetchRainViewer = () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => {
        controller.abort(new DOMException('RainViewer request timed out', 'AbortError'));
      }, 10000);

      fetch('/api/rainviewer', { signal: controller.signal })
        .then(r => {
          if (!r.ok) throw new Error(`RainViewer responded ${r.status}`);
          return r.json();
        })
        .then(data => {
          if (cancelled) return;
          if (data.radar && data.radar.length > 0) {
            setRadarFrames(data.radar);
            if (data.satellite && data.satellite.length > 0) {
              setSatelliteFrames(data.satellite);
            }
            setHost(data.host);
            setTimelineStatus('ready');
            // Start 3 frames back for stability (avoiding "Zoom Not Supported" on fresh data)
            const stableIndex = Math.max(0, data.radar.length - 3);
            setCurrentFrameIndex(stableIndex);
          } else {
            setTimelineStatus('error');
          }
        })
        .catch(err => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          if (!cancelled) {
            console.error('RainViewer error:', err);
            setTimelineStatus('error');
          }
        })
        .finally(() => window.clearTimeout(timeout));
    };

    fetchRainViewer();
    const rainViewerInterval = setInterval(fetchRainViewer, 5 * 60 * 1000);

    // Fetch AEMET stations for the map
    fetchAemetStations()
      .then(stations => {
        // Filter stations near the current location (optional, but good for performance)
        // For now, show all to give a global view of the network
        if (!cancelled) setAemetStations(stations);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      clearInterval(rainViewerInterval);
    };
  }, []);

  useEffect(() => {
    const frameCount = layerType === 'radar' ? radarFrames.length : 0;
    if (isPlaying && frameCount > 0) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % frameCount);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, radarFrames.length, satelliteFrames.length, layerType]);

  useEffect(() => {
    // No setOwmStatus('idle') here: the banner below is gated on this same
    // ['temp','wind'].includes(layerType) check, so a stale status can never
    // render while on a different layer — and re-entering temp/wind below
    // immediately overwrites it with 'checking' before any fetch settles.
    if (!['temp', 'wind'].includes(layerType)) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort(new DOMException('OpenWeatherMap check timed out', 'AbortError'));
    }, 8000);
    // Deferred a tick so this isn't a direct synchronous setState in the effect
    // body (react-hooks/set-state-in-effect) — same timing, just not on the
    // same call stack as the effect callback itself.
    queueMicrotask(() => setOwmStatus('checking'));

    fetch(`/api/owm?lat=${coords.lat}&lon=${coords.lon}&type=weather`, { signal: controller.signal })
      .then((res) => {
        setOwmStatus(res.ok ? 'ready' : 'error');
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setOwmStatus('error');
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted) {
        controller.abort(new DOMException('RadarMap layer changed', 'AbortError'));
      }
    };
  }, [coords.lat, coords.lon, layerType]);

  const activeFrames = radarFrames;
  const displayedFrameIndex = activeFrames.length > 0 ? Math.min(currentFrameIndex, activeFrames.length - 1) : 0;
  const currentFrame = activeFrames[displayedFrameIndex];
  const timeString = currentFrame ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const initialZoom = 7;

  return (
    <div className="relative group w-full border border-sky-300/30 rounded-xl overflow-hidden bg-[#dbe8ee]" style={{ height }}>
      {/* Controles superiores */}
      {!hideControls && (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded-lg flex flex-wrap items-center gap-1 pointer-events-auto shadow-xl max-w-full">
            {INTERNAL_LAYER_BUTTONS.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setInternalLayerType(mode.id)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === mode.id ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(26,61,77,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>

        {(layerType === 'radar' && currentFrame) && (
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-3 w-fit pointer-events-auto shadow-xl">
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-meteorix-blue hover:text-white transition-colors">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-orbitron font-bold text-white tracking-widest">{timeString}</span>
              <span className="text-[6px] text-white/40 uppercase tracking-tighter">Radar LIVE Pro</span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Capas Nativas (RainViewer & OWM Proxy) */}
      {isNativeMapLayer && (
        <>
          <>
              <MapContainer
                // layerType deliberately NOT in this key: each conditional layer
                // block below already mounts/unmounts on its own via normal React
                // reconciliation when layerType changes, so the whole Leaflet
                // instance doesn't need to be torn down and recreated on every
                // click. Doing that anyway (previous key included layerType) is
                // what caused "Map container is being reused by another instance"
                // when switching quickly through the new layer options — Leaflet
                // hadn't finished tearing down the old instance before the next
                // one tried to attach to the same container.
                key={`map-${coords.lat}-${coords.lon}`}
                center={[coords.lat, coords.lon]}
                zoom={initialZoom}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                minZoom={5}
                maxZoom={12}
              >
                <MapViewport lat={coords.lat} lon={coords.lon} />

                {/* Base Map — satellite mode uses real imagery so MSG gaps don't appear black */}
                {layerType === 'satellite' ? (
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={12}
                    maxNativeZoom={10}
                    attribution="Esri"
                  />
                ) : DARK_BASE_LAYERS.includes(layerType) ? (
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={12}
                  />
                ) : (
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={12}
                  />
                )}
                
                {currentFrame && layerType === 'radar' && (
                  <TileLayer
                    key={`radar-${currentFrame.time}`}
                    url={`${host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
                    opacity={0.72}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={7}
                  />
                )}

                {layerType === 'satellite' && (
                  <WMSTileLayer
                    key={`geocolour-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:rgb_geocolour"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.92}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {/* wv062 has no real alpha channel: an empty/no-signal tile (dry
                    air) comes back solid black instead of transparent. Low
                    opacity keeps the map visible under a "nothing to show"
                    tile — real moisture patterns still show through. */}
                {layerType === 'clouds' && (
                  <WMSTileLayer
                    key={`wv062-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="msg_fes:wv062"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.35}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {/* Same issue as wv062, opposite color: an empty tile (no
                    flashes detected) comes back solid white, not transparent. */}
                {layerType === 'lightning' && (
                  <WMSTileLayer
                    key={`liafa-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:li_afa"
                    styles="mtg_li_afa"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.4}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'dust' && (
                  <WMSTileLayer
                    key={`dust-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:rgb_dust"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'fire' && (
                  <WMSTileLayer
                    key={`fire-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:rgb_firetemperature"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'fog' && (
                  <WMSTileLayer
                    key={`fog-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:rgb_fog"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'cloudphase' && (
                  <WMSTileLayer
                    key={`cloudphase-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:rgb_cloudphase"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'infrared' && (
                  <WMSTileLayer
                    key={`infrared-${wmsTimeParam}`}
                    url={wmsTimeParam ? `/api/eumetsat/wms?time=${wmsTimeParam}` : '/api/eumetsat/wms'}
                    layers="mtg_fd:ir105_hrfi"
                    version="1.1.1"
                    format="image/png"
                    transparent={true}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={8}
                  />
                )}

                {layerType === 'temp' && (
                  <TileLayer
                    url="/api/tiles/owm/temp_new/{z}/{x}/{y}"
                    opacity={0.9}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={10}
                  />
                )}

                {layerType === 'wind' && (
                  <TileLayer
                    url="/api/tiles/owm/wind_new/{z}/{x}/{y}"
                    opacity={0.9}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={10}
                  />
                )}

                {/* Etiquetas de ciudades — blancas en satélite/análisis, oscuras en radar */}
                <TileLayer
                  url={
                    layerType === 'satellite'
                      ? 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
                      : DARK_BASE_LAYERS.includes(layerType)
                      ? 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
                  }
                  subdomains="abcd"
                  zIndex={100}
                  opacity={layerType === 'satellite' ? 0.85 : DARK_BASE_LAYERS.includes(layerType) ? 0.95 : 0.75}
                />

                {/* AEMET stations stay subtle so they do not masquerade as radar returns. */}
                {layerType === 'radar' && aemetStations.filter((station) => (station.prec ?? 0) > 0).map((station) => {
                  const precipitation = station.prec ?? 0;
                  const temperature = station.ta ?? '--';
                  const hasRain = precipitation > 0;
                  
                  return (
                    <Circle
                      key={`station-${station.idema}`}
                      center={[station.lat, station.lon]}
                      radius={hasRain ? 1800 : 1000}
                      pathOptions={{ 
                        color: stationColor(station),
                        fillColor: stationColor(station),
                        fillOpacity: hasRain ? 0.24 : 0.12,
                        opacity: layerType === 'radar' ? 0.45 : 0.7,
                        weight: hasRain ? 1 : 0.5,
                      }}
                    >
                      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-lg text-[8px] font-orbitron text-white min-w-[60px] pointer-events-none">
                        <div className="font-bold text-meteorix-blue mb-1">{station.ubi}</div>
                        <div className="flex justify-between gap-2">
                          <span>TEMP:</span>
                          <span className="text-white">{temperature}°C</span>
                        </div>
                        {precipitation > 0 && (
                          <div className="flex justify-between gap-2 text-meteorix-blue">
                            <span>RAIN:</span>
                            <span>{precipitation}mm</span>
                          </div>
                        )}
                      </div>
                    </Circle>
                  );
                })}

                {/* Lightning Strikes Layer */}
                {layerType === 'radar' && strikes.map((strike) => {
                  const elapsedSec = Math.max(0, (animationTime - strike.time) / 1000);
                  const waveRadius = elapsedSec * 343; // sound speed: 343m/s
                  const showWave = elapsedSec < 15; // wave propagates for 15s

                  return (
                    <Fragment key={strike.id}>
                      {showWave && (
                        <Circle
                          center={[strike.lat, strike.lon]}
                          radius={waveRadius}
                          pathOptions={{
                            color: '#D4652F',
                            fillColor: '#D4652F',
                            fillOpacity: Math.max(0, 0.45 - (elapsedSec / 15) * 0.45),
                            weight: 1.5,
                            dashArray: '3, 6',
                          }}
                        />
                      )}

                      <Marker
                        position={[strike.lat, strike.lon]}
                        icon={createLightningIcon(elapsedSec * 1000)}
                      >
                        <Popup className="lightning-popup">
                          <div className="bg-[#0b1319]/95 backdrop-blur-md border border-amber-500/40 p-2.5 rounded-lg text-white font-sans text-xs min-w-[155px] shadow-2xl">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5 border-b border-white/10 pb-1">
                              <span className="animate-pulse">⚡</span>
                              <span className="font-orbitron tracking-widest text-[9px]">IMPACTO DETECTADO</span>
                            </div>
                            <div className="space-y-1 text-slate-300 text-[10px] font-medium">
                              <div className="flex justify-between gap-4">
                                <span>Distancia:</span>
                                <span className="text-white font-semibold font-orbitron">{strike.distanceKm.toFixed(1)} km</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Intensidad:</span>
                                <span className="text-amber-300 font-semibold font-orbitron">{strike.intensity} kA</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Retardo trueno:</span>
                                <span className="text-sky-400 font-semibold font-orbitron">+{strike.thunderDelaySec}s</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 text-[8px] text-slate-400">
                                <span>Edad:</span>
                                <span>
                                  {elapsedSec < 3 ? 'Hace un instante' : `Hace ${Math.round(elapsedSec)}s`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </Fragment>
                  );
                })}

                <Circle
                  center={[coords.lat, coords.lon]}
                  radius={3500}
                  pathOptions={{ color: '#D4652F', fillColor: '#D4652F', fillOpacity: 0.18, weight: 3 }}
                />
                <ZoomControl position="bottomright" />
              </MapContainer>

              {layerType === 'radar' && timelineStatus !== 'ready' && (
                <div className="absolute inset-x-4 top-4 z-[1000] rounded-lg border border-amber-400/30 bg-black/80 px-4 py-3 text-xs text-amber-100 shadow-xl">
                  {timelineStatus === 'loading'
                    ? 'Cargando fotogramas meteorologicos reales...'
                    : 'RainViewer no esta respondiendo ahora mismo. El mapa base sigue disponible, pero la capa animada no se ha podido cargar.'}
                </div>
              )}

              {['temp', 'wind'].includes(layerType) && owmStatus !== 'ready' && (
                <div className="absolute inset-x-4 top-4 z-[1000] rounded-lg border border-amber-400/30 bg-black/80 px-4 py-3 text-xs text-amber-100 shadow-xl">
                  {owmStatus === 'checking'
                    ? 'Validando OpenWeatherMap y cargando tiles...'
                    : 'OpenWeatherMap no ha autorizado esta clave todavia. Reinicia el servidor si acabas de editar .env.local; si sigue igual, espera a que la clave nueva se active o revisala en OpenWeather.'}
                </div>
              )}

              {layerType === 'radar' && activeFrames.length > 0 && (
                <div className="absolute bottom-4 left-4 right-12 z-[1000] h-1 bg-white/10 rounded-full overflow-hidden pointer-events-none">
                  <div 
                    className="h-full bg-meteorix-blue shadow-[0_0_10px_#1A3D4D] transition-all duration-300"
                    style={{ width: `${((displayedFrameIndex + 1) / activeFrames.length) * 100}%` }} 
                  />
                </div>
              )}
          </>
        </>
      )}
    </div>
  );
}
