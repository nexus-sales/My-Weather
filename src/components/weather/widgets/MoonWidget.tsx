'use client';

import { Moon as MoonIcon } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';
import { LunarData } from '@/services/astroService';
import { useTranslations } from 'next-intl';

interface MoonWidgetProps {
  data: LunarData;
  title: string;
}

export default function MoonWidget({ data, title }: MoonWidgetProps) {
  const t = useTranslations('Intelligence');
  
  // Phase logic for SVG mask (0 = New Moon, 0.5 = Full Moon, 1 = New Moon)
  const p = data.phase; // 0 to 1
  
  // We'll use a mask to draw the moon. 
  // A white circle for the moon, and a black shape for the shadow.
  
  return (
    <WidgetWrapper title={title} icon={<MoonIcon size={14} className="text-meteorix-highlight" />}>
      <div className="relative flex items-center justify-between w-full px-4 gap-6">
        {/* Realistic Moon Visualization */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <defs>
              <mask id="moon-mask">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                {/* The Shadow */}
                {p <= 0.5 ? (
                  // Waxing: Shadow moves from right to left
                  <path 
                    d={`M 50 0 A 50 50 0 1 0 50 100 A ${Math.abs(50 - p * 200)} 50 0 1 ${p < 0.25 ? 1 : 0} 50 0`} 
                    fill="black" 
                  />
                ) : (
                  // Waning: Shadow grows from right to left
                  <path 
                    d={`M 50 0 A 50 50 0 1 1 50 100 A ${Math.abs(50 - (p - 0.5) * 200)} 50 0 1 ${p < 0.75 ? 0 : 1} 50 0`} 
                    fill="black" 
                  />
                )}
              </mask>
              
              <radialGradient id="moon-surface" cx="50%" cy="50%" r="50%">
                <stop offset="80%" stopColor="#e0e8ff" />
                <stop offset="100%" stopColor="#b0c4de" />
              </radialGradient>
            </defs>

            {/* Background (Dark Moon) */}
            <circle cx="50" cy="50" r="48" fill="#050a1a" />
            
            {/* Illuminated Moon with Surface Detail */}
            <g mask="url(#moon-mask)">
              <circle cx="50" cy="50" r="48" fill="url(#moon-surface)" />
              {/* Craters texture */}
              <circle cx="30" cy="40" r="6" fill="black" opacity="0.05" />
              <circle cx="60" cy="30" r="8" fill="black" opacity="0.03" />
              <circle cx="50" cy="70" r="10" fill="black" opacity="0.04" />
              <circle cx="20" cy="65" r="4" fill="black" opacity="0.06" />
            </g>
            
            {/* Atmosphere Glow */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
          </svg>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col items-end flex-1">
          <div className="px-2 py-1 bg-meteorix-highlight/10 border border-meteorix-highlight/20 rounded mb-2">
            <span className="text-[11px] font-outfit text-meteorix-highlight uppercase tracking-widest">
              {t(`lunarPhases.${data.phaseKey}`)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-outfit font-bold text-white tracking-tighter">
                {Math.round(data.illumination * 100)}
              </span>
              <span className="text-sm text-white/60">%</span>
            </div>
            <span className="text-[8px] font-outfit text-white/45 uppercase tracking-[0.3em]">
              Iluminación Actual
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-white/50 uppercase">Edad</span>
              <span className="text-[10px] font-inter text-xs text-white/60">{data.ageDays.toFixed(1)}d</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-white/50 uppercase">Fase</span>
              <span className="text-[10px] font-inter text-xs text-white/60">{(data.phase * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
