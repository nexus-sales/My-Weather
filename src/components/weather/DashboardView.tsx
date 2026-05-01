'use client';

import { WeatherData } from '@/services/weatherService';
import CurrentWeatherCard from './CurrentWeatherCard';
import HourlyChart from './HourlyChart';
import Forecast7Days from './Forecast7Days';
import IntelligenceStrip from './IntelligenceStrip';
import DailyBriefing from '../briefing/DailyBriefing';
import ModelComparison from './ModelComparison';
import FavoritesBar from './FavoritesBar';
import WidgetGrid from './WidgetGrid';
import { useIntelligence } from '@/hooks/useIntelligence';
import { useTranslations } from 'next-intl';
import WeatherBackground from '../ui/WeatherBackground';
import { useLocationStore } from '@/store/useLocationStore';

interface DashboardViewProps {
  weather: WeatherData;
  cityName: string;
}

export default function DashboardView({ weather, cityName }: DashboardViewProps) {
  const t = useTranslations('Dashboard');
  const intelligence = useIntelligence(weather);
  const { coords } = useLocationStore();
  
  const condition = weather.current.precip > 0 ? 'rain' : 'none';
  const intensity = Math.min(1, weather.current.precip / 10 + 0.2);

  return (
    <div className="space-y-8 animate-fadein">
      <WeatherBackground condition={condition} intensity={intensity} />
      {/* Quick Access Favorites */}
      <FavoritesBar />

      {/* Intelligent Daily Briefing */}
      <DailyBriefing weather={weather} cityName={cityName} />

      {/* Intelligence Strip */}
      <IntelligenceStrip data={intelligence} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="md:col-span-1 min-w-0">
          <CurrentWeatherCard weather={weather.current} cityName={cityName} />
        </div>
        <div className="md:col-span-1 lg:col-span-2 min-w-0">
          <HourlyChart data={weather.hourly} />
        </div>
      </div>

      {/* Advanced Telemetry Widgets */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 pl-1">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-meteorix-blue animate-ping rounded-full" />
             <h2 className="text-[12px] font-orbitron font-black tracking-[0.5em] text-white/80 uppercase">
               {t('telemetryTitle')}
             </h2>
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-meteorix-blue/40 to-transparent" />
          <div className="hidden md:flex gap-1">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="w-4 h-1 bg-white/5 rounded-full" />
             ))}
          </div>
        </div>
        <WidgetGrid weather={weather} />
      </div>

      {/* Advanced Model Comparison */}
      <ModelComparison lat={coords.lat} lon={coords.lon} ecmwfData={weather} />

      {/* 7-Day Forecast */}
      <Forecast7Days daily={weather.daily} hourly={weather.hourly} />
      
      {/* HUD Footer (Dashboard Specific) */}
      <div className="pt-8 border-t border-white/5 flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-meteorix-green animate-pulse" />
          <span className="text-[8px] font-orbitron tracking-[0.2em] text-white/30 uppercase">{t('satelliteStable')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-meteorix-blue" />
          <span className="text-[8px] font-orbitron tracking-[0.2em] text-white/30 uppercase">{t('model')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-orbitron tracking-[0.2em] text-white/30 uppercase">{t('lastSync', { time: new Date(weather.current.time).toLocaleTimeString() })}</span>
        </div>
      </div>
    </div>
  );
}
