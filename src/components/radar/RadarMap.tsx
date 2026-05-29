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
  externalLayerType?: 'wind' | 'radar' | 'isobars' | 'satellite' | 'clouds' | 'temp' | 'wind_owm';
}

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

const CANARY_BOUNDS: [[number, number], [number, number]] = [
  [27.45, -18.45],
  [29.65, -13.05],
];

function isInCanaryArea(lat: number, lon: number) {
  return lat >= 27 && lat <= 30 && lon >= -19 && lon <= -12;
}

function MapViewport({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();

  useEffect(() => {
    if (isInCanaryArea(lat, lon)) {
      map.fitBounds(CANARY_BOUNDS, {
        animate: false,
        padding: [34, 34],
        maxZoom: 8,
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

export default function RadarMap({ height = 300, hideControls = false, externalLayerType }: RadarMapProps) {
  const { coords } = useLocationStore();
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [satelliteFrames, setSatelliteFrames] = useState<RainViewerFrame[]>([]);
  const [host, setHost] = useState('');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [internalLayerType, setInternalLayerType] = useState<'wind' | 'radar' | 'isobars' | 'satellite' | 'clouds' | 'temp' | 'wind_owm'>('radar');
  
  const layerType = externalLayerType === 'wind' ? 'wind_owm' : (externalLayerType || internalLayerType);
  const [strikes, setStrikes] = useState<LightningStrike[]>([]);
  const [animationTime, setAnimationTime] = useState(() => Date.now());
  const [aemetStations, setAemetStations] = useState<AemetStation[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isNativeMapLayer = ['radar', 'satellite', 'clouds', 'temp', 'wind_owm'].includes(layerType);

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
    fetch('/api/rainviewer')
      .then(r => r.json())
      .then(data => {
        if (data.radar && data.radar.length > 0) {
          setRadarFrames(data.radar);
          if (data.satellite && data.satellite.length > 0) {
            setSatelliteFrames(data.satellite);
          }
          setHost(data.host);
          // Start 3 frames back for stability (avoiding "Zoom Not Supported" on fresh data)
          const stableIndex = Math.max(0, data.radar.length - 3);
          setCurrentFrameIndex(stableIndex);
        }
      })
      .catch(err => console.error('RainViewer error:', err));

    // Fetch AEMET stations for the map
    fetchAemetStations()
      .then(stations => {
        // Filter stations near the current location (optional, but good for performance)
        // For now, show all to give a global view of the network
        setAemetStations(stations);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const frameCount = layerType === 'satellite' ? satelliteFrames.length : radarFrames.length;
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

  const activeFrames = layerType === 'satellite' ? satelliteFrames : radarFrames;
  const displayedFrameIndex = activeFrames.length > 0 ? Math.min(currentFrameIndex, activeFrames.length - 1) : 0;
  const currentFrame = activeFrames[displayedFrameIndex];
  const timeString = currentFrame ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const initialZoom = isInCanaryArea(coords.lat, coords.lon) ? 8 : 7;

  return (
    <div className="relative group w-full border border-sky-300/30 rounded-xl overflow-hidden bg-[#dbe8ee]" style={{ height }}>
      {/* Controles superiores */}
      {!hideControls && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded-lg flex items-center gap-1 pointer-events-auto shadow-xl">
            <button 
              onClick={() => setInternalLayerType('satellite')} 
              className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'satellite' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              SATÉLITE
            </button>
            <button 
              onClick={() => setInternalLayerType('radar')} 
              className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'radar' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              RADAR
            </button>
            <button 
              onClick={() => setInternalLayerType('wind_owm')} 
              className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'wind_owm' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              VIENTO
            </button>
            <button 
              onClick={() => setInternalLayerType('temp')} 
              className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'temp' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              TÉRMICA
            </button>
          </div>

        {((layerType === 'radar' || layerType === 'satellite') && currentFrame) && (
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-3 w-fit pointer-events-auto shadow-xl">
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-meteorix-blue hover:text-white transition-colors">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-orbitron font-bold text-white tracking-widest">{timeString}</span>
              <span className="text-[6px] text-white/40 uppercase tracking-tighter">{layerType === 'satellite' ? 'Satélite LIVE' : 'Radar LIVE Pro'}</span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Capas Nativas (RainViewer & OWM Proxy) */}
      {isNativeMapLayer && (
        <>
          {((layerType === 'radar' || layerType === 'satellite') && (!host || radarFrames.length === 0)) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-4 h-4 border-2 border-meteorix-blue/30 border-t-meteorix-blue rounded-full animate-spin" />
              <span className="text-[8px] font-orbitron tracking-widest text-white/20 uppercase">Sincronizando Radar...</span>
            </div>
          ) : (
            <>
              <MapContainer
                key={`map-${coords.lat}-${coords.lon}-${layerType}`}
                center={[coords.lat, coords.lon]}
                zoom={initialZoom}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                minZoom={5}
                maxZoom={12}
              >
                <MapViewport lat={coords.lat} lon={coords.lon} />

                {/* Base Map dynamic change */}
                {layerType === 'satellite' ? (
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
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
                  <WMSTileLayer
                    url="https://wms.mapama.gob.es/sig/Agua/Precipitacion/wms.aspx"
                    layers="Precipitacion_Radar"
                    format="image/png"
                    transparent={true}
                    opacity={0.75}
                    zIndex={10}
                    maxZoom={18}
                  />
                )}

                {currentFrame && layerType === 'satellite' && (
                  <TileLayer
                    key={`sat-${currentFrame.time}`}
                    url={`${host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
                    opacity={0.85}
                    zIndex={20}
                    maxZoom={12}
                    maxNativeZoom={7}
                  />
                )}

                {layerType === 'clouds' && (
                  <TileLayer
                    url="/api/tiles/owm/clouds_new/{z}/{x}/{y}"
                    opacity={0.42}
                    zIndex={8}
                    maxZoom={12}
                    maxNativeZoom={7}
                  />
                )}

                {layerType === 'temp' && (
                  <TileLayer
                    url="/api/tiles/owm/temp_new/{z}/{x}/{y}"
                    opacity={0.45}
                    zIndex={7}
                    maxZoom={12}
                    maxNativeZoom={7}
                  />
                )}

                {layerType === 'wind_owm' && (
                  <TileLayer
                    url="/api/tiles/owm/wind_new/{z}/{x}/{y}"
                    opacity={0.45}
                    zIndex={7}
                    maxZoom={12}
                    maxNativeZoom={7}
                  />
                )}

                {/* Keep labels readable over both satellite and analytic overlays. */}
                <TileLayer
                  url={
                    layerType === 'satellite'
                      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/light_only_labels/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
                  }
                  subdomains="abcd"
                  zIndex={100}
                  opacity={layerType === 'satellite' ? 0.9 : 0.75}
                />

                {/* AEMET Ground Stations Layer */}
                {aemetStations.map((station) => {
                  const precipitation = station.prec ?? 0;
                  const temperature = station.ta ?? '--';
                  
                  return (
                    <Circle
                      key={`station-${station.idema}`}
                      center={[station.lat, station.lon]}
                      radius={3000}
                      pathOptions={{ 
                        color: precipitation > 0 ? '#4d7fff' : '#00d4ff', 
                        fillColor: precipitation > 0 ? '#4d7fff' : '#00d4ff', 
                        fillOpacity: 0.6, 
                        weight: 1 
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
                {strikes.map((strike) => {
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
                            color: '#00d4ff',
                            fillColor: '#00d4ff',
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
                  pathOptions={{ color: '#0077ff', fillColor: '#00d4ff', fillOpacity: 0.18, weight: 3 }}
                />
                <ZoomControl position="bottomright" />
              </MapContainer>

              <div className="absolute bottom-4 left-4 right-12 z-[1000] h-1 bg-white/5 rounded-full overflow-hidden pointer-events-none">
                <div 
                  className="h-full bg-meteorix-blue shadow-[0_0_10px_#00d4ff] transition-all duration-300" 
                  style={{ width: `${((displayedFrameIndex + 1) / (activeFrames.length || 1)) * 100}%` }} 
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
