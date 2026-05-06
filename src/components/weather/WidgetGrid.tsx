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
import CloudWidget from './widgets/CloudWidget';
import ClimateAnomalyWidget from './widgets/ClimateAnomalyWidget';
import MarineWidget from './widgets/MarineWidget';
import DewPointWidget from './widgets/DewPointWidget';
import StormRiskWidget from './widgets/StormRiskWidget';
import { useIntelligence } from '@/hooks/useIntelligence';

interface WidgetGridProps {
  weather: WeatherData;
}

export default function WidgetGrid({ weather }: WidgetGridProps) {
  const t = useTranslations('Dashboard');
  const intelligence = useIntelligence(weather);

  return (
    <div className="flex flex-col gap-8">
      {/* Group 1: Primary Telemetry */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 opacity-40 pl-1">
          <div className="w-1 h-3 bg-meteorix-blue rounded-full" />
          <h4 className="text-[9px] font-orbitron font-black tracking-[0.3em] uppercase">Primary Telemetry / Surface</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WindWidget speed={weather.current.windSpeed} direction={weather.current.windDir} title={t('wind')} />
          <SunWidget sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} currentTime={weather.current.time} title={`${t('sunrise')} / ${t('sunset')}`} />
          <RainWidget amount={weather.current.precip} title={t('precipitation')} />
          <UVWidget index={weather.current.uvIndex} title={t('uv_index')} />
        </div>
      </section>

      {/* Group 2: Atmospheric Physics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 opacity-40 pl-1">
          <div className="w-1 h-3 bg-meteorix-orange rounded-full" />
          <h4 className="text-[9px] font-orbitron font-black tracking-[0.3em] uppercase">Atmospheric Physics / Static</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PressureWidget pressure={weather.current.pressure} title={t('pressure')} />
          <HumidityWidget humidity={weather.current.humidity} temp={weather.current.temp} title={t('humidity')} />
          <VisibilityWidget visibility={weather.current.visibility} title={t('visibility') || 'Visibilidad'} />
          <MoonWidget data={intelligence.lunar} title={t('lunar') || 'Fase Lunar'} />
        </div>
      </section>

      {/* Group 3: Environmental Intelligence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 opacity-40 pl-1">
          <div className="w-1 h-3 bg-meteorix-green rounded-full" />
          <h4 className="text-[9px] font-orbitron font-black tracking-[0.3em] uppercase">Environmental Intelligence / Bio-Risk</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CloudWidget coverage={weather.current.cloudCover} title="Cobertura Nubosa" />
          <AQIWidget aqiValue={intelligence.air.aqi} />
          <SpaceWeatherWidget />
          <DroneFlightWidget windSpeed={weather.current.windSpeed} visibility={weather.current.visibility} rain={weather.current.precip} />
        </div>
      </section>

      {/* Group 4: Advanced Metrics & Climate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 opacity-40 pl-1">
          <div className="w-1 h-3 bg-meteorix-blue rounded-full" />
          <h4 className="text-[9px] font-orbitron font-black tracking-[0.3em] uppercase">Specialized Metrics / Climate Monitoring</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DewPointWidget temp={weather.current.temp} humidity={weather.current.humidity} title="Punto de Rocío" />
          <ClimateAnomalyWidget anomaly={intelligence.climate?.anomaly ?? 0} baseline={intelligence.climate?.baseline ?? 0} title="Registro Histórico" />
          <MarineWidget waveHeight={intelligence.marine.waveHeight} period={intelligence.marine.period} tideTrend={intelligence.marine.tideTrend} temp={intelligence.marine.temp} title="Estado del Mar" />
          <StormRiskWidget 
            risk={intelligence.storms.risk} 
            cape={intelligence.storms.cape} 
            liftedIndex={intelligence.storms.liftedIndex} 
            rifts={intelligence.storms.rifts} 
          />
        </div>
      </section>

      {/* Group 5: Base Console */}
      <section className="mt-4">
        <StationConsoleWidget outdoorTemp={weather.current.temp} outdoorHum={weather.current.humidity} />
      </section>
    </div>
  );
}
