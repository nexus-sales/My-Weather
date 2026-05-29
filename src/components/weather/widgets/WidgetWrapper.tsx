'use client';

import { ReactNode } from 'react';
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
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

const qualityLabels = {
  observed: 'Real',
  estimated: 'Estimado',
  static: 'Sistema',
};

export default function WidgetWrapper({ children, title, icon, className, dataQuality, source }: WidgetWrapperProps) {
  return (
    <div className={cn(
      "glass-panel p-5 relative group flex flex-col h-full",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{icon}</div>}
          <h3 className="text-xs font-outfit font-medium tracking-wide text-zinc-300 uppercase truncate">
            {title}
          </h3>
        </div>
        {dataQuality && (
          <span
            title={source}
            className={cn(
              "shrink-0 rounded-md border px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest",
              dataQuality === 'observed' && "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
              dataQuality === 'estimated' && "border-amber-400/20 bg-amber-400/10 text-amber-300",
              dataQuality === 'static' && "border-zinc-400/20 bg-zinc-400/10 text-zinc-300"
            )}
          >
            {qualityLabels[dataQuality]}
          </span>
        )}
      </div>
      
      {/* Content Area */}
      <div className="relative flex-1 flex items-center justify-center">
        {children}
      </div>

      {/* Subtle Bottom Highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
