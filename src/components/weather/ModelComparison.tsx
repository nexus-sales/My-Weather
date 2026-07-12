'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDWDData } from '@/services/dwdService';
import { fetchUKMOData } from '@/services/ukmoService';
import { WeatherData, fetchWeatherFromOWM, fetchWeatherFromTomorrow } from '@/services/weatherService';
import { Layers, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ModelComparisonProps {
  lat: number;
  lon: number;
  ecmwfData: WeatherData;
}

interface ModelCard {
  name: string;
  subtitle: string;
  color: string;
  temp?: number;
  windSpeed?: number;
  precip?: number;
}

export default function ModelComparison({ lat, lon, ecmwfData }: ModelComparisonProps) {
  const t = useTranslations('Comparison');

  const { data: iconData, isLoading: isLoadingIcon } = useQuery({
    queryKey: ['model-comparison-dwd', lat, lon],
    queryFn: () => fetchDWDData(lat, lon, 'icon_eu'),
    staleTime: 1000 * 60 * 30,
  });

  const { data: ukmoData, isLoading: isLoadingUkmo } = useQuery({
    queryKey: ['model-comparison-ukmo', lat, lon],
    queryFn: () => fetchUKMOData(lat, lon),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  // Independent model reads (not the fallback chain) — same functions that
  // already power fetchWeather's failover, just called here as data points
  // of their own. Errors stay local: a model that fails just doesn't render.
  const { data: owmData, isLoading: isLoadingOwm } = useQuery({
    queryKey: ['model-comparison-owm', lat, lon],
    queryFn: () => fetchWeatherFromOWM(lat, lon, 'metric'),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const { data: tomorrowData, isLoading: isLoadingTomorrow } = useQuery({
    queryKey: ['model-comparison-tomorrow', lat, lon],
    queryFn: () => fetchWeatherFromTomorrow(lat, lon, 'metric'),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  if (isLoadingIcon) return (
    <div className="p-6 rounded-3xl border border-white/5 bg-white/5 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-4" />
      <div className="h-20 w-full bg-white/5 rounded" />
    </div>
  );

  const ecmwf = ecmwfData.current;
  const icon = iconData?.current;

  const primarySourceLabel: Record<string, { name: string; subtitle: string }> = {
    'open-meteo': { name: 'ECMWF IFS 0.1°', subtitle: 'Global Leader' },
    owm: { name: 'OpenWeatherMap', subtitle: 'GFS Fallback' },
    tomorrow: { name: 'Tomorrow.io', subtitle: 'Fallback Active' },
  };
  const primarySource = primarySourceLabel[ecmwfData.source ?? 'open-meteo'];

  const ukmo = ukmoData?.current;

  const cards: ModelCard[] = [
    { name: primarySource.name, subtitle: primarySource.subtitle, color: '#00d4ff', temp: ecmwf.temp, windSpeed: ecmwf.windSpeed, precip: ecmwf.precip },
    { name: 'DWD ICON-EU', subtitle: 'European Precision', color: '#ff8c35', temp: icon?.temperature_2m, windSpeed: icon?.wind_speed_10m, precip: icon?.precipitation },
    // Never the primary/fallback source (unlike OWM/Tomorrow below), so it
    // always renders its own card — no "skip if already shown" check needed.
    { name: 'UK Met Office', subtitle: 'UKV / UKMO Seamless', color: '#f43f5e', temp: ukmo?.temperature_2m, windSpeed: ukmo?.wind_speed_10m, precip: ukmo?.precipitation },
  ];

  // Skip a model card if it's the same one already shown as primary (fallback kicked in).
  if (ecmwfData.source !== 'owm') {
    cards.push({ name: 'OpenWeatherMap', subtitle: 'GFS', color: '#a78bfa', temp: owmData?.current.temp, windSpeed: owmData?.current.windSpeed, precip: owmData?.current.precip });
  }
  if (ecmwfData.source !== 'tomorrow') {
    cards.push({ name: 'Tomorrow.io', subtitle: 'NowcastFusion', color: '#34d399', temp: tomorrowData?.current.temp, windSpeed: tomorrowData?.current.windSpeed, precip: tomorrowData?.current.precip });
  }

  const isFetching = isLoadingOwm || isLoadingTomorrow || isLoadingUkmo;

  const temps = cards.map((c) => c.temp).filter((v): v is number => typeof v === 'number');
  const diffTemp = temps.length > 1 ? Math.max(...temps) - Math.min(...temps) : 0;
  const isDivergent = diffTemp > 2.5;

  return (
    <div className="bg-meteorix-card border border-meteorix-border rounded-[2rem] p-8 backdrop-blur-xl animate-fadein">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Layers className="text-meteorix-blue" size={20} />
          <h3 className="text-sm font-bold font-orbitron tracking-widest text-white/90 uppercase">
            {t('title')}
          </h3>
        </div>
        {temps.length > 1 && (
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${isDivergent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-meteorix-green/20 text-meteorix-green border border-meteorix-green/30'}`}>
            {isDivergent ? t('divergence') : t('highConfidence')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.name} className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: card.color }}>{card.name}</span>
              <span className="text-[8px] text-white/30 uppercase">{card.subtitle}</span>
            </div>
            <Row label={t('temp')} value={typeof card.temp === 'number' ? `${card.temp.toFixed(1)}°C` : '--'} />
            <Row label={t('wind')} value={typeof card.windSpeed === 'number' ? `${card.windSpeed.toFixed(1)} km/h` : '--'} />
            <Row label={t('precip')} value={typeof card.precip === 'number' ? `${card.precip.toFixed(1)} mm` : '--'} />
          </div>
        ))}
      </div>

      {isFetching && (
        <p className="mt-4 text-[9px] text-white/20 uppercase tracking-widest">Sincronizando modelos adicionales...</p>
      )}

      {temps.length > 1 && (
        <div className="mt-6 p-4 rounded-2xl bg-meteorix-blue/5 border border-meteorix-blue/10 flex gap-3 items-start">
          <Info size={14} className="text-meteorix-blue mt-0.5" />
          <p className="text-[9px] leading-relaxed text-white/40">
            {t('diffNote', {
              diff: diffTemp.toFixed(1),
              info: !isDivergent
                ? t('consensusInfo')
                : t('divergenceInfo')
            })}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/5 pb-1 last:border-0 last:pb-0">
      <span className="text-[9px] text-white/40 uppercase font-medium">{label}</span>
      <span className="text-xs font-bold font-orbitron text-white/80">{value}</span>
    </div>
  );
}
