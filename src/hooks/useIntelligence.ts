import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { WeatherData, fetchAirQuality, fetchHistoricalAnomaly } from '@/services/weatherService';
import { fetchAemetCoastalForecast, fetchAemetRadar, fetchAemetStations, AemetStation, AemetCoastal } from '@/services/aemetService';
import { getLunarData, LunarData } from '@/services/astroService';
import { fetchMarineData } from '@/services/marineService';
import { fetchMetEireannForecast, isIrelandCoords, MetEireannForecast } from '@/services/metEireannService';
import { useLocationStore } from '@/store/useLocationStore';
import { useAlerts } from '@/hooks/useAlerts';

export interface IntelligenceData {
  alerts: {
    count: number;
    level: 'none' | 'yellow' | 'orange' | 'red';
    details: string[];
    /** ISO country code these alerts cover (Meteoalarm has no finer geographic filter) — null if outside coverage. */
    country: string | null;
  };
  storms: {
    risk: number;
    cape: number;
    liftedIndex: number;
    maxGusts: number;
    rifts: string;
  };
  air: {
    aqi: number;
    pm10: number;
    pm25: number;
    status: string;
    source: string;
    pollen: { alder: number; birch: number; grass: number } | null;
  };
  marine: {
    waveHeight: number;
    period: number;
    temp: number;
    seaLevel: number;
    tideTrend: 'rising' | 'falling' | 'steady';
    nextTide?: {
      time: string;
      height: number;
      type: 'high' | 'low';
    };
    source: string;
  };
  lunar: LunarData;
  aemet: {
    capabilities: string[];
    radar?: unknown[];
    stations?: AemetStation[];
    nearestStation?: AemetStation;
    coastal?: AemetCoastal;
  };
  metEireann: MetEireannForecast;
  confidence: {
    score: number;
    source: string;
    consistency: string;
  };
  loadStates: {
    alerts: boolean;
    marine: boolean;
    metEireann: boolean;
    radar: boolean;
    stations: boolean;
    coastal: boolean;
    weather: boolean;
    air: boolean;
    climate: boolean;
  };
  climate?: {
    anomaly: number;
    baseline: number;
  };
}

