'use client';

import { useState } from 'react';
import { ShieldAlert, Zap, Wind, Waves, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { IntelligenceData } from '@/hooks/useIntelligence';

interface IntelligenceStripProps {
  data: IntelligenceData;
}

export default function IntelligenceStrip({ data }: IntelligenceStripProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const CARDS = [
    { id: 'alerts', label: 'AVISOS', icon: ShieldAlert, color: data.alerts.level === 'none' ? 'text-white/20' : 'text-meteorix-orange', value: data.alerts.count > 0 ? `${data.alerts.count} ACTIVOS` : 'SIN RIESGO' },
    { id: 'storms', label: 'TORMENTAS', icon: Zap, color: data.storms.risk > 50 ? 'text-yellow-400' : 'text-white/20', value: `${data.storms.risk}% RIESGO` },
    { id: 'air', label: 'AIRE', icon: Wind, color: 'text-meteorix-green', value: `AQI ${data.air.aqi}` },
    { id: 'marine', label: 'MAR/COSTA', icon: Waves, color: 'text-blue-400', value: `${data.marine.waveHeight}m OLA` },
    { id: 'confidence', label: 'CONFIANZA', icon: CheckCircle2, color: 'text-meteorix-blue', value: `${data.confidence.score}% ALTA` },
  ];

  return (
    <div className="w-full space-y-4 animate-fadein" style={{ animationDelay: '100ms' }}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CARDS.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveCard(isActive ? null : card.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-meteorix-blue/10 border-meteorix-blue/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]' 
                  : 'bg-meteorix-card border-meteorix-border hover:border-white/10'
              }`}
            >
              <card.icon className={`w-5 h-5 mb-3 ${card.color}`} />
              <span className="text-[8px] tracking-[0.2em] font-bold text-white/30 uppercase mb-1">{card.label}</span>
              <span className="text-[10px] font-bold font-orbitron tracking-widest text-white/80">{card.value}</span>
              <div className="mt-2">
                {isActive ? <ChevronUp size={10} className="text-meteorix-blue/50" /> : <ChevronDown size={10} className="text-white/10" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {activeCard && (
        <div className="bg-meteorix-card/60 border border-meteorix-border rounded-2xl p-6 backdrop-blur-xl animate-fadein border-t-meteorix-blue/30">
          {activeCard === 'alerts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] tracking-widest text-meteorix-orange font-bold mb-4 uppercase">Alertas Activas (MeteoAlarm)</h4>
                <div className="space-y-2">
                  {data.alerts.details.length > 0 ? data.alerts.details.map((d, i) => (
                    <div key={i} className="text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-meteorix-orange animate-ping" />
                      {d}
                    </div>
                  )) : <div className="text-xs text-white/30 italic">No hay avisos meteorológicos en vigor.</div>}
                </div>
              </div>
            </div>
          )}
          {activeCard === 'storms' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">CAPE Index</div>
                <div className="text-lg font-bold font-orbitron text-yellow-500">{data.storms.cape} J/kg</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Lifted Index</div>
                <div className="text-lg font-bold font-orbitron text-yellow-500">{data.storms.liftedIndex}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Estado Convectivo</div>
                <div className="text-lg font-bold font-orbitron">{data.storms.rifts}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Rachas Máx.</div>
                <div className="text-lg font-bold font-orbitron">54 km/h</div>
              </div>
            </div>
          )}
          {activeCard === 'air' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">AQI Global</div>
                <div className="text-lg font-bold font-orbitron text-meteorix-green">{data.air.aqi}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">PM10</div>
                <div className="text-lg font-bold font-orbitron">{data.air.pm10} µg/m³</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">PM2.5</div>
                <div className="text-lg font-bold font-orbitron">{data.air.pm25} µg/m³</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Calidad</div>
                <div className="text-lg font-bold font-orbitron uppercase">{data.air.status}</div>
              </div>
            </div>
          )}
          {activeCard === 'marine' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Altura Ola</div>
                <div className="text-lg font-bold font-orbitron text-blue-400">{data.marine.waveHeight}m</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Periodo</div>
                <div className="text-lg font-bold font-orbitron">{data.marine.period}s</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Temperatura Mar</div>
                <div className="text-lg font-bold font-orbitron">{data.marine.temp}°C</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] tracking-widest text-white/30 uppercase">Estado Mar</div>
                <div className="text-lg font-bold font-orbitron uppercase">Marejadilla</div>
              </div>
            </div>
          )}
          {activeCard === 'confidence' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-[10px] tracking-widest text-meteorix-blue font-bold mb-2 uppercase">Análisis de Calidad de Previsión</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Basado en el acuerdo entre los modelos **ECMWF (IFS)**, **GFS (NOAA)** e **ICON (DWD)**. 
                    Actualmente hay un consenso del **{data.confidence.score}%** en la trayectoria de sistemas.
                  </p>
                </div>
                <div className="bg-meteorix-blue/10 p-4 rounded-xl border border-meteorix-blue/20">
                  <div className="text-2xl font-black font-orbitron text-meteorix-blue">{data.confidence.score}%</div>
                  <div className="text-[8px] tracking-widest text-white/30 text-center">TRUST SCORE</div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex gap-8">
                <div className="text-[9px] font-bold text-white/40 uppercase">Fuente: <span className="text-white/70">{data.confidence.source}</span></div>
                <div className="text-[9px] font-bold text-white/40 uppercase">Consistencia: <span className="text-white/70">{data.confidence.consistency}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
