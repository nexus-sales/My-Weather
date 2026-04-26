'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';
import { getWeatherCondition } from '@/lib/weatherUtils';

interface CurrentWeatherCardProps {
  weather: WeatherData['current'];
  cityName: string;
}

export default function CurrentWeatherCard({ weather, cityName }: CurrentWeatherCardProps) {
  const d = useTranslations('Dashboard');
  const condition = getWeatherCondition(weather.weatherCode);

  return (
    <div className="relative group bg-meteorix-card border border-meteorix-border p-8 rounded-3xl backdrop-blur-2xl transition-all hover:border-meteorix-blue/40 h-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-[10px] tracking-[0.4em] text-meteorix-blue/60 font-bold uppercase">
          {d('current_weather')}
        </h3>
        <div className="text-4xl" title={condition.label}>
          {condition.icon}
        </div>
      </div>
      
      <div className="text-8xl font-black text-meteorix-blue mb-4 font-orbitron drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
        {Math.round(weather.temp)}°
      </div>
      
      <div className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-8 flex items-center gap-2">
        <MapPin size={10} className="text-meteorix-blue" />
        {cityName}
      </div>
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-8 border-t border-white/5">
        <div className="text-left">
          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('feels_like')}</div>
          <div className="text-sm font-bold font-orbitron text-meteorix-orange">{Math.round(weather.feelsLike)}°C</div>
        </div>
        <div className="text-left">
          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('humidity')}</div>
          <div className="text-sm font-bold font-orbitron">{weather.humidity}%</div>
        </div>
        <div className="text-left">
          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('wind')}</div>
          <div className="text-sm font-bold font-orbitron text-meteorix-green">{Math.round(weather.windSpeed)} KM/H</div>
        </div>
        <div className="text-left">
          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('pressure')}</div>
          <div className="text-sm font-bold font-orbitron opacity-70">{Math.round(weather.pressure)} HPA</div>
        </div>
      </div>
    </div>
  );
}
