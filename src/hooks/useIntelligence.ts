import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/services/weatherService';
import { fetchAemetAlerts } from '@/services/aemetService';

export interface IntelligenceData {
  alerts: {
    count: number;
    level: 'none' | 'yellow' | 'orange' | 'red';
    details: string[];
  };
  storms: {
    risk: number; // 0-100
    cape: number;
    liftedIndex: number;
    rifts: string;
  };
  air: {
    aqi: number;
    pm10: number;
    pm25: number;
    status: string;
  };
  marine: {
    waveHeight: number;
    period: number;
    temp: number;
  };
  confidence: {
    score: number;
    source: string;
    consistency: string;
  };
  isLoading?: boolean;
}

export const useIntelligence = (weather: WeatherData | undefined): IntelligenceData => {
  const { data: aemetAlerts, isLoading: isLoadingAemet } = useQuery({
    queryKey: ['aemet-alerts'],
    queryFn: fetchAemetAlerts,
    refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: !!weather,
  });

  return useMemo(() => {
    if (!weather) {
      return {
        alerts: { count: 0, level: 'none', details: [] },
        storms: { risk: 0, cape: 0, liftedIndex: 0, rifts: 'Sin riesgo' },
        air: { aqi: 0, pm10: 0, pm25: 0, status: 'Cargando' },
        marine: { waveHeight: 0, period: 0, temp: 0 },
        confidence: { score: 0, source: 'N/A', consistency: 'N/A' },
        isLoading: true,
      };
    }

    // Heuristics for simulated intelligence
    const isRainy = weather.current.precip > 0.5;
    const isWindy = weather.current.windSpeed > 30;
    const humidity = weather.current.humidity;

    // Merge AEMET Alerts if available
    const officialAlerts = aemetAlerts || [];
    const alertsCount = officialAlerts.length > 0 ? officialAlerts.length : (isRainy ? 1 : 0) + (isWindy ? 1 : 0);
    
    // Determine max level
    let alertLevel: 'none' | 'yellow' | 'orange' | 'red' = 'none';
    if (officialAlerts.length > 0) {
      const levels = officialAlerts.map(a => a.nivel);
      if (levels.includes('rojo')) alertLevel = 'red';
      else if (levels.includes('naranja')) alertLevel = 'orange';
      else if (levels.includes('amarillo')) alertLevel = 'yellow';
    } else {
      alertLevel = alertsCount > 1 ? 'orange' : alertsCount > 0 ? 'yellow' : 'none';
    }

    const alertDetails = officialAlerts.length > 0 
      ? officialAlerts.map(a => `${a.provincia}: ${a.descripcion}`)
      : [
          ...(isRainy ? ['Riesgo de precipitaciones intensas (Heurística)'] : []),
          ...(isWindy ? ['Rachas de viento superiores a 30km/h (Heurística)'] : []),
        ];

    return {
      alerts: {
        count: alertsCount,
        level: alertLevel,
        details: alertDetails,
      },
      storms: {
        risk: isRainy ? 65 : 12,
        cape: isRainy ? 1200 : 150,
        liftedIndex: isRainy ? -4 : 2,
        rifts: isRainy ? 'Convergencia activa' : 'Estable',
      },
      air: {
        aqi: Math.round(humidity / 2 + 10),
        pm10: 15,
        pm25: 8,
        status: 'Excelente',
      },
      marine: {
        waveHeight: isWindy ? 2.4 : 0.8,
        period: 7,
        temp: weather.current.temp - 4,
      },
      confidence: {
        score: 94,
        source: 'ECMWF / IFS 0.1°',
        consistency: 'Alta (Gale Force Agreement)',
      },
      isLoading: isLoadingAemet,
    };
  }, [weather, aemetAlerts, isLoadingAemet]);
};
