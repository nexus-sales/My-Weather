'use client';

import { History, TrendingUp, TrendingDown } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface ClimateAnomalyWidgetProps {
  anomaly: number;
  baseline: number;
  title: string;
}

export default function ClimateAnomalyWidget({ anomaly, baseline, title }: ClimateAnomalyWidgetProps) {
  const isWarmer = anomaly > 0;
  const color = isWarmer ? '#ff3e3e' : '#00d4ff';
  const Icon = isWarmer ? TrendingUp : TrendingDown;

  return (
    <WidgetWrapper title={title} icon={<History size={14} className="text-white/70" />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
             <Icon size={20} style={{ color }} className="relative z-10" />
             <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-orbitron font-black text-white" style={{ textShadow: `0 0 10px ${color}40` }}>
                {isWarmer ? '+' : ''}{anomaly}°
              </span>
              <span className="text-[10px] text-white/40 font-mono">VS 1996</span>
            </div>
            <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Anomalía Térmica Histórica</span>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-2 border border-white/5 space-y-2 mt-4">
           <div className="flex justify-between items-center">
              <span className="text-[7px] font-orbitron text-white/40 uppercase">Referencia (30 años)</span>
              <span className="text-[9px] font-mono text-white/80">{baseline.toFixed(1)}°C</span>
           </div>
           
           {/* Visual Scale */}
           <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-10" /> {/* Zero Point */}
              <div 
                className="absolute top-0 bottom-0 h-full transition-all duration-1000"
                style={{ 
                  left: isWarmer ? '50%' : `${50 - Math.min(Math.abs(anomaly) * 5, 50)}%`,
                  width: `${Math.min(Math.abs(anomaly) * 5, 50)}%`,
                  backgroundColor: color
                }} 
              />
           </div>
           
           <p className="text-[6px] font-mono text-white/20 uppercase leading-tight italic">
             Comparativa automática basada en registros de ERA5 para esta ubicación exacta.
           </p>
        </div>
      </div>
    </WidgetWrapper>
  );
}
