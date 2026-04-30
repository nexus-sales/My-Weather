'use client';

import React from 'react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { WeatherData } from '@/services/weatherService';
import { Satellite, MapPin, Radio, Activity } from 'lucide-react';

interface StationsViewProps {
  weather: WeatherData;
}

export default function StationsView({ weather }: StationsViewProps) {
  const intelligence = useIntelligence(weather);
  const { aemet } = intelligence;

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-orbitron tracking-widest text-white uppercase flex items-center gap-3">
          <Satellite className="text-meteorix-blue" />
          Red de Estaciones Terrestres
        </h2>
        <p className="text-xs text-white/40 tracking-wider">Monitorización en tiempo real vía AEMET OpenData y redes PWS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station Card */}
        <div className="bg-meteorix-card border border-meteorix-border rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-meteorix-blue/5">
             <Radio size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 rounded-2xl bg-meteorix-blue/20 text-meteorix-blue shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                  <Satellite size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-bold text-meteorix-blue uppercase tracking-[0.3em] mb-1">Estación de Referencia</div>
                  <h3 className="text-2xl font-black text-white font-orbitron">{aemet.nearestStation?.ubi || 'Sincronizando...'}</h3>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <StationMetric label="Temperatura" value={`${aemet.nearestStation?.ta || '--'}°C`} />
               <StationMetric label="Viento" value={`${Math.round((aemet.nearestStation?.vvm || 0) * 3.6)} km/h`} />
               <StationMetric label="Humedad" value={`${aemet.nearestStation?.hr || '--'}%`} />
               <StationMetric label="Presión" value={`${aemet.nearestStation?.pres || '--'} hPa`} />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">
               <span>ID: {aemet.nearestStation?.idema || 'N/A'}</span>
               <span>Última Obs: {aemet.nearestStation ? new Date(aemet.nearestStation.fint).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities & Status */}
        <div className="space-y-6">
           <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Activity size={14} /> Capacidades Operativas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {aemet.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                       <div className="w-1.5 h-1.5 rounded-full bg-meteorix-green animate-pulse" />
                       <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{cap}</span>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="p-6 border border-meteorix-blue/20 rounded-3xl bg-meteorix-blue/5">
              <p className="text-[10px] leading-relaxed text-meteorix-blue/70 italic font-medium">
                 "Los datos mostrados provienen de la red oficial de estaciones automáticas (EMA) de AEMET. La sincronización se realiza cada 20 minutos para garantizar la precisión sinóptica."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function StationMetric({ label, value }: any) {
  return (
    <div className="space-y-2">
       <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</div>
       <div className="text-2xl font-black text-white font-orbitron">{value}</div>
    </div>
  );
}
