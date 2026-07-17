'use client';

import { useEffect, useState } from 'react';
import { Moon, CloudSun } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface SunWidgetProps {
  sunrise: string;
  sunset: string;
  currentTime: string;
  title: string;
}

export default function SunWidget({ sunrise, sunset, currentTime, title }: SunWidgetProps) {
  const dSunrise = new Date(sunrise);
  const dSunset = new Date(sunset);
  // currentTime comes from the weather API's `current.time`, which is
  // rounded to the top of the hour (e.g. "13:00") and only refreshes with
  // the data poll (every 10 min) — fine for the sun-position math below,
  // but displaying it as "RELOJ LOCAL" with seconds looked like a live
  // clock that was actually frozen. This ticks independently for display.
  const [liveNow, setLiveNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dNow = new Date(currentTime);

  const start = dSunrise.getTime();
  const end = dSunset.getTime();
  const now = dNow.getTime();

  const totalDaylight = end - start;
  const currentProgress = Math.max(0, Math.min(1, (now - start) / totalDaylight));
  
  const angleRad = Math.PI - (currentProgress * Math.PI);
  const centerX = 50;
  const centerY = 85;
  const radius = 42;
  
  const sunX = centerX + radius * Math.cos(angleRad);
  const sunY = centerY - radius * Math.sin(angleRad);

  const isNight = now < start || now > end;

  return (
    <WidgetWrapper title={title} icon={isNight ? <Moon size={14} /> : <CloudSun size={14} className="text-orange-400 animate-pulse" />}>
      <div className="relative w-full h-full flex flex-col items-center">
        {/* Sky Telemetry Arc */}
        <div className="relative w-full h-28 mt-1">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              {/* Day Sky Gradient */}
              <linearGradient id="sky-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0)" />
                <stop offset="100%" stopColor="rgba(96, 165, 250, 0.05)" />
              </linearGradient>
              {/* Sun Glow */}
              <radialGradient id="sun-glow-pro">
                <stop offset="0%" stopColor="#ff8c35" />
                <stop offset="40%" stopColor="rgba(255, 140, 53, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Sky Background Arc */}
            <path
              d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`}
              fill="url(#sky-gradient)"
              stroke="white"
              strokeWidth="0.2"
              strokeOpacity="0.1"
            />

            {/* Horizon */}
            <line x1="5" y1={centerY} x2="95" y2={centerY} stroke="white" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="1 1" />

            {/* Path Arc with Ticks */}
            {[...Array(13)].map((_, i) => {
              const a = (Math.PI / 12) * i;
              const x1 = centerX + radius * Math.cos(Math.PI - a);
              const y1 = centerY - radius * Math.sin(Math.PI - a);
              const x2 = centerX + (radius + 2) * Math.cos(Math.PI - a);
              const y2 = centerY - (radius + 2) * Math.sin(Math.PI - a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />;
            })}

            {/* Active Trajectory */}
            {!isNight && (
              <path
                d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`}
                fill="none"
                stroke="url(#sun-arc-pro)"
                strokeWidth="1.5"
                strokeDasharray="132"
                strokeDashoffset={132 * (1 - currentProgress)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            )}

            {/* The Sun / Moon Indicator */}
            {!isNight ? (
              <g transform={`translate(${sunX}, ${sunY})`} className="transition-all duration-1000">
                <circle r="8" fill="url(#sun-glow-pro)" className="animate-pulse" />
                <circle r="3.5" fill="#ff8c35" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
              </g>
            ) : (
              <circle cx="50" cy={centerY + 10} r="2" fill="#60a5fa" opacity="0.2" />
            )}

            <defs>
              <linearGradient id="sun-arc-pro" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff8c35" stopOpacity="0.2" />
                <stop offset={currentProgress * 100 + "%"} stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#ff8c35" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Precision Labels */}
          <div className="absolute top-[88%] left-[10%] -translate-x-1/2 flex flex-col items-center">
            <span className="text-[6px] text-white/20 uppercase">Amanecer</span>
            <span className="text-[9px] font-inter text-xs text-white/40">{dSunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="absolute top-[88%] right-[10%] translate-x-1/2 flex flex-col items-center">
            <span className="text-[6px] text-white/20 uppercase">Ocaso</span>
            <span className="text-[9px] font-inter text-xs text-white/40">{dSunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="mt-3 w-full flex items-center justify-between px-4">
           <div className="flex flex-col">
             <span className="text-[10px] font-outfit text-white/80 leading-none">
               {isNight ? 'NOCHE' : `${Math.round(currentProgress * 100)}% DIA`}
             </span>
             <span className="text-[6px] text-white/20 uppercase tracking-widest mt-1">Status Solar</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-inter text-xs text-orange-400">
               {liveNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
             <span className="text-[6px] text-white/20 uppercase tracking-widest mt-1">Reloj Local</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
