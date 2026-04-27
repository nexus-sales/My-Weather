'use client';

import { Droplets } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface RainWidgetProps {
  amount: number;
  title: string;
}

export default function RainWidget({ amount, title }: RainWidgetProps) {
  // Visualization scale
  const maxAmount = 20; 
  const heightPercent = Math.min(100, (amount / maxAmount) * 100);

  return (
    <WidgetWrapper title={title} icon={<Droplets size={14} className={amount > 0 ? 'text-meteorix-blue animate-bounce' : 'text-white/20'} />}>
      <div className="relative flex items-center gap-8 w-full px-4 h-full">
        {/* Lab-style Glass Flask with Rain Animation */}
        <div className="relative w-16 h-32 flex flex-col justify-end">
          {/* Falling Rain Animation (only if amount > 0) */}
          {amount > 0 && (
            <div className="absolute -top-4 inset-x-0 h-12 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-[1px] h-3 bg-meteorix-blue/40 animate-fall"
                  style={{ 
                    left: `${i * 25}%`, 
                    animationDuration: `${0.5 + Math.random()}s`,
                    animationDelay: `${Math.random()}s` 
                  }}
                />
              ))}
            </div>
          )}

          {/* Glass body */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
            {/* Water level */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-meteorix-blue/80 via-meteorix-blue/50 to-meteorix-blue/30 transition-all duration-2000 ease-in-out"
              style={{ height: `${heightPercent}%` }}
            >
              {/* Wave surface */}
              <div className="absolute top-0 left-0 w-[200%] h-4 bg-white/20 -translate-y-1/2 animate-wave opacity-50" />
              
              {/* Internal glow */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,212,255,0.4)]" />
            </div>

            {/* Measurement Ticks */}
            <div className="absolute inset-0 flex flex-col justify-between py-3 px-2 pointer-events-none">
              {[20, 15, 10, 5, 0].map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <div className={`h-[1px] bg-white/20 ${m % 10 === 0 ? 'w-3' : 'w-1.5'}`} />
                  {m % 10 === 0 && <span className="text-[7px] text-white/30 font-mono">{m}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col flex-1">
          <div className="flex flex-col">
            <span className="text-4xl font-orbitron font-bold text-white tracking-tighter drop-shadow-glow">
              {amount.toFixed(1)}
            </span>
            <span className="text-[10px] text-white/40 font-orbitron uppercase tracking-widest mt-1">
              Millímetros / h
            </span>
          </div>
          
          <div className={`mt-4 p-2 rounded border transition-colors duration-500 ${amount > 0 ? 'bg-meteorix-blue/10 border-meteorix-blue/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-[8px] font-orbitron text-meteorix-blue uppercase tracking-wider mb-1">Estado de Precipitación:</div>
            <div className="text-[10px] text-white/80 font-medium">
              {amount === 0 ? 'Sin lluvia detectada' : amount < 2 ? 'Llovizna ligera' : amount < 10 ? 'Lluvia moderada' : 'Lluvia intensa'}
            </div>
          </div>
          
          {amount > 0 && (
            <div className="mt-2 flex items-center gap-2 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-meteorix-blue" />
              <span className="text-[7px] font-orbitron text-meteorix-blue uppercase tracking-widest">Captando datos en tiempo real</span>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}
