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
    <div className="relative group glass-panel p-8 h-full flex flex-col justify-between">
      {/* Subtle Glow Behind Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
      
      <div>
        {/* Header Overlay */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
               <h3 className="text-[10px] tracking-widest text-zinc-400 font-medium uppercase font-outfit">
                 {d('current_weather')}
               </h3>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-zinc-300" />
              <span className="text-sm font-outfit font-semibold text-white tracking-wide uppercase">{cityName}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="text-5xl drop-shadow-md mb-2">
               {condition.icon}
             </div>
             <span className="text-[10px] font-outfit text-zinc-300 font-medium uppercase tracking-wider">{condition.label}</span>
          </div>
        </div>
        
        {/* Main Temp Display */}
        <div className="relative z-10 flex flex-col items-center py-2">
          <div className="text-[8rem] sm:text-[10rem] leading-none font-light text-white font-outfit tracking-tighter hover:scale-[1.02] transition-transform duration-500 cursor-default selection:bg-transparent flex items-start">
            {Math.round(weather.temp)}
            <span className="text-4xl sm:text-6xl font-light opacity-50 mt-4 ml-1">°</span>
          </div>
        </div>
      </div>
      
      <div>
        {/* Action Bar */}
        <div className="relative z-10 flex items-center justify-between mb-8 mt-4">
          <button 
            onClick={toggleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
              isFavorite 
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-200' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
            }`}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            <span className="text-[10px] tracking-wider font-medium uppercase font-outfit">
              {isFavorite ? d('savedFavorite') : d('addFavorite')}
            </span>
          </button>

          <div className="flex gap-2">
             <button 
               onClick={() => {
                 if (navigator.share) {
                   navigator.share({
                     title: `Weather in ${cityName}`,
                     text: `Current temperature in ${cityName} is ${Math.round(weather.temp)}°C. Check it out!`,
                     url: window.location.href,
                   });
                 } else {
                   alert('Sharing not supported on this browser.');
                 }
               }}
               className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
             >
               <Share2 size={14} />
             </button>
             <button 
               onClick={() => alert('Aether Premium UI: High fidelity meteorological visualization.')}
               className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
             >
               <Info size={14} />
             </button>
          </div>
        </div>
        
        {/* Bottom Telemetry HUD */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
          <MetricSmall label={d('feels_like')} value={`${Math.round(weather.feelsLike)}°`} color="text-zinc-200" />
          <MetricSmall label={d('humidity')} value={`${weather.humidity}%`} color="text-zinc-200" />
          <MetricSmall label={d('wind')} value={`${Math.round(weather.windSpeed)} km/h`} color="text-zinc-200" />
          <MetricSmall label={d('pressure')} value={`${Math.round(weather.pressure)} hpa`} color="text-zinc-400" />
        </div>
      </div>
    </div>
  );
}

function MetricSmall({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
       <span className="text-[9px] tracking-wider font-medium text-zinc-500 uppercase mb-1 font-outfit">{label}</span>
       <span className={`text-base font-outfit font-medium ${color}`}>{value}</span>
    </div>
  )
}
