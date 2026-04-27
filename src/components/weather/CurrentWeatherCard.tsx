'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Star } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';
import { getWeatherCondition } from '@/lib/weatherUtils';
import { useLocationStore } from '@/store/useLocationStore';

interface CurrentWeatherCardProps {
  weather: WeatherData['current'];
  cityName: string;
}

export default function CurrentWeatherCard({ weather, cityName }: CurrentWeatherCardProps) {
  const d = useTranslations('Dashboard');
  const locale = useLocale();
  const { coords, favorites, addFavorite, removeFavorite } = useLocationStore();
  
  const isFavorite = favorites.some(f => f.name === cityName);
  
  const toggleFavorite = () => {
    if (isFavorite) {
      const fav = favorites.find(f => f.name === cityName);
      if (fav) removeFavorite(fav.id);
    } else {
      addFavorite({
        id: `${coords.lat}-${coords.lon}`,
        name: cityName,
        coords
      });
    }
  };

  const condition = getWeatherCondition(weather.weatherCode, locale);

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
      
      <div className="flex flex-col gap-1 mb-8">
        <div className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase flex items-center gap-2">
          <MapPin size={10} className="text-meteorix-blue" />
          {cityName}
        </div>
        <button 
          onClick={toggleFavorite}
          className={`flex items-center gap-2 mt-2 w-fit px-3 py-1.5 rounded-lg border transition-all ${
            isFavorite 
              ? 'bg-meteorix-blue/10 border-meteorix-blue/40 text-meteorix-blue' 
              : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40 hover:border-white/10'
          }`}
        >
          <Star size={10} fill={isFavorite ? 'currentColor' : 'none'} />
          <span className="text-[8px] tracking-widest font-bold uppercase">
            {isFavorite ? d('savedFavorite') : d('addFavorite')}
          </span>
        </button>
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
