'use client';

import { useEffect, useMemo, useState } from 'react';
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
import PollenWidget from './widgets/PollenWidget';
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
import { useSpaceWeather } from '@/hooks/useSpaceWeather';
import { useLocationStore } from '@/store/useLocationStore';

interface WidgetGridProps {
  weather: WeatherData;
}

// A ground observation only describes the same air as the selected point if it
// is both close and recent. Beyond these it is a different place or a different
// hour, and presenting it next to the current forecast would mislead rather
// than inform — so it is dropped entirely instead of shown with a caveat.
//
// The two caps differ because the networks do: AEMET has hundreds of stations
// across Spain, so something genuinely local is usually available, while METAR
// sites are airports and can be the only report for a whole region. The
// distance is always displayed either way, so the reader can weigh it.
const AEMET_MAX_DISTANCE_KM = 25;
const METAR_MAX_DISTANCE_KM = 50;
const OBSERVATION_MAX_AGE_MINUTES = 120;

export default function WidgetGrid({ weather }: WidgetGridProps) {
  const t = useTranslations('Dashboard');
  const tw = useTranslations('Widgets');
  const intelligence = useIntelligence(weather);
  const { coords } = useLocationStore();
  const { data: spaceWeather } = useSpaceWeather(coords.lat, coords.lon);

  // Ticking reference instant for the staleness gate below. Reading Date.now()
  // straight in the memo is impure (react-hooks/purity) and would also freeze
  // the check at first render, so an observation could silently go stale on
  // screen while still being presented as current.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Real anemometer reading to show beside the modelled wind. AEMET first
  // where it reaches (denser, so usually far closer), METAR everywhere else.
  // Resolves to undefined when neither has anything in range, and the widget
  // then renders exactly as before — no placeholder, no stand-in value.
  const windObservation = useMemo(() => {
    const isFresh = (observedAtMs: number) => {
      const ageMinutes = (now - observedAtMs) / 60000;
      return Number.isFinite(ageMinutes) && ageMinutes >= 0 && ageMinutes <= OBSERVATION_MAX_AGE_MINUTES;
    };

    const station = intelligence.aemet.nearestStation;
    const aemetDistance = intelligence.aemet.nearestStationDistanceKm;
    if (station && aemetDistance !== undefined && aemetDistance <= AEMET_MAX_DISTANCE_KM) {
      // AEMET reports wind in m/s. `vvm` comes back null on plenty of stations
      // (Los Rodeos among them), so the `vv` fallback is what actually carries
      // the reading most of the time.
      const speedMs = station.vvm ?? station.vv;
      // `fint` carries an explicit UTC offset ("...T08:00:00+0000"), so this
      // comparison is unambiguous regardless of the viewer's own timezone.
      if (typeof speedMs === 'number' && Number.isFinite(speedMs) && isFresh(new Date(station.fint).getTime())) {
        return {
          stationName: station.ubi,
          network: 'AEMET',
          distanceKm: aemetDistance,
          speed: speedMs * 3.6,
          gusts: typeof station.vmax === 'number' ? station.vmax * 3.6 : undefined,
          observedAt: station.fint,
        };
      }
    }

    // METAR speeds are already converted to km/h by the service.
    const metar = intelligence.metar;
    if (metar && metar.distanceKm <= METAR_MAX_DISTANCE_KM && isFresh(new Date(metar.observedAt).getTime())) {
      return {
        stationName: metar.stationName,
        network: 'METAR',
        distanceKm: metar.distanceKm,
        speed: metar.windSpeed,
        gusts: metar.windGusts,
        observedAt: metar.observedAt,
      };
    }

    return undefined;
  }, [intelligence.aemet.nearestStation, intelligence.aemet.nearestStationDistanceKm, intelligence.metar, now]);

  return (
    <div className="flex flex-col gap-10">
      {/* Group 1: Primary Telemetry */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-white/60 uppercase">{t('groups.primary')}</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WindWidget speed={weather.current.windSpeed} direction={weather.current.windDir} gusts={weather.current.gusts} title={t('wind')} daily={weather.daily} observation={windObservation} />
          <SunWidget sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} currentTime={weather.current.time} title={`${t('sunrise')} / ${t('sunset')}`} />
          <RainWidget amount={weather.current.precip} title={t('precipitation')} />
          <UVWidget index={weather.current.uvIndex} title={t('uv_index')} />
        </div>
      </section>

      {/* Group 2: Atmospheric Physics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-white/60 uppercase">{t('groups.atmospheric')}</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PressureWidget pressure={weather.current.pressure} title={t('pressure')} />
          <HumidityWidget humidity={weather.current.humidity} temp={weather.current.temp} title={t('humidity')} />
          <VisibilityWidget visibility={weather.current.visibility} title={t('visibility')} />
          <MoonWidget data={intelligence.lunar} title={t('lunar')} />
        </div>
      </section>

      {/* Group 3: Environmental Intelligence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-white/60 uppercase">{t('groups.environmental')}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CloudWidget coverage={weather.current.cloudCover} title={tw('cloud.title')} />
          <AQIWidget aqiValue={intelligence.air.aqi} dataQuality={intelligence.air.source === 'Open-Meteo Air Quality' ? 'observed' : 'estimated'} source={intelligence.air.source} />
          <SpaceWeatherWidget
            kpIndex={spaceWeather?.kpIndex ?? null}
            flareClass={spaceWeather?.flareClass ?? null}
            auroraProbability={spaceWeather?.auroraProbability ?? null}
            dataQuality="observed"
            source="NOAA SWPC"
          />
          <DroneFlightWidget windSpeed={weather.current.windSpeed} visibility={weather.current.visibility} rain={weather.current.precip} />
          {intelligence.air.pollen && (
            <PollenWidget
              alder={intelligence.air.pollen.alder}
              birch={intelligence.air.pollen.birch}
              grass={intelligence.air.pollen.grass}
              dataQuality="observed"
              source="Open-Meteo Air Quality"
            />
          )}
        </div>
      </section>

      {/* Group 4: Advanced Metrics & Climate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-white/60 uppercase">{t('groups.specialized')}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DewPointWidget temp={weather.current.temp} humidity={weather.current.humidity} title={tw('dewPoint.title')} />
          <ClimateAnomalyWidget anomaly={intelligence.climate?.anomaly ?? 0} baseline={intelligence.climate?.baseline ?? 0} title={tw('climate.title')} dataQuality={intelligence.climate ? 'observed' : 'estimated'} source={intelligence.climate ? 'Open-Meteo Archive' : tw('climate.noHistory')} />
          <MarineWidget waveHeight={intelligence.marine.waveHeight} period={intelligence.marine.period} tideTrend={intelligence.marine.tideTrend} temp={intelligence.marine.temp} title={tw('marine.title')} dataQuality={intelligence.marine.source === 'Open-Meteo Marine' ? 'observed' : 'estimated'} source={intelligence.marine.source} />
          <SurfWidget 
            waveHeight={intelligence.marine.waveHeight} 
            period={intelligence.marine.period} 
            windSpeed={weather.current.windSpeed} 
            windDir={weather.current.windDir} 
            title={tw('surf.title')} 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StormRiskWidget 
            risk={intelligence.storms.risk} 
            cape={intelligence.storms.cape} 
            liftedIndex={intelligence.storms.liftedIndex} 
            rifts={intelligence.storms.rifts} 
            dataQuality="estimated"
            source={tw('storm.source')}
          />
        </div>
      </section>

      {/* Group 5: Lifestyle & Energy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <h4 className="text-[11px] font-outfit font-semibold tracking-widest text-white/60 uppercase">{t('groups.lifestyle')}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SolarEnergyWidget cloudCover={weather.current.cloudCover} uvIndex={weather.current.uvIndex} sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} />
          <PhotographyWidget sunrise={weather.daily.sunrise[0]} sunset={weather.daily.sunset[0]} />
          <ThermalComfortWidget temp={weather.current.temp} feelsLike={weather.current.feelsLike} />
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
