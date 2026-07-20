'use client';

import { ThermometerSnowflake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import WidgetWrapper from './WidgetWrapper';
import { calculateDewPoint } from '@/lib/weatherUtils';

interface DewPointWidgetProps {
  temp: number;
  humidity: number;
  title: string;
}

export default function DewPointWidget({ temp, humidity, title }: DewPointWidgetProps) {
  const t = useTranslations('Widgets');
  const dewPoint = calculateDewPoint(temp, humidity);

  // Comfort level
  let comfort = t('dewPoint.comfortable');
  let color = '#00ff88';
  if (dewPoint > 18) { color = '#fbbf24'; comfort = t('dewPoint.humid'); }
  if (dewPoint > 21) { color = '#ff3e3e'; comfort = t('dewPoint.oppressive'); }
  if (dewPoint < 10) { color = '#0ea5e9'; comfort = t('dewPoint.dry'); }

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
           <div className="flex justify-between items-center text-[7px] font-inter text-xs text-white/60 uppercase">
              <span>{t('dewPoint.airSaturation')}</span>
              <span>{humidity}%</span>
           </div>
           <div className="h-1.5 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
              <div 
                className="h-full transition-all duration-1000" 
                style={{ width: `${humidity}%`, backgroundColor: color }} 
              />
           </div>
           <p className="text-[6px] font-inter text-xs text-white/45 uppercase leading-tight">
             {t('dewPoint.description')}
           </p>
        </div>
      </div>
    </WidgetWrapper>
  );
}
