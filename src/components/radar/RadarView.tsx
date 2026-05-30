'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/useUIStore';
import { Cloud, CloudRain, Maximize2, Satellite, Thermometer, Wind } from 'lucide-react';
import dynamic from 'next/dynamic';

const RadarMap = dynamic(() => import('@/components/radar/RadarMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#00060f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-meteorix-blue/30 border-t-meteorix-blue rounded-full animate-spin" />
        <span className="text-[10px] font-orbitron tracking-widest text-meteorix-blue/50 uppercase animate-blink">Iniciando Telemetría...</span>
      </div>
    </div>
  ),
});

const radarModes = [
  { id: 'radar', labelKey: 'modes.rain', icon: CloudRain },
  { id: 'satellite', labelKey: 'modes.satellite', icon: Satellite },
  { id: 'clouds', labelKey: 'modes.clouds', icon: Cloud },
  { id: 'temp', labelKey: 'modes.temp', icon: Thermometer },
  { id: 'wind', labelKey: 'modes.wind', icon: Wind },
] as const;

export default function RadarView() {
  const t = useTranslations('Radar');
  const { radarLayer, setRadarLayer } = useUIStore();

  return (
    <div className="w-full flex flex-col gap-6 animate-fadein h-full min-h-[600px]">
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

      <div className="relative w-full border border-meteorix-border rounded-3xl overflow-hidden shadow-2xl group min-h-[600px] h-[600px]">
        <RadarMap 
          height="100%" 
          hideControls={true} 
          externalLayerType={radarLayer}
        />
      </div>
    </div>
  );
}
