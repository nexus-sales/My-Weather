'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Star, Share2, Info } from 'lucide-react';
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
    <div className="relative group bg-[#040d22]/80 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl transition-all duration-700 hover:border-meteorix-blue/40 overflow-hidden h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
      {/* HUD Background Elements */}
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <div className="text-[10px] font-mono tracking-tighter text-meteorix-blue uppercase">METEORIX_MAIN_CORE_v5</div>
      </div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-meteorix-blue/5 blur-[100px] rounded-full" />
      
      {/* Header Overlay */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-meteorix-blue animate-pulse shadow-[0_0_8px_#00d4ff]" />
             <h3 className="text-[10px] tracking-[0.5em] text-white/30 font-black uppercase">
               {d('current_weather')}
             </h3>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-meteorix-blue" />
            <span className="text-xs font-orbitron font-bold text-white/90 tracking-widest uppercase">{cityName}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter brightness-125 mb-1">
             {condition.icon}
           </div>
           <span className="text-[9px] font-orbitron text-meteorix-blue/60 font-bold uppercase tracking-widest">{condition.label}</span>
        </div>
      </div>
      
      {/* Main Temp Display */}
      <div className="relative z-10 flex flex-col items-center py-4">
        <div className="text-[10rem] leading-none font-black text-white font-orbitron drop-shadow-[0_0_50px_rgba(0,212,255,0.2)] tracking-tighter hover:scale-105 transition-transform duration-1000 cursor-default selection:bg-transparent">
          {Math.round(weather.temp)}<span className="text-5xl absolute -top-4 -right-12 opacity-40">°</span>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="relative z-10 flex items-center justify-between mt-4 mb-10">
        <button 
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500 ${
            isFavorite 
              ? 'bg-meteorix-blue/20 border-meteorix-blue/50 text-meteorix-blue shadow-[0_0_15px_rgba(0,212,255,0.2)]' 
              : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:border-white/10'
          }`}
        >
          <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-pulse' : ''} />
          <span className="text-[9px] tracking-widest font-black uppercase">
            {isFavorite ? d('savedFavorite') : d('addFavorite')}
          </span>
        </button>

        <div className="flex gap-2">
           <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-meteorix-blue hover:border-meteorix-blue/40 transition-all">
             <Share2 size={14} />
           </button>
           <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-meteorix-blue hover:border-meteorix-blue/40 transition-all">
             <Info size={14} />
           </button>
        </div>
      </div>
      
      {/* Bottom Telemetry HUD */}
      <div className="relative z-10 grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
        <MetricSmall label={d('feels_like')} value={`${Math.round(weather.feelsLike)}°`} color="text-meteorix-orange" />
        <MetricSmall label={d('humidity')} value={`${weather.humidity}%`} color="text-meteorix-blue" />
        <MetricSmall label={d('wind')} value={`${Math.round(weather.windSpeed)} km/h`} color="text-meteorix-green" />
        <MetricSmall label={d('pressure')} value={`${Math.round(weather.pressure)} hpa`} color="text-white/40" />
      </div>

      {/* Decorative HUD Lines */}
      <div className="absolute top-1/2 left-0 w-1 h-12 bg-meteorix-blue/30 -translate-y-1/2 rounded-r-full" />
      <div className="absolute top-1/2 right-0 w-1 h-12 bg-meteorix-blue/30 -translate-y-1/2 rounded-l-full" />
    </div>
  );
}

function MetricSmall({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
       <span className="text-[7px] tracking-[0.2em] font-bold text-white/20 uppercase mb-1">{label}</span>
       <span className={`text-sm font-orbitron font-black uppercase ${color}`}>{value}</span>
    </div>
  )
}
