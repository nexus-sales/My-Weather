'use client';

import { Satellite, Navigation, Sparkles } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface SpaceWeatherWidgetProps {
  kpIndex: number | null;
  flareClass: string | null;
  auroraProbability: number | null;
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

export default function SpaceWeatherWidget({ kpIndex, flareClass, auroraProbability, dataQuality, source }: SpaceWeatherWidgetProps) {
  const kp = kpIndex ?? 0;
  const hasData = kpIndex !== null;

  let status = hasData ? 'Tranquilo' : 'Sin datos';
  let color = '#34d399'; // emerald-400
  let gpsRisk = 'Nulo';

  if (hasData && kp > 4) {
    status = 'Tormenta Menor';
    color = '#fbbf24';
    gpsRisk = 'Bajo';
  }
  if (hasData && kp > 5) {
    status = 'Tormenta Solar';
    color = '#f87171';
    gpsRisk = 'Posible';
  }
  if (!hasData) color = '#71717a'; // zinc-500

  // Real probability for these exact coordinates (NOAA OVATION), not a Kp-only guess —
  // at low latitudes this is correctly ~0% even during a storm most people elsewhere see.
  let auroraLabel = 'Calculando...';
  let auroraColor = '#71717a';
  if (auroraProbability !== null) {
    if (auroraProbability < 3) { auroraLabel = 'Prácticamente nula'; auroraColor = '#71717a'; }
    else if (auroraProbability < 10) { auroraLabel = `Baja (${auroraProbability}%)`; auroraColor = '#60a5fa'; }
    else if (auroraProbability < 30) { auroraLabel = `Posible (${auroraProbability}%)`; auroraColor = '#fbbf24'; }
    else { auroraLabel = `Probable (${auroraProbability}%)`; auroraColor = '#f87171'; }
  }

  return (
    <WidgetWrapper title="Clima Espacial (NOAA)" icon={<Satellite size={14} style={{ color }} />} dataQuality={dataQuality} source={source}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-zinc-400 uppercase tracking-widest">Actividad Geomagnética</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-outfit font-bold text-white">{status}</span>
              </div>
           </div>
        </div>

        {/* Clear Human-Readable Indicators */}
        <div className="flex flex-col gap-3 my-4">
           {/* GPS Status */}
           <div className="flex items-center justify-between bg-zinc-800/40 px-3 py-2 rounded-lg border border-white/5">
             <div className="flex items-center gap-2 text-zinc-300">
               <Navigation size={14} className="text-blue-400" />
               <span className="text-xs font-inter">Riesgo para GPS</span>
             </div>
             <span className="text-xs font-semibold font-outfit" style={{ color: gpsRisk === 'Nulo' ? '#34d399' : color }}>
               {gpsRisk}
             </span>
           </div>

           {/* Aurora Status */}
           <div className="flex items-center justify-between bg-zinc-800/40 px-3 py-2 rounded-lg border border-white/5">
             <div className="flex items-center gap-2 text-zinc-300">
               <Sparkles size={14} className="text-violet-400" />
               <span className="text-xs font-inter">Auroras Boreales (aquí)</span>
             </div>
             <span className="text-xs font-semibold font-outfit" style={{ color: auroraColor }}>
               {auroraLabel}
             </span>
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-auto">
           <div className="flex flex-col">
              <span className="text-[9px] font-outfit text-zinc-500 uppercase tracking-widest">Índice Kp actual</span>
              <span className="text-xs text-zinc-300 font-medium">
                {hasData ? `Nivel ${kp.toFixed(1)} / 9` : 'No disponible'}
              </span>
           </div>
           <span className="text-[9px] font-inter text-zinc-500 uppercase">
             {flareClass ? `Clase ${flareClass}` : ''}
           </span>
        </div>
      </div>
    </WidgetWrapper>
  );
}
