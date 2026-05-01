import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { WeatherData } from '@/services/weatherService';
import { getWeatherCondition } from '@/lib/weatherUtils';
import { Calendar, Clock } from 'lucide-react';

interface Forecast7DaysProps {
  daily: WeatherData['daily'];
  hourly: WeatherData['hourly'];
}

export default function Forecast7Days({ daily, hourly }: Forecast7DaysProps) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date);
  };

  // Filter hourly data for the selected day
  const selectedDateStr = daily.time[selectedIndex];
  const dayHourlyData = hourly.time
    .map((time, i) => ({
      time,
      temp: hourly.temp[i],
      precip: hourly.precipProb[i],
      code: hourly.weatherCode[i],
    }))
    .filter((h) => h.time.startsWith(selectedDateStr));

  return (
    <div className="w-full mt-12 animate-fadein" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-2 mb-6 px-4">
        <Calendar className="w-4 h-4 text-meteorix-blue/60" />
        <h3 className="text-xs font-bold tracking-[0.3em] text-meteorix-blue/80 uppercase">
          {t('forecast_7_days')}
        </h3>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 mb-8 no-scrollbar snap-x lg:grid lg:grid-cols-7 lg:overflow-visible">
        {daily.time.map((time, i) => {
          const condition = getWeatherCondition(daily.weatherCode[i], locale);
          const isSelected = selectedIndex === i;

          return (
            <button
              key={time}
              onClick={() => setSelectedIndex(i)}
              className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all hover:scale-[1.02] min-w-[120px] lg:min-w-0 snap-start ${
                isSelected 
                  ? 'bg-meteorix-blue/10 border-meteorix-blue/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]' 
                  : 'bg-meteorix-card border-meteorix-border hover:border-white/10'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${
                isSelected ? 'text-meteorix-blue' : 'text-white/40'
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
                  {Math.round(daily.tempMax[i])}°
                </span>
                <span className="text-xs font-bold font-orbitron text-white/30">
                  {Math.round(daily.tempMin[i])}°
                </span>
              </div>

              <div className="flex flex-col gap-1 w-full pt-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-blue-400/80">
                  <span>💧</span>
                  <span>{daily.precipProb[i]}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hourly Detail Section */}
      <div className="bg-meteorix-card/40 border border-meteorix-border rounded-3xl p-6 backdrop-blur-xl animate-fadein">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-3.5 h-3.5 text-white/20" />
          <h4 className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase">
            Detalle por horas — {getDayName(selectedDateStr)} {getFormattedDate(selectedDateStr)}
          </h4>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {dayHourlyData.map((h) => {
            const hourCondition = getWeatherCondition(h.code, locale);
            return (
              <div key={h.time} className="flex flex-col items-center min-w-[70px] p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] font-bold font-mono text-white/30 mb-2">
                  {new Date(h.time).getHours()}:00
                </span>
                <div className="text-xl mb-2">{hourCondition.icon}</div>
                <span className="text-xs font-bold font-orbitron text-white/80 mb-1">{Math.round(h.temp)}°</span>
                <div className="text-[8px] font-bold text-blue-400/60 flex items-center gap-1">
                  <span className="text-[6px]">💧</span>
                  {h.precip}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
