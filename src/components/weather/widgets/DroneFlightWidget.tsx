'use client';

import { Plane, AlertTriangle, CheckCircle2 } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface DroneFlightWidgetProps {
  windSpeed: number;
  visibility: number; // in meters or km
  rain: number;
}

export default function DroneFlightWidget({ windSpeed, visibility, rain }: DroneFlightWidgetProps) {
  // Logic for flight status
  // Wind > 35 km/h = NO GO
  // Rain > 0 = NO GO
  // Visibility < 2000m = NO GO
  
  let status = 'GO';
  let color = '#00ff88';
  let message = 'Condiciones Óptimas para Vuelo (VFR)';
  let glow = 'rgba(0,255,136,0.3)';

  if (windSpeed > 25 || visibility < 5000) {
    status = 'WARNING';
    color = '#ffcc00';
    message = 'Precaución: Ráfagas o visibilidad reducida';
    glow = 'rgba(255,204,0,0.3)';
  }
  
  if (windSpeed > 35 || rain > 0 || visibility < 2000) {
    status = 'NO-GO';
    color = '#ff3e3e';
    message = 'Vuelo Inseguro: Clima adverso detectado';
    glow = 'rgba(255,62,62,0.3)';
  }

  return (
    <WidgetWrapper title="Seguridad de Vuelo / Drones" icon={<Plane size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        {/* Top: Status Light & Text */}
        <div className="flex items-start gap-4">
          {/* Traffic Light Signal */}
          <div className="relative w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}20` }}>
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
          </div>
          
          <div className="flex flex-col flex-1">
             <span className="text-2xl font-orbitron font-black tracking-tighter" style={{ color, textShadow: `0 0 10px ${glow}` }}>
               {status}
             </span>
             <span className="text-[8px] font-mono text-white/60 uppercase mt-1 leading-tight h-6">
               {message}
             </span>
          </div>
        </div>

        {/* Bottom: Telemetry Bars */}
        <div className="flex flex-col gap-2 mt-auto">
           {/* Wind Bar */}
           <div className="flex items-center gap-2">
              <span className="text-[6px] font-orbitron text-white/40 uppercase w-8">Viento</span>
              <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                 <div className="h-full bg-meteorix-blue" style={{ width: `${Math.min((windSpeed / 50) * 100, 100)}%` }} />
                 <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-red-500/80 z-10" /> {/* 35km/h threshold */}
              </div>
           </div>
           
           {/* Vis Bar */}
           <div className="flex items-center gap-2">
              <span className="text-[6px] font-orbitron text-white/40 uppercase w-8">Visib.</span>
              <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                 <div className="h-full bg-meteorix-green" style={{ width: `${Math.min((visibility / 10000) * 100, 100)}%` }} />
                 <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-red-500/80 z-10" /> {/* 2km threshold */}
              </div>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
