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
import OfficialAlerts from './OfficialAlerts';
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
    <div className="flex flex-col gap-6 animate-fadein pb-8">
      <WeatherBackground condition={condition} intensity={intensity} />
      
      {/* Quick Access Favorites */}
      <FavoritesBar />

      {/* Intelligent Daily Briefing */}
      <DailyBriefing weather={weather} cityName={cityName} />

      {/* Official Meteoalarm Alerts (ES, DE, FR, IT, PT, NL, BE) */}
      <OfficialAlerts />

      {/* Intelligence Strip */}
      <IntelligenceStrip data={intelligence} />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        
        {/* Hero Card: Current Weather */}
        <div className="md:col-span-4 lg:col-span-3 min-w-0 h-full">
          <CurrentWeatherCard weather={weather.current} cityName={cityName} />
        </div>
        
        {/* Main Chart */}
        <div className="md:col-span-8 lg:col-span-9 min-w-0 h-full">
          <HourlyChart data={weather.hourly} />
        </div>

        {/* Telemetry Widgets (Span full width inside their own grid) */}
        <div className="col-span-1 md:col-span-12">
          <div className="flex items-center gap-3 mb-4 pl-1">
             <div className="w-2 h-2 bg-blue-400 rounded-full" />
             <h2 className="text-sm font-medium tracking-widest text-zinc-400 uppercase font-outfit">
               {t('telemetryTitle')}
             </h2>
          </div>
          <WidgetGrid weather={weather} />
        </div>

        {/* 7-Day Forecast */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 min-w-0">
          <Forecast7Days daily={weather.daily} hourly={weather.hourly} />
        </div>

        {/* Model Comparison */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 min-w-0">
          <ModelComparison lat={coords.lat} lon={coords.lon} ecmwfData={weather} />
        </div>

      </div>
      
      {/* Clean HUD Footer */}
      <div className="pt-8 mt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">{t('satelliteStable')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">{t('model')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">{t('lastSync', { time: new Date(weather.current.time).toLocaleTimeString() })}</span>
        </div>
      </div>
    </div>
  );
}
