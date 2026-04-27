'use client';

import { useTranslations } from 'next-intl';
import { useLocationStore } from '@/store/useLocationStore';
import { useUIStore } from '@/store/useUIStore';
import { Cloud, CloudRain, Maximize2, Satellite, Thermometer, Wind } from 'lucide-react';

const radarModes = [
  { id: 'rain', labelKey: 'modes.rain', icon: CloudRain },
  { id: 'wind', labelKey: 'modes.wind', icon: Wind },
  { id: 'temp', labelKey: 'modes.temp', icon: Thermometer },
  { id: 'clouds', labelKey: 'modes.clouds', icon: Cloud },
  { id: 'satellite', labelKey: 'modes.satellite', icon: Satellite },
] as const;

export default function RadarView() {
  const t = useTranslations('Radar');
  const { coords } = useLocationStore();
  const { radarLayer, setRadarLayer } = useUIStore();

  const windyUrl = `https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&detailLat=${coords.lat}&detailLon=${coords.lon}&width=800&height=600&zoom=6&level=surface&overlay=${radarLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadein">
      <div className="flex items-center justify-between bg-meteorix-card border border-meteorix-border p-2 rounded-2xl backdrop-blur-xl">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {radarModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setRadarLayer(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                radarLayer === mode.id
                  ? 'bg-meteorix-blue/20 text-meteorix-blue border border-meteorix-blue/40 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
              }`}
            >
              <mode.icon size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{t(mode.labelKey)}</span>
            </button>
          ))}
        </div>

        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-white/20 hover:text-white/60 transition-colors">
          <Maximize2 size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('expand')}</span>
        </button>
      </div>

      <div className="relative aspect-video w-full bg-[#040d22] border border-meteorix-border rounded-3xl overflow-hidden shadow-2xl group">
        <iframe
          key={`${radarLayer}-${coords.lat}-${coords.lon}`}
          src={windyUrl}
          className="w-full h-full border-0 grayscale-[0.2] opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          title="Windy Radar"
          allowFullScreen
        />

        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-meteorix-blue animate-pulse" />
            <span className="text-[8px] font-orbitron tracking-[0.2em] text-meteorix-blue/80 uppercase">{t('satelliteLink')}</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 pointer-events-none">
          <div className="text-[8px] font-orbitron tracking-[0.2em] text-white/30 text-right space-y-1">
            <div>LAT: {coords.lat.toFixed(4)}</div>
            <div>LON: {coords.lon.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
