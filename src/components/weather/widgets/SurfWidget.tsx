'use client';

import { Waves, Star } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface SurfWidgetProps {
  waveHeight: number;
  period: number;
  windSpeed: number;
  windDir: number;
  title: string;
}

export default function SurfWidget({ waveHeight, period, windSpeed, windDir, title }: SurfWidgetProps) {
  // Surf Rating Logic
  let rating = 0;
  let condition = "Plato";
  let color = "text-gray-400";

  if (waveHeight >= 1.5 && period >= 10) {
    rating = 5;
    condition = "Épico";
    color = "text-purple-400";
  } else if (waveHeight >= 1.0 && period >= 8) {
    rating = 4;
    condition = "Muy Bueno";
    color = "text-green-400";
  } else if (waveHeight >= 0.6 && period >= 6) {
    rating = 3;
    condition = "Aceptable";
    color = "text-yellow-400";
  } else if (waveHeight >= 0.3 && period >= 4) {
    rating = 2;
    condition = "Pobre";
    color = "text-orange-400";
  } else {
    rating = 1;
    condition = "Plato";
    color = "text-gray-400";
  }

  // Energy Calculation (Joules approximation based on wave height squared times period)
  const energy = Math.round((waveHeight * waveHeight) * period * 10);

  return (
    <WidgetWrapper title={title} icon={<Waves size={14} className="text-cyan-400" />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-2xl font-outfit font-black text-white leading-none">
                {waveHeight.toFixed(1)}<span className="text-[10px] text-white/50 ml-1">m</span>
              </span>
              <span className="text-[7px] font-inter text-xs text-white/40 uppercase tracking-widest mt-1">Olas</span>
           </div>
           
           <div className="flex flex-col items-end">
              <div className={`flex items-center gap-1 ${color}`}>
                 <span className="text-[10px] font-outfit font-bold uppercase tracking-tighter">{condition}</span>
              </div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={8} className={i < rating ? "fill-current " + color : "text-white/10"} />
                ))}
              </div>
           </div>
        </div>

        {/* Dynamic Surf Visualizer */}
        <div className="relative h-12 w-full mt-2 bg-cyan-900/20 rounded-lg border border-cyan-500/10 overflow-hidden flex items-end justify-center">
           <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-10">
              <span className="text-[6px] font-inter text-xs text-cyan-400 uppercase tracking-[0.5em]">Surf.Telemetry</span>
           </div>
           
           {/* Simple CSS Wave Simulation for Surfers */}
           <div className="w-full relative flex items-end justify-center" style={{ height: `${Math.min(100, Math.max(30, waveHeight * 40))}%` }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/60 animate-pulse" />
              <div className="w-full h-full bg-gradient-to-t from-cyan-600/40 to-cyan-400/20" />
              {/* Surfer point indicator */}
              <div 
                className="absolute w-2 h-2 bg-white rounded-full shadow-sm z-20"
                style={{ 
                  animation: `surf-ride ${Math.max(2, period / 2)}s infinite alternate ease-in-out` 
                }} 
              />
           </div>
        </div>

        <div className="flex justify-between mt-4 border-t border-white/5 pt-2">
           <div className="flex flex-col">
              <span className="text-[6px] font-outfit text-white/40 uppercase">Periodo</span>
              <span className="text-[10px] font-inter text-xs text-white/80">{period}s</span>
           </div>
           <div className="flex flex-col text-center">
              <span className="text-[6px] font-outfit text-white/40 uppercase">Energía</span>
              <span className="text-[10px] font-inter text-xs text-white/80">{energy}kJ</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[6px] font-outfit text-white/40 uppercase">Viento</span>
              <span className="text-[10px] font-inter text-xs text-white/80">{windSpeed.toFixed(0)}km/h</span>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes surf-ride {
          0% { transform: translate(-40px, -5px); }
          100% { transform: translate(40px, 5px); }
        }
      `}</style>
    </WidgetWrapper>
  );
}
