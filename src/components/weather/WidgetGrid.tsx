'use client';

import { WeatherData } from '@/services/weatherService';
import { useTranslations } from 'next-intl';
import WindWidget from './widgets/WindWidget';
import SunWidget from './widgets/SunWidget';
import RainWidget from './widgets/RainWidget';
import UVWidget from './widgets/UVWidget';
import PressureWidget from './widgets/PressureWidget';
import HumidityWidget from './widgets/HumidityWidget';
import VisibilityWidget from './widgets/VisibilityWidget';
import MoonWidget from './widgets/MoonWidget';
import StationConsoleWidget from './widgets/StationConsoleWidget';
import DroneFlightWidget from './widgets/DroneFlightWidget';
import AQIWidget from './widgets/AQIWidget';
import SpaceWeatherWidget from './widgets/SpaceWeatherWidget';
import { useIntelligence } from '@/hooks/useIntelligence';

interface WidgetGridProps {
  weather: WeatherData;
}

export default function WidgetGrid({ weather }: WidgetGridProps) {
  const t = useTranslations('Dashboard');
  const intelligence = useIntelligence(weather);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Row 1 */}
      <WindWidget 
        speed={weather.current.windSpeed} 
        direction={weather.current.windDir} 
        title={t('wind')} 
      />
      
      <SunWidget 
        sunrise={weather.daily.sunrise[0]} 
        sunset={weather.daily.sunset[0]} 
        currentTime={weather.current.time}
        title={`${t('sunrise')} / ${t('sunset')}`}
      />
      
      <RainWidget 
        amount={weather.current.precip} 
        title={t('precipitation')} 
      />
      
      <UVWidget 
        index={weather.current.uvIndex} 
        title={t('uv_index')} 
      />

      {/* Row 2 */}
      <PressureWidget 
        pressure={weather.current.pressure} 
        title={t('pressure')} 
      />

      <HumidityWidget 
        humidity={weather.current.humidity} 
        temp={weather.current.temp}
        title={t('humidity')} 
      />

      <VisibilityWidget 
        visibility={weather.current.visibility} 
        title={t('visibility') || 'Visibilidad'} 
      />

      <MoonWidget 
        data={intelligence.lunar} 
        title={t('lunar') || 'Fase Lunar'} 
      />
      
      {/* Experimental Telemetry Row */}
      <DroneFlightWidget 
        windSpeed={weather.current.windSpeed} 
        visibility={weather.current.visibility} 
        rain={weather.current.precip} 
      />
      
      <AQIWidget aqiValue={Math.floor(Math.random() * 80) + 20} />
      
      <SpaceWeatherWidget />

      {/* Spacing to fill grid if needed */}
      <div className="hidden lg:block" />

      {/* Station Console (Indoor 3-in-1, Bubble Level, Solar) */}
      <div className="sm:col-span-2 lg:col-span-4 mt-4">
        <StationConsoleWidget />
      </div>
    </div>
  );
}
