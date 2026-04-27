'use client';

import { ReactNode, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WidgetWrapperProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  className?: string;
}

export default function WidgetWrapper({ children, title, icon, className }: WidgetWrapperProps) {
  // Generate a random-looking module ID for the aesthetic
  const moduleId = useMemo(() => {
    return `MOD-${Math.floor(Math.random() * 9000 + 1000)}-${title.substring(0, 3).toUpperCase()}`;
  }, [title]);

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-2xl border border-white/5 bg-[#040d22]/80 p-4 backdrop-blur-xl transition-all duration-700",
      "hover:border-meteorix-blue/30 hover:shadow-[0_0_40px_rgba(0,212,255,0.08)]",
      "before:absolute before:inset-0 before:bg-grid-meteorix before:opacity-[0.04] before:pointer-events-none",
      className
    )}>
      {/* Dynamic Cyberpunk background elements */}
      <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
        <span className="text-[6px] font-mono text-meteorix-blue tracking-tighter">{moduleId}</span>
      </div>

      {/* Decorative scanline with variable speed */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-meteorix-blue/10 to-transparent h-[1px] w-full -translate-y-full group-hover:animate-[scan_4s_linear_infinite] opacity-30 pointer-events-none" />

      {/* Advanced Corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-meteorix-blue/20 rounded-tl-2xl transition-all group-hover:border-meteorix-blue/60 group-hover:w-8 group-hover:h-8" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-meteorix-blue/20 rounded-br-2xl transition-all group-hover:border-meteorix-blue/60 group-hover:w-8 group-hover:h-8" />

      {/* Header with "Terminal" style */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {icon && <div className="text-meteorix-blue group-hover:scale-125 transition-transform duration-700 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{icon}</div>}
            {/* Pulsing notification dot */}
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-meteorix-green rounded-full animate-pulse shadow-[0_0_5px_rgba(0,255,136,0.8)]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[11px] font-orbitron font-black tracking-[0.3em] text-white/40 uppercase group-hover:text-white/90 transition-all">
              {title}
            </h3>
            <div className="h-[1px] w-0 group-hover:w-full bg-meteorix-blue/40 transition-all duration-700" />
          </div>
        </div>
        <div className="flex gap-0.5">
           {[...Array(3)].map((_, i) => (
             <div key={i} className={`w-1 h-3 bg-meteorix-blue/20 rounded-full transition-all duration-500 group-hover:bg-meteorix-blue/60 animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
           ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="relative h-40 flex items-center justify-center z-10">
        {children}
      </div>

      {/* Footer "Status" Bar */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between relative z-10">
         <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest group-hover:text-meteorix-blue/40 transition-colors">System.Sensor_Active</span>
         <div className="flex items-center gap-1">
            <span className="text-[6px] font-mono text-meteorix-green uppercase opacity-40">Live</span>
            <div className="w-1 h-1 rounded-full bg-meteorix-green animate-ping" />
         </div>
      </div>

      {/* Reactive background glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-meteorix-blue/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-meteorix-blue/15 transition-all duration-1000" />
    </div>
  );
}
