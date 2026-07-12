'use client';

import { ThermometerSnowflake } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface DewPointWidgetProps {
  temp: number;
  humidity: number;
  title: string;
}

export default function DewPointWidget({ temp, humidity, title }: DewPointWidgetProps) {
  // Magnuse formula for Dew Point
  const a = 17.27;
  const b = 237.7;
  // Math.log(0) = -Infinity would propagate to NaN — clamp to a valid range first.
  const safeHumidity = Math.max(1, Math.min(100, humidity));
  const alpha = ((a * temp) / (b + temp)) + Math.log(safeHumidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  
  // Comfort level
  let comfort = 'Confortable';
  let color = '#00ff88';
  if (dewPoint > 18) { color = '#fbbf24'; comfort = 'Húmedo'; }
  if (dewPoint > 21) { color = '#ff3e3e'; comfort = 'Opresivo'; }
  if (dewPoint < 10) { color = '#0ea5e9'; comfort = 'Seco'; }

  return (
    <WidgetWrapper title={title} icon={<ThermometerSnowflake size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex flex-col items-center">
           <span className="text-3xl font-outfit font-black text-white drop-shadow-sm">
             {dewPoint.toFixed(1)}°
           </span>
           <span className="text-[8px] font-inter text-xs uppercase tracking-[0.2em] mt-1" style={{ color }}>
             {comfort}
           </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
           <div className="flex justify-between items-center text-[7px] font-inter text-xs text-white/40 uppercase">
              <span>Saturación de Aire</span>
              <span>{humidity}%</span>
           </div>
           <div className="h-1.5 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
              <div 
                className="h-full transition-all duration-1000" 
                style={{ width: `${humidity}%`, backgroundColor: color }} 
              />
           </div>
           <p className="text-[6px] font-inter text-xs text-white/20 uppercase leading-tight">
             Temperatura a la que el aire se satura y forma condensación.
           </p>
        </div>
      </div>
    </WidgetWrapper>
  );
}
