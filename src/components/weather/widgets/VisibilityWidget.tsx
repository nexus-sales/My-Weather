'use client';

import { Radar } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface VisibilityWidgetProps {
  visibility: number;
  title: string;
}

export default function VisibilityWidget({ visibility, title }: VisibilityWidgetProps) {
  const km = visibility > 1000 ? visibility / 1000 : visibility;
  const progress = Math.min(100, (km / 12) * 100);

  return (
    <WidgetWrapper title={title} icon={<Radar size={14} className="text-meteorix-blue animate-pulse" />}>
      <div className="relative flex flex-col items-center justify-center w-full px-4 h-full">
        {/* Lidar/Laser Telemetry Visualization */}
        <div className="relative w-full h-20 mb-4 bg-[#050a1a]/60 rounded-lg border border-white/5 overflow-hidden flex items-end">
          {/* Depth Grid Lines */}
          <div className="absolute inset-0 flex justify-between px-2 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-full w-[1px] bg-white" />
            ))}
          </div>

          {/* Laser Beam Path */}
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full h-[1px] bg-white/5" />
          </div>

          {/* Active Range Beam */}
          <div 
            className="absolute top-1/2 left-0 h-16 -translate-y-1/2 bg-gradient-to-r from-transparent via-meteorix-blue/40 to-meteorix-blue shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-1500 ease-in-out"
            style={{ width: `${progress}%` }}
          >
            {/* Lead Pulse */}
            <div className="absolute right-0 top-0 h-full w-[2px] bg-white animate-pulse" />
            
            {/* Interference wave */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] opacity-20" />
          </div>

          {/* Distance Markers */}
          <div className="absolute bottom-1 w-full flex justify-between px-2">
             {[0, 3, 6, 9, 12].map(d => (
               <span key={d} className="text-[6px] font-mono text-white/20">{d}km</span>
             ))}
          </div>
        </div>

        {/* Metric Readout */}
        <div className="flex flex-col items-center">
           <div className="flex items-baseline gap-1.5">
             <span className="text-4xl font-orbitron font-bold text-white tracking-tighter drop-shadow-glow">
               {km.toFixed(1)}
             </span>
             <span className="text-sm font-orbitron text-meteorix-blue opacity-60">KM</span>
           </div>
           
           <div className="mt-2 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${km > 5 ? 'bg-meteorix-green' : 'bg-meteorix-orange'} animate-pulse`} />
             <span className="text-[8px] font-orbitron text-white/40 uppercase tracking-[0.2em]">
               {km > 8 ? 'Visibilidad Óptima' : km > 3 ? 'Visibilidad Moderada' : 'Alcance Reducido'}
             </span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
