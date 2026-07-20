'use client';

import { Sparkles, Eye, Compass } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';
import { useTranslations } from 'next-intl';

interface StargazingWidgetProps {
  cloudCover: number;
  moonPhase: number; // 0 to 1 representing cycle or illumination
  moonPhaseName: string;
  rain: number;
}

export default function StargazingWidget({ cloudCover, moonPhase, moonPhaseName, rain }: StargazingWidgetProps) {
  // Stargazing rating calculation
  // Rain is absolute showstopper: 0% rating
  // Cloud cover is major blocker: 0% clouds = best, 100% = worst
  // Moon phase: Full moon washes out faint stars (illumination near 1 is worst, near 0 is best)
  let score = 100;
  
  if (rain > 0.1) {
    score = 0;
  } else {
    // subtract points for clouds
    score -= cloudCover * 0.8;
    // subtract points for moon light interference (up to 20 points)
    // Assume if moonPhase is near 0.5 (Full Moon in some systems) or 1.0 (Full Moon in others), illumination is high
    const moonIlluminationFactor = Math.sin(moonPhase * Math.PI); // rough proxy
    score -= moonIlluminationFactor * 20;
  }
  
  score = Math.max(0, Math.round(score));

  const t = useTranslations('Widgets');

  let quality = t('stargazing.excellent');
  let color = '#c084fc'; // purple-400
  
  if (score === 0) {
    quality = t('stargazing.nullRain');
    color = '#f87171'; // red-400
  } else if (score < 30) {
    quality = t('stargazing.veryPoor');
    color = '#9ca3af'; // gray-400
  } else if (score < 60) {
    quality = t('stargazing.acceptable');
    color = '#60a5fa'; // blue-400
  } else if (score < 85) {
    quality = t('stargazing.good');
    color = '#34d399'; // emerald-400
  }

  // Determine atmospheric visibility / transparency
  let transparency = t('stargazing.high');
  if (cloudCover > 60) transparency = t('stargazing.poor');
  else if (cloudCover > 30) transparency = t('stargazing.medium');

  // Visible planetary highlights heuristic
  const highlights = score > 40 
    ? t('stargazing.jupiter')
    : t('stargazing.brightOnly');

  return (
    <WidgetWrapper title={t('stargazing.title')} icon={<Sparkles size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-white/60 uppercase tracking-widest">{t('stargazing.skyQuality')}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-outfit font-bold text-white">{score}</span>
                <span className="text-sm text-white/50 font-medium">%</span>
              </div>
           </div>
           <span className="text-[8px] font-inter px-2 py-1 rounded bg-zinc-800/80 text-white/80 uppercase font-semibold border border-white/5" style={{ color }}>
             {quality}
           </span>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-2.5 my-3.5">
           <div className="flex items-center justify-between text-[10px]">
             <span className="text-white/60 font-inter">{t('stargazing.transparency')}</span>
             <span className="font-outfit text-white/90 font-medium">{transparency}</span>
           </div>
           
           <div className="flex items-center justify-between text-[10px]">
             <span className="text-white/60 font-inter">{t('stargazing.moonPhase')}</span>
             <span className="font-outfit text-white/90 font-medium truncate max-w-[120px]" title={moonPhaseName}>
               {moonPhaseName || t('stargazing.new')}
             </span>
           </div>

           <div className="flex items-center justify-between text-[10px]">
             <span className="text-white/60 font-inter font-light">{t('stargazing.cloudiness')}</span>
             <span className="font-outfit text-white/90 font-medium">{Math.round(cloudCover)}%</span>
           </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-auto">
          <div className="flex items-center gap-1.5 text-white/60">
             <Eye size={12} className="text-white/60" />
             <span className="text-[9px] font-inter text-white/80 truncate font-semibold">{highlights}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-[8px] font-inter">
             <Compass size={10} />
             <span>{t('stargazing.window')}</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