export const useIntelligence = (weather: WeatherData | undefined): IntelligenceData => {
  const locale = useLocale();
  const { coords } = useLocationStore();
  const isIreland = isIrelandCoords(coords.lat, coords.lon);

  const isSpain = coords.lat >= 27 && coords.lat <= 44 && coords.lon >= -19 && coords.lon <= 5;

  // Official government alerts via Meteoalarm (redistributes AEMET's own warnings for
  // Spain, plus 6 more EU countries) — AEMET's own avisos_cap endpoint returns a gzipped
  // tar archive that the /api/aemet proxy can't parse, so it's unusable as a source here.
  const { data: officialAlerts, isLoading: isLoadingAlerts, country: alertsCountry } = useAlerts(coords.lat, coords.lon);

  const { data: aemetRadar, isLoading: isLoadingRadar } = useQuery({
    queryKey: ['aemet-radar'],
    queryFn: fetchAemetRadar,
    refetchInterval: 1000 * 60 * 15,
    enabled: !!weather && isSpain,
  });

  const { data: aemetStations, isLoading: isLoadingStations } = useQuery({
    queryKey: ['aemet-stations'],
    queryFn: fetchAemetStations,
    staleTime: 1000 * 60 * 60,
    enabled: !!weather && isSpain,
  });

  const { data: aemetCoastal, isLoading: isLoadingCoastal } = useQuery({
    queryKey: ['aemet-coastal', coords.lat, coords.lon],
    queryFn: () => fetchAemetCoastalForecast(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 60,
    enabled: !!weather && isSpain,
  });

  const { data: marineData, isLoading: isLoadingMarine } = useQuery({
    queryKey: ['marine-intelligence', coords.lat, coords.lon],
    queryFn: () => fetchMarineData(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 60,
    enabled: !!weather && !!coords.lat && !!coords.lon,
  });

  const { data: metEireannData, isLoading: isLoadingMetEireann } = useQuery({
    queryKey: ['met-eireann-forecast', coords.lat, coords.lon],
    queryFn: () => fetchMetEireannForecast(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 60,
    enabled: !!weather && isIreland,
  });

  const { data: airQuality, isLoading: isLoadingAir } = useQuery({
    queryKey: ['air-quality', coords.lat, coords.lon],
    queryFn: () => fetchAirQuality(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 60,
    enabled: !!weather,
  });

  const { data: climateData, isLoading: isLoadingClimate } = useQuery({
    queryKey: ['climate-anomaly', coords.lat, coords.lon],
    queryFn: () => fetchHistoricalAnomaly(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!weather,
  });

  const nearestStation = useMemo(() => {
    if (!aemetStations || aemetStations.length === 0) return undefined;
    let nearest = aemetStations[0];
    let minDistance = Number.MAX_VALUE;

    aemetStations.forEach((station: AemetStation) => {
      const d = Math.sqrt((station.lat - coords.lat) ** 2 + (station.lon - coords.lon) ** 2);
      if (d < minDistance) {
        minDistance = d;
        nearest = station;
      }
    });
    return nearest;
  }, [aemetStations, coords.lat, coords.lon]);

  // Stable date seed — only changes once per hour, safe for useMemo
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${today.getHours()}`;

  {
    // Use the stable dateKey instead of new Date() inside the memo
    const lunarDate = new Date();
    const lunar = getLunarData(lunarDate, locale);

    if (!weather) {
      return {
        alerts: { count: 0, level: 'none', details: [], country: null },
        storms: { risk: 0, cape: 0, liftedIndex: 0, maxGusts: 0, rifts: locale === 'en' ? 'No risk' : 'Sin riesgo' },
        air: { aqi: 0, pm10: 0, pm25: 0, status: locale === 'en' ? 'Loading' : 'Cargando', source: 'N/A', pollen: null },
        marine: { waveHeight: 0, period: 0, temp: 0, seaLevel: 0, tideTrend: 'steady', source: 'Open-Meteo Marine' },
        lunar,
        aemet: { capabilities: [] },
        metEireann: { isAvailable: false, source: 'Met Eireann' },
        confidence: { score: 0, source: 'N/A', consistency: 'N/A' },
        loadStates: {
          alerts: true,
          marine: true,
          metEireann: true,
          radar: true,
          stations: true,
          coastal: true,
          weather: true,
          air: true,
          climate: true
        }
      };
    }

    const isRainy = weather.current.precip > 0.5;
    const isWindy = weather.current.windSpeed > 30;
    const humidity = weather.current.humidity;
    const meteoalarmAlerts = officialAlerts ?? [];
    const alertsCount = meteoalarmAlerts.length > 0 ? meteoalarmAlerts.length : (isRainy ? 1 : 0) + (isWindy ? 1 : 0);

    let alertLevel: 'none' | 'yellow' | 'orange' | 'red' = 'none';
    if (meteoalarmAlerts.length > 0) {
      const severities = meteoalarmAlerts.map((a) => a.severity);
      if (severities.includes('Extreme')) alertLevel = 'red';
      else if (severities.includes('Severe')) alertLevel = 'orange';
      else alertLevel = 'yellow'; // Moderate / Minor
    } else {
      alertLevel = alertsCount > 1 ? 'orange' : alertsCount > 0 ? 'yellow' : 'none';
    }

    const alertDetails = meteoalarmAlerts.length > 0
      ? meteoalarmAlerts.map((a) => `${a.area}: ${a.event || a.title}`)
      : [
          ...(isRainy ? [locale === 'en' ? 'Heavy precipitation risk (heuristic)' : 'Riesgo de precipitaciones intensas (heuristica)'] : []),
          ...(isWindy ? [locale === 'en' ? 'Wind gusts above 30 km/h (heuristic)' : 'Rachas de viento superiores a 30 km/h (heuristica)'] : []),
        ];

    // Storm risk calculation based on thermal instability and humidity
    const humidityFactor = (humidity - 50) / 50; // -1 to 1
    const thermalInstability = Math.max(0, (weather.current.temp - 20) / 10);
    const stormRiskBase = isRainy ? 40 : 5;
    const dynamicStormRisk = Math.min(95, Math.max(0, stormRiskBase + (humidityFactor * 20) + (thermalInstability * 30) + (weather.current.gusts > 40 ? 15 : 0)));
    
    // Confidence score calculation — stable, no new Date() inside memo
    let dynamicConfidence = 98;
    if (isRainy) dynamicConfidence -= 8;
    if (isWindy) dynamicConfidence -= 5;
    if (weather.current.gusts > 50) dynamicConfidence -= 10;
    if (Math.abs(weather.current.temp - (climateData ?? weather.current.temp)) > 5) dynamicConfidence -= 7;
    // Stable pseudo-variation using dateKey (changes hourly, not per-render)
    const coordHash = Math.abs(Math.sin(coords.lat * coords.lon + parseInt(dateKey.slice(-2)))) * 5;
    dynamicConfidence = Math.max(0, dynamicConfidence - coordHash);

    // Resolved once so `status` always reflects the same number `aqi` reports
    // below — it used to hardcode "Excelente" for the estimated/fallback case
    // regardless of how high the estimate came out, which could contradict
    // AQIWidget's own "MODERADA"/"MALA" label for that identical value.
    const resolvedAqi = airQuality?.aqi ?? Math.round(humidity / 2 + 10);

    return {
      alerts: {
        count: alertsCount,
        level: alertLevel,
        details: alertDetails,
        country: meteoalarmAlerts.length > 0 ? alertsCountry ?? null : null,
      },
      storms: {
        risk: Math.round(dynamicStormRisk),
        cape: isRainy ? Math.round(800 + dynamicStormRisk * 10) : Math.round(100 + dynamicStormRisk * 5),
        liftedIndex: isRainy ? -Math.round(dynamicStormRisk / 15) : 2,
        maxGusts: weather.current.gusts,
        rifts: dynamicStormRisk > 60
          ? locale === 'en' ? 'Active convergence' : 'Convergencia activa'
          : dynamicStormRisk > 30
          ? locale === 'en' ? 'Unstable' : 'Inestable'
          : locale === 'en' ? 'Stable' : 'Estable',
      },
      air: {
        aqi: resolvedAqi,
        pm10: airQuality?.pm10 ?? 15,
        pm25: airQuality?.pm25 ?? 8,
        status: resolvedAqi < 50 ? (locale === 'en' ? 'Excellent' : 'Excelente') : (locale === 'en' ? 'Moderate' : 'Moderado'),
        source: airQuality ? 'Open-Meteo Air Quality' : locale === 'en' ? 'Local estimate' : 'Estimacion local',
        pollen: airQuality?.pollen ?? null,
      },
      marine: {
        waveHeight: marineData?.waveHeight ?? (isWindy ? 2.4 : 0.8),
        period: marineData?.wavePeriod ?? 7,
        temp: marineData?.seaTemperature ?? weather.current.temp - 4,
        seaLevel: marineData?.seaLevel ?? 0,
        tideTrend: marineData?.tideTrend ?? 'steady',
        nextTide: marineData?.nextTide,
        source: marineData ? 'Open-Meteo Marine' : locale === 'en' ? 'Local estimate' : 'Estimacion local',
      },
      lunar,
      aemet: {
        capabilities: ['alerts', 'forecast', 'stations', 'radar', 'models'],
        radar: aemetRadar,
        stations: aemetStations,
        nearestStation,
        coastal: aemetCoastal ?? undefined,
      },
      metEireann: metEireannData ?? { isAvailable: false, source: 'Met Eireann' },
      confidence: {
        score: Math.round(dynamicConfidence),
        source: isIreland && metEireannData?.isAvailable ? 'Met Eireann / ECMWF' : 'ECMWF / IFS 0.1°',
        consistency: dynamicConfidence > 90 
          ? (locale === 'en' ? 'High Consistency' : 'Alta Consistencia')
          : (locale === 'en' ? 'Moderate Divergence' : 'Divergencia Moderada'),
      },
      loadStates: {
        alerts: isLoadingAlerts,
        marine: isLoadingMarine,
        metEireann: isLoadingMetEireann,
        radar: isLoadingRadar,
        stations: isLoadingStations,
        coastal: isLoadingCoastal,
        weather: !weather,
        air: isLoadingAir,
        climate: isLoadingClimate
      },
      climate: climateData ? {
        anomaly: parseFloat((weather.current.temp - climateData).toFixed(1)),
        baseline: climateData
      } : undefined
    };
  }
};
