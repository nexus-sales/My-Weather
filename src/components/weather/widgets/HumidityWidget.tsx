'use client';

import { Droplet } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface HumidityWidgetProps {
  humidity: number;
  temp: number;
  title: string;
}

export default function HumidityWidget({ humidity, temp, title }: HumidityWidgetProps) {
  // Calculate approximate Dew Point (Magnus-Tetens formula simplified)
  const dewPoint = temp - ((100 - humidity) / 5);
  
  return (
    <WidgetWrapper title={title} icon={<Droplet size={14} className="text-meteorix-blue animate-pulse" />}>
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Modern Circular Hygrometer */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
            
            {/* Gradient Track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#hum-grad-pro)"
              strokeWidth="6"
              strokeDasharray="264"
              strokeDashoffset={264 - (humidity / 100) * 264}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.3))' }}
            />

            {/* Inner Scale */}
            {[...Array(10)].map((_, i) => (
              <line 
                key={i}
                x1="50" y1="12" x2="50" y2="15"
                stroke="white" strokeWidth="0.5" strokeOpacity="0.1"
                transform={`rotate(${i * 36} 50 50)`}
              />
            ))}
            
            <defs>
              <linearGradient id="hum-grad-pro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#0055ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Readout */}
          <div className="absolute flex flex-col items-center">
            <div className="flex items-baseline">
              <span className="text-4xl font-orbitron font-black text-white leading-none drop-shadow-glow">
                {humidity}
              </span>
              <span className="text-sm font-orbitron text-meteorix-blue opacity-60 ml-0.5">%</span>
            </div>
            <span className="text-[7px] font-orbitron text-white/30 uppercase tracking-[0.4em] mt-1">Humedad</span>
          </div>
        </div>

        {/* Secondary Telemetry (Dew Point) */}
        <div className="mt-2 w-full flex items-center justify-around px-2">
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-mono text-white/60">{dewPoint.toFixed(1)}°C</span>
             <span className="text-[6px] text-white/20 uppercase tracking-widest">Punto Rocío</span>
          </div>
          <div className="w-[1px] h-4 bg-white/5" />
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-orbitron text-meteorix-green uppercase">{humidity < 40 ? 'Seco' : humidity < 70 ? 'Ideal' : 'Húmedo'}</span>
             <span className="text-[6px] text-white/20 uppercase tracking-widest">Sensación</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
