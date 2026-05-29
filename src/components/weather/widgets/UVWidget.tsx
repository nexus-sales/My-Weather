'use client';

import { Zap, ShieldAlert } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface UVWidgetProps {
  index: number;
  title: string;
}

export default function UVWidget({ index, title }: UVWidgetProps) {
  const getUVStatus = (idx: number) => {
    if (idx <= 2) return { color: '#00ff88', label: 'Bajo', risk: 'Seguro', glow: 'rgba(0, 255, 136, 0.4)' };
    if (idx <= 5) return { color: '#ffcc00', label: 'Moderado', risk: 'Protección', glow: 'rgba(255, 204, 0, 0.4)' };
    if (idx <= 7) return { color: '#ff8c35', label: 'Alto', risk: 'Necesaria', glow: 'rgba(255, 140, 53, 0.4)' };
    if (idx <= 10) return { color: '#ff3e3e', label: 'Muy Alto', risk: 'Extrema', glow: 'rgba(255, 62, 62, 0.4)' };
    return { color: '#bf00ff', label: 'Extremo', risk: 'Peligro', glow: 'rgba(191, 0, 255, 0.4)' };
  };

  const status = getUVStatus(index);
  const progress = (index / 11) * 100;

  return (
    <WidgetWrapper title={title} icon={<Zap size={14} style={{ color: status.color }} className="animate-pulse" />}>
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Solar Radiation Sensor UI */}
        <div className="relative w-36 h-20 flex flex-col items-center justify-end overflow-hidden">
          {/* Semicircular Gauge with segments */}
          <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="uv-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ff88" />
                <stop offset="30%" stopColor="#ffcc00" />
                <stop offset="60%" stopColor="#ff8c35" />
                <stop offset="90%" stopColor="#ff3e3e" />
              </linearGradient>
            </defs>

            {/* Background Arch */}
            <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="white" strokeWidth="6" strokeOpacity="0.05" strokeLinecap="round" />
            
            {/* Color Map Arch */}
            <path 
              d="M 10,50 A 40,40 0 0,1 90,50" 
              fill="none" 
              stroke="url(#uv-grad)" 
              strokeWidth="1" 
              strokeOpacity="0.3" 
            />

            {/* Active Value Path */}
            <path
              d="M 10,50 A 40,40 0 0,1 90,50"
              fill="none"
              stroke={status.color}
              strokeWidth="6"
              strokeDasharray="126"
              strokeDashoffset={126 - (index / 11) * 126}
              strokeLinecap="round"
              className="transition-all duration-1500 ease-out"
              style={{ filter: `drop-shadow(0 0 10px ${status.glow})` }}
            />
            
            {/* Intensity Markers */}
            {[...Array(12)].map((_, i) => {
              const a = (i * 16.36 - 180) * (Math.PI / 180);
              return (
                <line 
                  key={i}
                  x1={50 + 44 * Math.cos(a)} y1={50 + 44 * Math.sin(a)}
                  x2={50 + 48 * Math.cos(a)} y2={50 + 48 * Math.sin(a)}
                  stroke="white" strokeWidth="0.5" strokeOpacity="0.1"
                />
              );
            })}
          </svg>

          {/* Central Digital Value */}
          <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-4xl font-outfit font-black text-white drop-shadow-glow leading-none">
              {Math.round(index)}
            </span>
          </div>
        </div>

        {/* Protection Warning */}
        <div className="mt-4 w-full flex items-center justify-between px-4">
           <div 
             className="px-3 py-1 rounded border flex items-center gap-2 transition-all duration-700"
             style={{ borderColor: `${status.color}40`, backgroundColor: `${status.color}10` }}
           >
             <ShieldAlert size={10} style={{ color: status.color }} />
             <span className="text-[8px] font-outfit uppercase tracking-widest" style={{ color: status.color }}>
               {status.label}
             </span>
           </div>
           
            <div className="flex flex-col items-end">
             <span className="text-[6px] text-white/30 uppercase tracking-widest">Protección</span>
             <span className="text-[9px] font-outfit text-white/60 uppercase">{status.risk}</span>
           </div>
        </div>

        {/* Solar Radiation */}
        <div className="absolute top-2 right-2 flex flex-col items-end text-right pointer-events-none">
          <span className="text-[6px] font-inter text-xs text-yellow-400/60 uppercase tracking-widest">Radiación Solar</span>
          <span className="text-[10px] font-outfit font-bold text-yellow-400">
            {Math.round(index * 80)} <span className="text-[6px] text-yellow-400/50">W/m²</span>
          </span>
        </div>
      </div>
    </WidgetWrapper>
  );
}
