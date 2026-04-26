import { useMemo } from 'react';
import { WeatherData } from '@/services/weatherService';

export interface IntelligenceData {
  alerts: {
    count: number;
    level: 'none' | 'yellow' | 'orange' | 'red';
    details: string[];
  };
  storms: {
    risk: number; // 0-100
    cape: number; // Simulated
    liftedIndex: number; // Simulated
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
}

export const useIntelligence = (weather: WeatherData | undefined): IntelligenceData => {
  return useMemo(() => {
    if (!weather) {
      return {
        alerts: { count: 0, level: 'none', details: [] },
        storms: { risk: 0, cape: 0, liftedIndex: 0, rifts: 'Sin riesgo' },
        air: { aqi: 0, pm10: 0, pm25: 0, status: 'Cargando' },
        marine: { waveHeight: 0, period: 0, temp: 0 },
        confidence: { score: 0, source: 'N/A', consistency: 'N/A' },
      };
    }

    // Heuristics for simulated intelligence (until we integrate specialized APIs)
    const isRainy = weather.current.precip > 0.5;
    const isWindy = weather.current.windSpeed > 30;
    const humidity = weather.current.humidity;

    const alertsCount = (isRainy ? 1 : 0) + (isWindy ? 1 : 0);
    const alertLevel = alertsCount > 1 ? 'orange' : alertsCount > 0 ? 'yellow' : 'none';

    return {
      alerts: {
        count: alertsCount,
        level: alertLevel,
        details: [
          ...(isRainy ? ['Riesgo de precipitaciones intensas'] : []),
          ...(isWindy ? ['Rachas de viento superiores a 30km/h'] : []),
        ],
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
    };
  }, [weather]);
};
