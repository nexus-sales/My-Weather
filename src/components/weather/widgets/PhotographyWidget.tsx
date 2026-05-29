'use client';

import { Camera, Sunrise, Sunset, Clock } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface PhotographyWidgetProps {
  sunrise: string; // e.g. "06:30"
  sunset: string;  // e.g. "19:45"
}

export default function PhotographyWidget({ sunrise, sunset }: PhotographyWidgetProps) {
  // Parse times to get the Golden/Blue hour windows
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h || 0, m || 0, 0, 0);
    return date;
  };

  const sunriseDate = parseTime(sunrise);
  const sunsetDate = parseTime(sunset);
  const now = new Date();

  // Golden Hour: ~45 mins after sunrise, ~45 mins before sunset
  // Blue Hour: ~15 mins before sunrise, ~15 mins after sunset
  
  // Create formatted strings
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Morning Window
  const morningBlueHour = new Date(sunriseDate.getTime() - 15 * 60000);
  const morningGoldenHourEnd = new Date(sunriseDate.getTime() + 45 * 60000);
  
  // Evening Window
  const eveningGoldenHourStart = new Date(sunsetDate.getTime() - 45 * 60000);
  const eveningBlueHourEnd = new Date(sunsetDate.getTime() + 15 * 60000);

  // Determine current active phase
  let activePhase = 'Luz Dura (Día)';
  let activeColor = '#facc15'; // yellow-400
  let isOptimal = false;

  if (now >= morningBlueHour && now < sunriseDate) {
    activePhase = 'Blue Hour (Amanecer)';
    activeColor = '#60a5fa'; // blue-400
    isOptimal = true;
  } else if (now >= sunriseDate && now < morningGoldenHourEnd) {
    activePhase = 'Golden Hour (Mañana)';
    activeColor = '#fbbf24'; // amber-400
    isOptimal = true;
  } else if (now >= eveningGoldenHourStart && now < sunsetDate) {
    activePhase = 'Golden Hour (Tarde)';
    activeColor = '#fb923c'; // orange-400
    isOptimal = true;
  } else if (now >= sunsetDate && now < eveningBlueHourEnd) {
    activePhase = 'Blue Hour (Atardecer)';
    activeColor = '#3b82f6'; // blue-500
    isOptimal = true;
  } else if (now < morningBlueHour || now >= eveningBlueHourEnd) {
    activePhase = 'Fotografía Nocturna';
    activeColor = '#818cf8'; // indigo-400
  }

  return (
    <WidgetWrapper title="Luz Fotográfica" icon={<Camera size={14} style={{ color: activeColor }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-zinc-400 uppercase tracking-widest">Fase Actual</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-outfit font-bold text-white leading-tight">{activePhase}</span>
              </div>
           </div>
           {isOptimal && (
             <span className="text-[8px] font-inter px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 uppercase font-semibold border border-emerald-500/20">
               Luz Óptima
             </span>
           )}
        </div>

        <div className="flex flex-col gap-3 my-3">
           {/* Morning Row */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-zinc-400">
               <Sunrise size={12} className="text-amber-400" />
               <span className="text-[10px] font-inter">Mañana</span>
             </div>
             <span className="text-[10px] font-outfit text-zinc-300">
               {formatTime(morningBlueHour)} - {formatTime(morningGoldenHourEnd)}
             </span>
           </div>
           
           {/* Evening Row */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-zinc-400">
               <Sunset size={12} className="text-orange-400" />
               <span className="text-[10px] font-inter">Tarde</span>
             </div>
             <span className="text-[10px] font-outfit text-zinc-300">
               {formatTime(eveningGoldenHourStart)} - {formatTime(eveningBlueHourEnd)}
             </span>
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-auto">
           <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock size={12} />
              <span className="text-[9px] font-inter uppercase tracking-widest">Calculado por GPS</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
