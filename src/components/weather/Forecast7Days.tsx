'use client';

import { useTranslations, useLocale } from 'next-intl';
import { WeatherData } from '@/services/weatherService';
import { getWeatherCondition } from '@/lib/weatherUtils';
import { Calendar } from 'lucide-react';

interface Forecast7DaysProps {
  data: WeatherData['daily'];
}

export default function Forecast7Days({ data }: Forecast7DaysProps) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date);
  };

  return (
    <div className="w-full mt-12 animate-fadein" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-2 mb-6 px-4">
        <Calendar className="w-4 h-4 text-meteorix-blue/60" />
        <h3 className="text-xs font-bold tracking-[0.3em] text-meteorix-blue/80 uppercase">
          {t('forecast_7_days')}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {data.time.map((time, i) => {
          const condition = getWeatherCondition(data.weatherCode[i], locale);
          const isToday = i === 0;

          return (
            <div 
              key={time}
              className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all hover:-translate-y-1 ${
                isToday 
                  ? 'bg-meteorix-blue/10 border-meteorix-blue/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]' 
                  : 'bg-meteorix-card border-meteorix-border hover:border-white/10'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${
                isToday ? 'text-meteorix-blue' : 'text-white/40'
              }`}>
                {getDayName(time)}
              </span>
              <span className="text-[9px] text-white/20 mb-4 font-mono">
                {getFormattedDate(time)}
              </span>

              <div className="text-3xl mb-4 drop-shadow-md" title={condition.label}>
                {condition.icon}
              </div>

              <div className="flex flex-col items-center gap-0.5 mb-4">
                <span className="text-lg font-bold font-orbitron text-meteorix-orange">
                  {Math.round(data.tempMax[i])}°
                </span>
                <span className="text-xs font-bold font-orbitron text-white/30">
                  {Math.round(data.tempMin[i])}°
                </span>
              </div>

              <div className="flex flex-col gap-1 w-full pt-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-blue-400/80">
                  <span>💧</span>
                  <span>{data.precipProb[i]}%</span>
                </div>
                {data.precipSum[i] > 0.1 && (
                  <div className="text-[8px] text-white/30 text-center font-mono">
                    {data.precipSum[i].toFixed(1)}mm
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
