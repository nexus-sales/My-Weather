'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useIntelligence } from '@/hooks/useIntelligence';
import { WeatherData } from '@/services/weatherService';
import { Satellite, Radio, Activity } from 'lucide-react';

interface StationsViewProps {
  weather: WeatherData;
}

export default function StationsView({ weather }: StationsViewProps) {
  const t = useTranslations('Stations');
  const intelligence = useIntelligence(weather);
  const { aemet } = intelligence;

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2 pl-2">
        <h2 className="text-2xl font-bold font-outfit tracking-tight text-white flex items-center gap-3">
          <Satellite className="text-blue-400" size={22} />
          {t('title')}
        </h2>
        <p className="text-xs text-zinc-400 font-inter">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station Card */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-blue-500/5">
             <Radio size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 rounded-2xl bg-white/5 text-blue-400 border border-white/5">
                  <Satellite size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-outfit font-semibold text-blue-400 uppercase tracking-[0.2em] mb-1">{t('reference')}</div>
                  <h3 className="text-2xl font-bold text-white font-outfit tracking-tight">
                    {aemet.nearestStation?.ubi || (intelligence.loadStates.stations ? t('syncing') : t('outOfRange'))}
                  </h3>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <StationMetric label={t('temp')} value={`${aemet.nearestStation?.ta || '--'}°C`} color="text-white font-semibold" />
               <StationMetric label={t('wind')} value={`${Math.round((aemet.nearestStation?.vvm || 0) * 3.6)} km/h`} color="text-zinc-200" />
               <StationMetric label={t('humidity')} value={`${aemet.nearestStation?.hr || '--'}%`} color="text-zinc-300" />
               <StationMetric label={t('pressure')} value={`${aemet.nearestStation?.pres || '--'} hPa`} color="text-zinc-400" />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-500 uppercase tracking-widest font-semibold font-inter">
               <span>ID: {aemet.nearestStation?.idema || 'N/A'}</span>
               <span>{t('lastObs')}: {aemet.nearestStation ? new Date(aemet.nearestStation.fint).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities & Status */}
        <div className="space-y-6">
            <div className="glass-panel p-6">
               <h4 className="text-[10px] font-outfit font-semibold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} /> {t('capabilities')}
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aemet.capabilities.map((cap) => {
                     const isAvailable = (cap === 'stations' && !!aemet.nearestStation) || 
                                       (cap === 'alerts' && !!intelligence.alerts) ||
                                       (cap === 'radar' && !!aemet.radar) ||
                                       (cap === 'forecast' && !!aemet.coastal) ||
                                       (cap === 'models');
                     
                     return (
                       <div key={cap} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-[9px] font-semibold text-zinc-300 uppercase tracking-widest font-inter">{cap}</span>
                       </div>
                     );
                  })}
               </div>
            </div>
            
            <div className="p-6 border border-blue-500/10 rounded-3xl bg-blue-500/5">
               <p className="text-[10px] leading-relaxed text-blue-400/80 italic font-medium font-inter">
                  {t('note')}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function StationMetric({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="space-y-2">
       <div className="text-[9px] font-outfit font-semibold text-zinc-500 uppercase tracking-widest">{label}</div>
       <div className={`text-2xl font-bold font-outfit ${color}`}>{value}</div>
    </div>
  );
}
