'use client';

import { Thermometer, Shirt, Activity } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';
import { useTranslations } from 'next-intl';

interface ThermalComfortWidgetProps {
  temp: number;
  feelsLike: number;
}

export default function ThermalComfortWidget({ temp, feelsLike }: ThermalComfortWidgetProps) {
  // feelsLike comes straight from weather.current.feelsLike (Open-Meteo's
  // apparent_temperature). This used to recompute the same Bureau of
  // Meteorology AT formula independently client-side — same formula, two
  // implementations, no reason for them to ever disagree.
  const finalFeel = Math.round(feelsLike * 10) / 10;

  // Sensation category and styling
  const t = useTranslations('Widgets');

  let sensation = t('thermal.neutral');
  let advice = t('thermal.adviceUsual');
  let color = '#38bdf8'; // sky-400
  let dangerLevel = t('thermal.stressLow');
  let percentage = 50; // slider position

  if (feelsLike >= 40) {
    sensation = t('thermal.extremeHeat');
    advice = t('thermal.adviceHydrate');
    color = '#ef4444'; // red-500
    dangerLevel = t('thermal.stressExtreme');
    percentage = 95;
  } else if (feelsLike >= 35) {
    sensation = t('thermal.veryHighHeat');
    advice = t('thermal.adviceShade');
    color = '#f97316'; // orange-500
    dangerLevel = t('thermal.stressVeryHigh');
    percentage = 85;
  } else if (feelsLike >= 30) {
    sensation = t('thermal.moderateHeat');
    advice = t('thermal.adviceLight');
    color = '#fbbf24'; // amber-400
    dangerLevel = t('thermal.stressModerate');
    percentage = 70;
  } else if (feelsLike >= 18 && feelsLike < 30) {
    sensation = t('thermal.comfortable');
    advice = t('thermal.adviceIdeal');
    color = '#34d399'; // emerald-400
    dangerLevel = t('thermal.stressNone');
    percentage = 50;
  } else if (feelsLike >= 10 && feelsLike < 18) {
    sensation = t('thermal.cool');
    advice = t('thermal.adviceJacket');
    color = '#60a5fa'; // blue-400
    dangerLevel = t('thermal.stressNone');
    percentage = 35;
  } else if (feelsLike >= 0 && feelsLike < 10) {
    sensation = t('thermal.cold');
    advice = t('thermal.adviceHeavyCoat');
    color = '#818cf8'; // indigo-400
    dangerLevel = t('thermal.stressLow');
    percentage = 20;
  } else if (feelsLike < 0) {
    sensation = t('thermal.extremeCold');
    advice = t('thermal.adviceLayers');
    color = '#a5b4fc'; // indigo-300
    dangerLevel = t('thermal.stressHigh');
    percentage = 5;
  }

  return (
    <WidgetWrapper title={t('thermal.title')} icon={<Thermometer size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-white/60 uppercase tracking-widest">{t('thermal.feelsLike')}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-outfit font-bold text-white">{finalFeel}°</span>
                <span className="text-xs text-white/60">real {Math.round(temp)}°</span>
              </div>
           </div>
           <span className="text-[8px] font-inter px-2 py-1 rounded bg-zinc-800/80 text-white/80 uppercase font-semibold border border-white/5">
             {sensation}
           </span>
        </div>

        {/* Comfort Bar */}
        <div className="flex flex-col gap-2 my-4">
           <div className="flex items-center justify-between">
             <span className="text-[10px] font-inter text-white/80">{t('thermal.bioIndex')}</span>
             <span className="text-[10px] font-outfit font-semibold" style={{ color }}>Riesgo {dangerLevel}</span>
           </div>
           
           <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
             <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-500/20" />
             <div 
               className="h-full rounded-full transition-all duration-1000 ease-out" 
               style={{ width: `${percentage}%`, backgroundColor: color }} 
             />
           </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-auto">
          <div className="flex items-center gap-1.5 text-white/60">
             <Shirt size={12} className="text-white/60" />
             <span className="text-[10px] font-inter text-white/80">{advice}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-inter">
             <Activity size={10} />
             <span>{t('thermal.source')}</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
