'use client';

import { useEffect, useState } from 'react';
import { Sun, BatteryCharging, Zap } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface SolarEnergyWidgetProps {
  cloudCover: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export default function SolarEnergyWidget({ cloudCover, uvIndex, sunrise, sunset }: SolarEnergyWidgetProps) {
  // Simple heuristic for solar efficiency
  // Less clouds + higher UV = better efficiency
  let efficiency = 100 - (cloudCover * 0.8) + (uvIndex * 2);
  efficiency = Math.max(0, Math.min(100, efficiency)); // Clamp between 0-100

  // sunrise/sunset arrive as full ISO datetimes (e.g. "2026-07-12T07:32"), not
  // "HH:MM" — parse as dates directly, same pattern as SunWidget.tsx. `now`
  // ticks independently instead of being computed once per render, or the
  // night/day cutoff could lag up to 10 min behind the real sunrise/sunset
  // (the gap between weather-data refetches).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  const isNight = now < sunriseDate || now >= sunsetDate;
  if (isNight) efficiency = 0;

  let statusText = 'Excelente';
  let color = '#fbbf24'; // amber-400
  if (efficiency < 40) { statusText = 'Baja'; color = '#9ca3af'; }
  else if (efficiency < 70) { statusText = 'Moderada'; color = '#60a5fa'; }
  
  if (isNight) {
    statusText = 'Inactiva (Noche)';
    color = '#4b5563'; // zinc-600
  }

  return (
    <WidgetWrapper title="Potencial Solar" icon={<Sun size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-zinc-400 uppercase tracking-widest">Eficiencia Estimada</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-outfit font-bold text-white">{Math.round(efficiency)}</span>
                <span className="text-sm text-zinc-500 font-medium">%</span>
              </div>
           </div>
        </div>

        {/* Efficiency Bar */}
        <div className="flex flex-col gap-2 my-4">
           <div className="flex items-center justify-between">
             <span className="text-[10px] font-inter text-zinc-300">Generación de Energía</span>
             <span className="text-[10px] font-outfit font-semibold" style={{ color }}>{statusText}</span>
           </div>
           
           <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
             <div 
               className="h-full rounded-full transition-all duration-1000 ease-out" 
               style={{ width: `${efficiency}%`, backgroundColor: color }} 
             />
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-auto">
           <div className="flex items-center gap-1.5 text-zinc-400">
              <BatteryCharging size={12} />
              <span className="text-[9px] font-inter uppercase">Baterías</span>
           </div>
           <div className="flex items-center gap-1.5" style={{ color: efficiency > 50 ? color : '#a1a1aa' }}>
              <Zap size={12} />
              <span className="text-[9px] font-outfit uppercase font-semibold">{efficiency > 50 ? 'Cargando' : 'Mantenimiento'}</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
