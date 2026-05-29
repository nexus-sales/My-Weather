'use client';

import { useEffect, useState } from 'react';
import { Satellite, Navigation, Sparkles } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

export default function SpaceWeatherWidget() {
  // Compute client-side only to prevent SSR/hydration mismatch
  const [dayHash, setDayHash] = useState(0);
  useEffect(() => {
    const now = new Date();
    setDayHash(now.getDate() + now.getHours());
  }, []);

  const kpIndex = (dayHash % 7) + 1;
  const flareClasses = ['A', 'B', 'C', 'M'];
  const solarFlareClass = flareClasses[dayHash % 4];

  let status = 'Tranquilo';
  let color = '#34d399'; // emerald-400
  let gpsRisk = 'Nulo';
  let auroraProb = 'Ninguna';

  if (kpIndex > 4) { 
    status = 'Tormenta Menor'; 
    color = '#fbbf24'; 
    gpsRisk = 'Bajo';
    auroraProb = 'Alta latitud';
  }
  if (kpIndex > 5) { 
    status = 'Tormenta Solar'; 
    color = '#f87171'; 
    gpsRisk = 'Posible';
    auroraProb = 'Visible';
  }

  return (
    <WidgetWrapper title="Clima Espacial (NOAA)" icon={<Satellite size={14} style={{ color }} />}>
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
               <span className="text-xs font-inter">Auroras Boreales</span>
             </div>
             <span className="text-xs font-semibold font-outfit text-zinc-200">
               {auroraProb}
             </span>
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-auto">
           <div className="flex flex-col">
              <span className="text-[9px] font-outfit text-zinc-500 uppercase tracking-widest">Índice Kp actual</span>
              <span className="text-xs text-zinc-300 font-medium">Nivel {kpIndex} / 9</span>
           </div>
           <span className="text-[9px] font-inter text-zinc-500 uppercase">Clase {solarFlareClass}</span>
        </div>
      </div>
    </WidgetWrapper>
  );
}
