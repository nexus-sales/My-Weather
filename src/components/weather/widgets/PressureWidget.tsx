'use client';

import { Gauge } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface PressureWidgetProps {
  pressure: number;
  title: string;
}

export default function PressureWidget({ pressure, title }: PressureWidgetProps) {
  // Pressure range: 960 to 1040 hPa
  const min = 960;
  const max = 1040;
  const progress = Math.max(0, Math.min(1, (pressure - min) / (max - min)));
  
  // Angle for the needle: from -120deg to 120deg (240deg sweep)
  const angle = (progress * 240) - 120;

  return (
    <WidgetWrapper title={title} icon={<Gauge size={14} className="text-meteorix-blue" />}>
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Professional Barometer Face */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer Case */}
            <circle cx="50" cy="50" r="48" fill="#040d22" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.2" strokeOpacity="0.05" />
            
            {/* Colored Zones */}
            <path d="M 15.4 70 A 40 40 0 0 1 30 30" fill="none" stroke="#ff3e3e" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M 30 30 A 40 40 0 0 1 70 30" fill="none" stroke="#00ff88" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M 70 30 A 40 40 0 0 1 84.6 70" fill="none" stroke="#ff8c35" strokeWidth="2" strokeOpacity="0.3" />

            {/* Major Ticks (every 10 hPa) */}
            {[...Array(9)].map((_, i) => {
              const a = (i * 30 - 120) * (Math.PI / 180);
              const val = 960 + i * 10;
              return (
                <g key={i}>
                  <line 
                    x1={50 + 38 * Math.cos(a)} y1={50 + 38 * Math.sin(a)}
                    x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
                    stroke="white" strokeWidth="1" strokeOpacity="0.4"
                  />
                  <text 
                    x={50 + 32 * Math.cos(a)} y={50 + 32 * Math.sin(a)}
                    fill="white" fillOpacity="0.2" fontSize="5" textAnchor="middle" alignmentBaseline="middle"
                    fontFamily="Orbitron"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Minor Ticks (every 2 hPa) */}
            {[...Array(41)].map((_, i) => {
              const a = (i * 6 - 120) * (Math.PI / 180);
              return (
                <line 
                  key={i}
                  x1={50 + 41 * Math.cos(a)} y1={50 + 41 * Math.sin(a)}
                  x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
                  stroke="white" strokeWidth="0.3" strokeOpacity="0.2"
                />
              );
            })}

            {/* Center Label */}
            <text x="50" y="65" fill="white" fillOpacity="0.1" fontSize="4" textAnchor="middle" fontFamily="Orbitron">BAROMETER</text>
            <text x="50" y="70" fill="white" fillOpacity="0.1" fontSize="3" textAnchor="middle" fontFamily="Orbitron">HECTOPASCALS</text>
          </svg>

          {/* High-Precision Needle */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute top-[15%] w-[1.5px] h-[35%] bg-gradient-to-t from-meteorix-blue to-white shadow-[0_0_10px_rgba(0,212,255,0.5)] rounded-full" />
              {/* Balance part */}
              <div className="absolute bottom-[40%] w-[1px] h-[10%] bg-white opacity-20" />
            </div>
          </div>

          {/* Hub Cap */}
          <div className="absolute w-4 h-4 rounded-full bg-[#030b1a] border border-white/20 shadow-xl flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-meteorix-blue animate-pulse" />
          </div>

          {/* Digital Readout Overlaid at bottom */}
          <div className="absolute bottom-6 flex flex-col items-center bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
            <span className="text-sm font-orbitron font-bold text-white drop-shadow-glow">
              {pressure.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
