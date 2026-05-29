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
import SurfWidget from './widgets/SurfWidget';
import DewPointWidget from './widgets/DewPointWidget';
import StormRiskWidget from './widgets/StormRiskWidget';
import SolarEnergyWidget from './widgets/SolarEnergyWidget';
import PhotographyWidget from './widgets/PhotographyWidget';
import ThermalComfortWidget from './widgets/ThermalComfortWidget';
import StargazingWidget from './widgets/StargazingWidget';
import { useIntelligence } from '@/hooks/useIntelligence';

interface WidgetGridProps {
  weather: WeatherData;
}

export default function WidgetGrid({ weather }: WidgetGridProps) {
  const t = useTranslations('Dashboard');
  const intelligence = useIntelligence(weather);

  return (
    <div className="flex flex-col gap-10">
      {/* Group 1: Primary Telemetry */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">Primary Telemetry / Surface</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WindWidget speed={weather.current.windSpeed} direction={weather.current.windDir} title={t('wind')} />
          <SunWidget sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} currentTime={weather.current.time} title={`${t('sunrise')} / ${t('sunset')}`} />
          <RainWidget amount={weather.current.precip} title={t('precipitation')} />
          <UVWidget index={weather.current.uvIndex} title={t('uv_index')} />
        </div>
      </section>

      {/* Group 2: Atmospheric Physics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">Atmospheric Physics / Static</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PressureWidget pressure={weather.current.pressure} title={t('pressure')} />
          <HumidityWidget humidity={weather.current.humidity} temp={weather.current.temp} title={t('humidity')} />
          <VisibilityWidget visibility={weather.current.visibility} title={t('visibility') || 'Visibilidad'} />
          <MoonWidget data={intelligence.lunar} title={t('lunar') || 'Fase Lunar'} />
        </div>
      </section>

      {/* Group 3: Environmental Intelligence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">Environmental Intelligence / Bio-Risk</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CloudWidget coverage={weather.current.cloudCover} title="Cobertura Nubosa" />
          <AQIWidget aqiValue={intelligence.air.aqi} dataQuality={intelligence.air.source === 'Open-Meteo Air Quality' ? 'observed' : 'estimated'} source={intelligence.air.source} />
          <SpaceWeatherWidget dataQuality="estimated" source="Indicador local hasta conectar NOAA/SWPC" />
          <DroneFlightWidget windSpeed={weather.current.windSpeed} visibility={weather.current.visibility} rain={weather.current.precip} />
        </div>
      </section>

      {/* Group 4: Advanced Metrics & Climate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">Specialized Metrics / Climate Monitoring</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DewPointWidget temp={weather.current.temp} humidity={weather.current.humidity} title="Punto de Rocío" />
          <ClimateAnomalyWidget anomaly={intelligence.climate?.anomaly ?? 0} baseline={intelligence.climate?.baseline ?? 0} title="Registro Histórico" dataQuality={intelligence.climate ? 'observed' : 'estimated'} source={intelligence.climate ? 'Open-Meteo Archive' : 'Sin histórico disponible'} />
          <MarineWidget waveHeight={intelligence.marine.waveHeight} period={intelligence.marine.period} tideTrend={intelligence.marine.tideTrend} temp={intelligence.marine.temp} title="Estado del Mar" dataQuality={intelligence.marine.source === 'Open-Meteo Marine' ? 'observed' : 'estimated'} source={intelligence.marine.source} />
          <SurfWidget 
            waveHeight={intelligence.marine.waveHeight} 
            period={intelligence.marine.period} 
            windSpeed={weather.current.windSpeed} 
            windDir={weather.current.windDir} 
            title="Surf Quality" 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StormRiskWidget 
            risk={intelligence.storms.risk} 
            cape={intelligence.storms.cape} 
            liftedIndex={intelligence.storms.liftedIndex} 
            rifts={intelligence.storms.rifts} 
            dataQuality="estimated"
            source="Índice heurístico con meteorología actual"
          />
        </div>
      </section>

      {/* Group 5: Lifestyle & Energy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">Lifestyle & Energy</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SolarEnergyWidget cloudCover={weather.current.cloudCover} uvIndex={weather.current.uvIndex} sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} />
          <PhotographyWidget sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} />
          <ThermalComfortWidget temp={weather.current.temp} humidity={weather.current.humidity} windSpeed={weather.current.windSpeed} />
          <StargazingWidget cloudCover={weather.current.cloudCover} moonPhase={intelligence.lunar.phase} moonPhaseName={intelligence.lunar.phaseKey} rain={weather.current.precip} />
        </div>
      </section>

      {/* Group 6: Base Console */}
      <section className="mt-4">
        <StationConsoleWidget outdoorTemp={weather.current.temp} outdoorHum={weather.current.humidity} />
      </section>
    </div>
  );
}
