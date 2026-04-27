'use client';

import { WeatherData } from '@/services/weatherService';
import CurrentWeatherCard from './CurrentWeatherCard';
import HourlyChart from './HourlyChart';
import Forecast7Days from './Forecast7Days';
import IntelligenceStrip from './IntelligenceStrip';
import FavoritesBar from './FavoritesBar';
import { useIntelligence } from '@/hooks/useIntelligence';
import { useTranslations } from 'next-intl';

interface DashboardViewProps {
  weather: WeatherData;
  cityName: string;
}

export default function DashboardView({ weather, cityName }: DashboardViewProps) {
  const t = useTranslations('Dashboard');
  const intelligence = useIntelligence(weather);

  return (
    <div className="space-y-8 animate-fadein">
      {/* Quick Access Favorites */}
      <FavoritesBar />

      {/* Intelligence Strip */}
      <IntelligenceStrip data={intelligence} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CurrentWeatherCard weather={weather.current} cityName={cityName} />
        </div>
        <div className="lg:col-span-2">
          <HourlyChart data={weather.hourly} />
        </div>
      </div>

      {/* 7-Day Forecast */}
      <Forecast7Days data={weather.daily} />
      
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
