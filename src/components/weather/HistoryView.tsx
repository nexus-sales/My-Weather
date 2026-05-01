'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { fetchWeatherHistory } from '@/services/weatherService';
import { useLocationStore } from '@/store/useLocationStore';
import { History, Thermometer, Droplets, Wind } from 'lucide-react';

export default function HistoryView() {
  const t = useTranslations('History');
  const { coords } = useLocationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['weather-history', coords.lat, coords.lon],
    queryFn: () => fetchWeatherHistory(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
       <History className="text-white/10 mb-4 animate-spin" size={40} />
       <div className="text-[10px] tracking-widest text-white/20 uppercase font-orbitron">{t('sync')}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-orbitron tracking-widest text-white uppercase flex items-center gap-3">
          <History className="text-meteorix-blue" />
          {t('title')}
        </h2>
        <p className="text-xs text-white/40 tracking-wider">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.daily.time.map((date, i) => (
          <div key={date} className="bg-meteorix-card border border-meteorix-border rounded-2xl p-6 hover:border-meteorix-blue/30 transition-all group">
            <div className="text-[10px] font-bold text-white/30 uppercase mb-4 tracking-widest border-b border-white/5 pb-2">
              {new Date(date).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
            <div className="space-y-4">
               <HistoryRow icon={<Thermometer size={12} />} label={t('maxMin')} value={`${data.daily.tempMax[i]}° / ${data.daily.tempMin[i]}°`} color="text-meteorix-blue" />
               <HistoryRow icon={<Droplets size={12} />} label={t('rain')} value={`${data.daily.precipSum[i]} mm`} color="text-meteorix-blue/60" />
               <HistoryRow icon={<Wind size={12} />} label={t('wind')} value={`${Math.round(data.daily.windMax[i])} km/h`} color="text-white/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HistoryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function HistoryRow({ icon, label, value, color }: HistoryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-white/20">{icon}</div>
        <span className="text-[9px] uppercase tracking-tighter text-white/40 font-bold">{label}</span>
      </div>
      <span className={`text-[11px] font-bold font-orbitron ${color}`}>{value}</span>
    </div>
  );
}
