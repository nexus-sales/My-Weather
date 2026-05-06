'use client';

import { Cloud, Sun, CloudRain } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface CloudWidgetProps {
  coverage: number;
  title: string;
}

export default function CloudWidget({ coverage, title }: CloudWidgetProps) {
  // Determine status and icon color
  const isOvercast = coverage > 70;
  const isClear = coverage < 20;
  
  const status = isOvercast ? 'Cubierto' : isClear ? 'Despejado' : 'Parcial';
  const color = isClear ? '#fbbf24' : isOvercast ? '#94a3b8' : '#60a5fa';

  return (
    <WidgetWrapper title={title} icon={<Cloud size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Circular Gauge */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/5"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="transparent"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={238.76}
              strokeDashoffset={238.76 - (238.76 * coverage) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 5px ${color}40)` }}
            />
          </svg>
          
          {/* Percentage Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-orbitron font-black text-white leading-none">
              {coverage}<span className="text-[10px] text-white/50">%</span>
            </span>
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter mt-1">{status}</span>
          </div>
          
          {/* Decorative icons on the circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
             <Sun size={8} className="text-yellow-500/40" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
             <CloudRain size={8} className="text-blue-500/40" />
          </div>
        </div>

        {/* Small Data Strip */}
        <div className="mt-4 w-full flex justify-between px-2">
           <div className="flex flex-col">
              <span className="text-[6px] font-orbitron text-white/30 uppercase">Transparencia</span>
              <span className="text-[9px] font-mono text-white/80">{100 - coverage}%</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[6px] font-orbitron text-white/30 uppercase">Opacidad</span>
              <span className="text-[9px] font-mono text-white/80">{coverage}%</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
