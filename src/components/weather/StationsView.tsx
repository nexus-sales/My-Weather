'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useIntelligence } from '@/hooks/useIntelligence';
import { WeatherData } from '@/services/weatherService';
import { Satellite, MapPin, Radio, Activity } from 'lucide-react';

interface StationsViewProps {
  weather: WeatherData;
}

export default function StationsView({ weather }: StationsViewProps) {
  const t = useTranslations('Stations');
  const intelligence = useIntelligence(weather);
  const { aemet } = intelligence;

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-orbitron tracking-widest text-white uppercase flex items-center gap-3">
          <Satellite className="text-meteorix-blue" />
          {t('title')}
        </h2>
        <p className="text-xs text-white/40 tracking-wider">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station Card */}
        <div className="meteorix-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-meteorix-blue/5">
             <Radio size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 rounded-2xl bg-meteorix-blue/20 text-meteorix-blue border border-meteorix-blue/30 shadow-[0_0_25px_rgba(0,212,255,0.2)]">
                  <Satellite size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-bold text-meteorix-blue/60 uppercase tracking-[0.3em] mb-1">{t('reference')}</div>
                  <h3 className="text-2xl font-black text-white font-orbitron tracking-tight">
                    {aemet.nearestStation?.ubi || (intelligence.loadStates.stations ? t('syncing') : t('outOfRange'))}
                  </h3>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <StationMetric label={t('temp')} value={`${aemet.nearestStation?.ta || '--'}°C`} color="text-white" />
               <StationMetric label={t('wind')} value={`${Math.round((aemet.nearestStation?.vvm || 0) * 3.6)} km/h`} color="text-white/80" />
               <StationMetric label={t('humidity')} value={`${aemet.nearestStation?.hr || '--'}%`} color="text-white/70" />
               <StationMetric label={t('pressure')} value={`${aemet.nearestStation?.pres || '--'} hPa`} color="text-white/60" />
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[8px] text-white/40 uppercase tracking-[0.2em] font-bold">
               <span>ID: {aemet.nearestStation?.idema || 'N/A'}</span>
               <span>{t('lastObs')}: {aemet.nearestStation ? new Date(aemet.nearestStation.fint).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities & Status */}
        <div className="space-y-6">
           <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
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
                      <div key={cap} className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                         <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAvailable ? 'bg-meteorix-green' : 'bg-red-500'}`} />
                         <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{cap}</span>
                      </div>
                    );
                 })}
              </div>
           </div>
           
           <div className="p-6 border border-meteorix-blue/20 rounded-3xl bg-meteorix-blue/5">
              <p className="text-[10px] leading-relaxed text-meteorix-blue/70 italic font-medium">
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
       <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</div>
       <div className={`text-2xl font-black font-orbitron ${color}`}>{value}</div>
    </div>
  );
}
