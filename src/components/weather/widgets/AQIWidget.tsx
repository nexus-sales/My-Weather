'use client';

import { Activity, Wind } from 'lucide-react';
import { useTranslations } from 'next-intl';
import WidgetWrapper from './WidgetWrapper';

interface AQIWidgetProps {
  // WidgetGrid always passes intelligence.air.aqi, which has its own
  // fallback estimate — this default never actually triggers in practice,
  // it's only here as a safety net if the prop is ever omitted.
  aqiValue?: number;
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

export default function AQIWidget({ aqiValue = 42, dataQuality, source }: AQIWidgetProps) {
  const t = useTranslations('Widgets');

  let status = t('aqi.good');
  let color = '#00ff88';
  let message = t('aqi.messageGood');

  if (aqiValue > 50) {
    status = t('aqi.moderate');
    color = '#ffcc00';
    message = t('aqi.hazeLight');
  }
  if (aqiValue > 100) {
    status = t('aqi.bad');
    color = '#ff8c35';
    message = t('aqi.hazeDense');
  }
  if (aqiValue > 150) {
    status = t('aqi.toxic');
    color = '#ff3e3e';
    message = t('aqi.severe');
  }

  return (
    <WidgetWrapper title={t('aqi.title')} icon={<Wind size={14} style={{ color }} />} dataQuality={dataQuality} source={source}>
      <div className="relative w-full h-full flex flex-col p-2 overflow-hidden">
        
        {/* Animated Dust Particles (CSS) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           {[...Array(10)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-1 h-1 rounded-full bg-orange-200/50 blur-[1px]"
               style={{
                 left: `${((i * 17) % 10) * 10}%`,
                 top: `${((i * 13) % 10) * 10}%`,
                 animation: `float ${3 + ((i * 7) % 5)}s linear infinite`,
                 animationDelay: `-${((i * 3) % 6)}s`
               }}
             />
           ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-4xl font-outfit font-black text-white drop-shadow-md">
                {aqiValue}
              </span>
              <span className="text-[10px] font-outfit tracking-widest uppercase mt-[-4px]" style={{ color }}>
                {status}
              </span>
           </div>
           
           <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
              <Activity size={20} style={{ color }} className={aqiValue > 100 ? 'animate-bounce' : ''} />
           </div>
        </div>

        <div className="mt-auto relative z-10">
           <span className="text-[7px] font-inter text-xs text-white/65 uppercase tracking-widest">{message}</span>
           
           {/* Color Scale Bar */}
           <div className="h-1.5 w-full bg-gradient-to-r from-[#00ff88] via-[#ffcc00] to-[#ff3e3e] mt-2 rounded-full overflow-hidden relative">
              {/* Indicator Arrow */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-sm" 
                style={{ left: `${Math.min((aqiValue / 200) * 100, 95)}%` }}
              />
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(20px, -20px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </WidgetWrapper>
  );
}
