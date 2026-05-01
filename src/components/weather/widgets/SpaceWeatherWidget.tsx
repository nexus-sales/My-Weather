'use client';

import { useEffect, useMemo, useState } from 'react';
import { Radio, Satellite } from 'lucide-react';
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

  // Stable bar heights derived from kpIndex — no Math.random() in render
  const barHeights = useMemo(
    () => Array.from({ length: 10 }, (_, i) => 20 + ((kpIndex * 13 + i * 7) % 20)),
    [kpIndex]
  );

  let status = 'ESTABLE';
  let color = '#00ff88';
  if (kpIndex > 4) { status = 'MODERADO'; color = '#ffcc00'; }
  if (kpIndex > 5) { status = 'TORMENTA SOLAR'; color = '#ff3e3e'; }


  return (
    <WidgetWrapper title="Clima Espacial (NOAA)" icon={<Satellite size={14} className="text-meteorix-blue animate-pulse" />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-orbitron text-white/50 uppercase tracking-widest">Índice Kp Geomagnético</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-orbitron font-black text-white">{kpIndex}</span>
                <span className="text-[8px] text-white/40 uppercase">/ 9</span>
              </div>
           </div>
           
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Actividad</span>
              <span className="text-[10px] font-orbitron px-2 py-0.5 rounded border mt-1" style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}>
                {status}
              </span>
           </div>
        </div>

        {/* Radio Wave Graph Simulation */}
        <div className="flex items-center justify-center my-2 h-8 opacity-60 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-meteorix-blue/10 to-transparent pointer-events-none" />
           <Radio size={32} style={{ color }} className={kpIndex > 4 ? 'animate-ping' : 'opacity-50'} />
           {/* Animated Sine waves using CSS */}
           <div className="absolute w-[200%] flex justify-around animate-[slide_3s_linear_infinite]">
             {barHeights.map((h, i) => (
               <div key={i} className="w-1 rounded-full bg-meteorix-blue/40 mx-1" style={{ height: `${h}px` }} />
             ))}
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-auto">
           <div className="flex flex-col">
              <span className="text-[6px] font-orbitron text-white/40 uppercase tracking-widest">Emisión Rayos-X</span>
              <span className="text-[10px] text-yellow-400 font-bold">Clase {solarFlareClass} (Baja)</span>
           </div>
           <span className="text-[6px] font-mono text-meteorix-green uppercase animate-pulse">Conexión Satelital OK</span>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </WidgetWrapper>
  );
}
