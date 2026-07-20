'use client';

import { Plane } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';
import { useTranslations } from 'next-intl';

interface DroneFlightWidgetProps {
  windSpeed: number;
  visibility: number; // in km
  rain: number;
}

export default function DroneFlightWidget({ windSpeed, visibility, rain }: DroneFlightWidgetProps) {
  // Logic for flight status
  // Wind > 35 km/h = NO GO
  // Rain > 0 = NO GO
  // Visibility < 2 km = NO GO
  // Visibility < 5 km = WARNING
  
  const t = useTranslations('Widgets');

  let status = t('drone.go');
  let color = '#34d399'; // emerald-400
  let message = t('drone.optimal');

  if (windSpeed > 25 || visibility < 5) {
    status = t('drone.warning');
    color = '#fbbf24'; // amber-400
    message = t('drone.caution');
  }
  
  if (windSpeed > 35 || rain > 0 || visibility < 2) {
    status = t('drone.nogo');
    color = '#f87171'; // red-400
    message = t('drone.unsafe');
  }

  return (
    <WidgetWrapper title={t('drone.title')} icon={<Plane size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        {/* Top: Status Light & Text */}
        <div className="flex items-start gap-4">
          {/* Traffic Light Signal */}
          <div className="relative w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}20` }}>
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
          </div>
          
          <div className="flex flex-col flex-1">
             <span className="text-2xl font-outfit font-bold tracking-tight" style={{ color }}>
               {status}
             </span>
             <span className="text-[10px] font-inter text-white/60 uppercase mt-1 leading-tight h-6">
               {message}
             </span>
          </div>
        </div>

        {/* Bottom: Telemetry Bars */}
        <div className="flex flex-col gap-3 mt-auto mb-1">
           {/* Wind Bar */}
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-outfit font-medium text-white/50 uppercase w-8">{t('drone.wind')}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                 <div className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min((windSpeed / 50) * 100, 100)}%` }} />
                 <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-red-400 z-10" /> {/* 35km/h threshold */}
              </div>
           </div>
           
           {/* Vis Bar */}
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-outfit font-medium text-white/50 uppercase w-8">{t('drone.visibility')}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                 <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min((visibility / 10) * 100, 100)}%` }} />
                 <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-red-400 z-10" /> {/* 2km threshold */}
              </div>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
