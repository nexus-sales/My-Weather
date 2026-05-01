'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDWDData } from '@/services/dwdService';
import { WeatherData } from '@/services/weatherService';
import { Layers, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ModelComparisonProps {
  lat: number;
  lon: number;
  ecmwfData: WeatherData;
}

export default function ModelComparison({ lat, lon, ecmwfData }: ModelComparisonProps) {
  const t = useTranslations('Comparison');
  const { data: iconData, isLoading } = useQuery({
    queryKey: ['model-comparison', lat, lon],
    queryFn: () => fetchDWDData(lat, lon, 'icon_eu'),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) return (
    <div className="p-6 rounded-3xl border border-white/5 bg-white/5 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-4" />
      <div className="h-20 w-full bg-white/5 rounded" />
    </div>
  );

  const ecmwf = ecmwfData.current;
  const icon = iconData?.current;

  const diffTemp = icon ? Math.abs(ecmwf.temp - icon.temperature_2m) : 0;
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
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${isDivergent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-meteorix-green/20 text-meteorix-green border border-meteorix-green/30'}`}>
          {isDivergent ? t('divergence') : t('highConfidence')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-meteorix-blue uppercase tracking-tighter">ECMWF IFS 0.1°</span>
            <span className="text-[8px] text-white/30 uppercase">Global Leader</span>
          </div>
          <Row label={t('temp')} value={`${ecmwf.temp.toFixed(1)}°C`} />
          <Row label={t('wind')} value={`${ecmwf.windSpeed.toFixed(1)} km/h`} />
          <Row label={t('precip')} value={`${ecmwf.precip.toFixed(1)} mm`} />
        </div>

        <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-meteorix-orange uppercase tracking-tighter">DWD ICON-EU</span>
            <span className="text-[8px] text-white/30 uppercase">European Precision</span>
          </div>
          <Row label={t('temp')} value={`${icon?.temperature_2m?.toFixed(1) || '--'}°C`} />
          <Row label={t('wind')} value={`${icon?.wind_speed_10m?.toFixed(1) || '--'} km/h`} />
          <Row label={t('precip')} value={`${icon?.precipitation?.toFixed(1) || '--'} mm`} />
        </div>
      </div>

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
