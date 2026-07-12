'use client';

import { Wind } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface WindWidgetProps {
  speed: number;
  direction: number;
  gusts?: number;
  title: string;
}

export default function WindWidget({ speed, direction, gusts, title }: WindWidgetProps) {
  const duration = speed > 0 ? Math.max(0.4, 25 / speed) : 0;
  // Gusts noticeably above sustained speed = more relevant to flag than a static "stable" label.
  const isGusty = typeof gusts === 'number' && gusts > speed * 1.3 && gusts - speed > 5;
  
  // Directions for the compass
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return (
    <WidgetWrapper title={title} icon={<Wind size={14} className="animate-pulse text-blue-400" />}>
      <div className="relative flex flex-col items-center w-full h-full">
        {/* Compass & Telemetry Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 rounded-full border border-white/5 bg-zinc-900/40 shadow-inner" />
          
          {/* Direction Markers */}
          <svg viewBox="0 0 100 100" className="absolute w-32 h-32 opacity-20">
            {directions.map((d, i) => {
              const a = (i * 45 - 90) * (Math.PI / 180);
              return (
                <text 
                  key={d}
                  x={50 + 42 * Math.cos(a)} 
                  y={50 + 42 * Math.sin(a)}
                  fill="white" fontSize="6" textAnchor="middle" alignmentBaseline="middle"
                  fontFamily="Orbitron"
                >
                  {d}
                </text>
              );
            })}
            {/* Compass Ticks */}
            {[...Array(72)].map((_, i) => (
              <line 
                key={i}
                x1="50" y1="12" x2="50" y2={i % 9 === 0 ? "8" : "10"}
                stroke="white" strokeWidth={i % 9 === 0 ? "0.5" : "0.2"}
                transform={`rotate(${i * 5} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Turbine Rotor */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Support Mast */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-t from-transparent via-white/10 to-white/40 rounded-full" />
          
          {/* Animated Rotor */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ 
              animation: duration > 0 ? `spin ${duration}s linear infinite` : 'none',
              transform: `rotate(${direction}deg)` 
            }}
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-sm">
              {[0, 120, 240].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 50 50)`}>
                  <path
                    d="M50 50 L50 10 Q65 10 55 50 Z"
                    fill="url(#blade-gradient)"
                    stroke="rgba(96, 165, 250, 0.5)"
                    strokeWidth="0.5"
                  />
                  <line x1="50" y1="50" x2="50" y2="20" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                </g>
              ))}
              <circle cx="50" cy="50" r="5" className="fill-[#030b1a] stroke-blue-400 stroke-2" />
              <circle cx="50" cy="50" r="1.5" className="fill-blue-400 animate-pulse" />
              
              <defs>
                <linearGradient id="blade-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="rgba(0, 80, 255, 0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Data Overlay */}
        <div className="mt-1 flex flex-col items-center">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-outfit font-bold text-white tracking-tighter leading-none drop-shadow-glow">
              {speed.toFixed(1)}
            </span>
            <span className="text-[10px] text-blue-400 font-outfit uppercase tracking-widest opacity-80">km/h</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10">
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
               <span className="text-[8px] font-inter text-xs text-white/50">{direction}° {directions[Math.round(direction/45)%8]}</span>
            </div>
            {typeof gusts === 'number' && (
              <>
                <div className="w-[1px] h-2 bg-white/10" />
                <span className={`text-[8px] font-outfit uppercase tracking-tighter ${isGusty ? 'text-orange-400' : 'text-emerald-400'}`}>
                  Rachas {gusts.toFixed(0)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
