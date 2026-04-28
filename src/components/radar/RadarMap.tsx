'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, ZoomControl } from 'react-leaflet';
import { useLocationStore } from '@/store/useLocationStore';
import 'leaflet/dist/leaflet.css';

const MAP_HEIGHT = 300;

interface RainViewerFrame {
  time: number;
  path: string;
}

export default function RadarMap() {
  const { coords } = useLocationStore();
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [host, setHost] = useState('');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [layerType, setLayerType] = useState<'wind' | 'radar'>('wind');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/rainviewer')
      .then(r => r.json())
      .then(data => {
        if (data.radar && data.radar.length > 0) {
          setRadarFrames(data.radar);
          setHost(data.host);
          // Start 3 frames back for stability (avoiding "Zoom Not Supported" on fresh data)
          const stableIndex = Math.max(0, data.radar.length - 3);
          setCurrentFrameIndex(stableIndex);
        }
      })
      .catch(err => console.error('RainViewer error:', err));
  }, []);

  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, radarFrames.length]);

  const currentFrame = radarFrames[currentFrameIndex];
  const timeString = currentFrame ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="relative group w-full border border-white/5 rounded-xl overflow-hidden bg-[#00060f]" style={{ height: MAP_HEIGHT }}>
      {/* Controles superiores */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded-lg flex items-center gap-1 pointer-events-auto shadow-xl">
          <button 
            onClick={() => setLayerType('wind')} 
            className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'wind' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            VIENTO ECMWF
          </button>
          <button 
            onClick={() => setLayerType('radar')} 
            className={`px-3 py-1.5 rounded-md text-[10px] font-orbitron font-bold tracking-wider transition-all ${layerType === 'radar' ? 'bg-meteorix-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            RADAR LLUVIA
          </button>
        </div>

        {layerType === 'radar' && currentFrame && (
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

      {/* Capa de Viento (Windy) */}
      {layerType === 'wind' && (
        <iframe
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&detailLat=${coords.lat}&detailLon=${coords.lon}&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
          frameBorder="0"
          className="w-full h-full"
        ></iframe>
      )}

      {/* Capa de Radar (RainViewer + Leaflet) */}
      {layerType === 'radar' && (
        <>
          {(!host || radarFrames.length === 0) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-4 h-4 border-2 border-meteorix-blue/30 border-t-meteorix-blue rounded-full animate-spin" />
              <span className="text-[8px] font-orbitron tracking-widest text-white/20 uppercase">Sincronizando Radar...</span>
            </div>
          ) : (
            <>
              <MapContainer
                key={`map-${coords.lat}-${coords.lon}`}
                center={[coords.lat, coords.lon]}
                zoom={6}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                  maxZoom={12}
                />
                
                {currentFrame && (
                  <TileLayer
                    key={`rad-${currentFrame.time}`}
                    url={`${host}${currentFrame.path}/256/{z}/{x}/{y}/4/1_1.png`}
                    opacity={0.8}
                    zIndex={10}
                    maxZoom={12}
                  />
                )}

                <Circle
                  center={[coords.lat, coords.lon]}
                  radius={5000}
                  pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.3, weight: 2 }}
                />
                <ZoomControl position="bottomright" />
              </MapContainer>

              <div className="absolute bottom-4 left-4 right-12 z-[1000] h-1 bg-white/5 rounded-full overflow-hidden pointer-events-none">
                <div 
                  className="h-full bg-meteorix-blue shadow-[0_0_10px_#00d4ff] transition-all duration-300" 
                  style={{ width: `${((currentFrameIndex + 1) / radarFrames.length) * 100}%` }} 
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
