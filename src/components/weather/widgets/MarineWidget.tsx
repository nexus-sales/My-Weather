'use client';

import { Waves, ArrowUpRight, ArrowDownRight, Anchor } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface MarineWidgetProps {
  waveHeight: number;
  period: number;
  tideTrend: 'rising' | 'falling' | 'steady';
  temp: number;
  title: string;
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

export default function MarineWidget({ waveHeight, period, tideTrend, temp, title, dataQuality, source }: MarineWidgetProps) {
  const TrendIcon = tideTrend === 'rising' ? ArrowUpRight : tideTrend === 'falling' ? ArrowDownRight : Anchor;
  const trendLabel = tideTrend === 'rising' ? 'Subiendo' : tideTrend === 'falling' ? 'Bajando' : 'Estable';

  return (
    <WidgetWrapper title={title} icon={<Waves size={14} className="text-sky-400" />} dataQuality={dataQuality} source={source}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-2xl font-outfit font-black text-white leading-none">
                {waveHeight.toFixed(1)}<span className="text-[10px] text-white/65 ml-1">m</span>
              </span>
              <span className="text-[7px] font-inter text-xs text-white/60 uppercase tracking-widest mt-1">Altura de Ola</span>
           </div>
           
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-sky-400">
                 <TrendIcon size={12} />
                 <span className="text-[9px] font-inter text-xs font-bold uppercase tracking-tighter">{trendLabel}</span>
              </div>
              <span className="text-[7px] font-inter text-xs text-white/50 uppercase tracking-widest mt-0.5">Marea</span>
           </div>
        </div>

        {/* Dynamic Wave Visualizer */}
        <div className="relative h-12 w-full mt-2 bg-sky-500/5 rounded-lg border border-sky-500/10 overflow-hidden flex items-end">
           <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <span className="text-[6px] font-inter text-xs text-sky-400 uppercase tracking-[0.5em]">Telemetry.Ocean_Data</span>
           </div>
           
           {/* Simple CSS Wave Simulation */}
           <div className="w-full h-1/2 bg-sky-500/20 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400/50 animate-pulse" />
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 w-1 bg-sky-400/30" 
                  style={{ 
                    left: `${i * 25}%`, 
                    height: `${40 + ((i * 17) % 61)}%`,
                    animation: `wave-bounce ${2 + i}s infinite alternate ease-in-out` 
                  }} 
                />
              ))}
           </div>
        </div>

        <div className="flex justify-between mt-4 border-t border-white/5 pt-2">
           <div className="flex flex-col">
              <span className="text-[6px] font-outfit text-white/60 uppercase">Periodo</span>
              <span className="text-[10px] font-inter text-xs text-white/80">{period}s</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[6px] font-outfit text-white/60 uppercase">Agua</span>
              <span className="text-[10px] font-inter text-xs text-white/80">{temp.toFixed(1)}°C</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
