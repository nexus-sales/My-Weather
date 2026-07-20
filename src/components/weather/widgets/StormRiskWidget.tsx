'use client';

import { Zap, ShieldAlert } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';
import { useTranslations } from 'next-intl';

interface StormRiskWidgetProps {
  risk: number;
  cape: number;
  liftedIndex: number;
  rifts: string;
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

export default function StormRiskWidget({ risk, cape, liftedIndex, rifts, dataQuality, source }: StormRiskWidgetProps) {
  const t = useTranslations('Widgets');
  // Color based on risk level
  const color = risk > 70 ? '#ff3e3e' : risk > 40 ? '#fbbf24' : '#00ff88';
  const isHighRisk = risk > 60;

  return (
    <WidgetWrapper title={t('storm.title')} icon={<Zap size={14} style={{ color }} className={isHighRisk ? 'animate-bounce' : ''} />} dataQuality={dataQuality} source={source}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-outfit font-black text-white leading-none">
              {risk}<span className="text-[10px] text-white/65 ml-1">%</span>
            </span>
            <span className="text-[7px] font-inter text-xs text-white/60 uppercase tracking-widest mt-1">{t('storm.dischargeProb')}</span>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <span className={`text-[9px] font-inter text-xs font-bold uppercase tracking-tighter px-2 py-0.5 rounded border ${isHighRisk ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
              {rifts}
            </span>
          </div>
        </div>

        {/* Technical Data HUD */}
        <div className="mt-4 grid grid-cols-2 gap-2">
           <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[6px] font-outfit text-white/60 uppercase block mb-1">{t('storm.cape')}</span>
              <span className="text-[10px] font-inter text-xs text-white/90">{cape} <span className="text-[6px] text-white/50">J/kg</span></span>
           </div>
           <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[6px] font-outfit text-white/60 uppercase block mb-1">{t('storm.lifted')}</span>
              <span className="text-[10px] font-inter text-xs text-white/90">{liftedIndex}</span>
           </div>
        </div>

        {/* Warning strip if needed */}
        {isHighRisk && (
          <div className="mt-2 flex items-center gap-2 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 animate-pulse">
             <ShieldAlert size={10} className="text-red-400" />
             <span className="text-[6px] font-inter text-xs text-red-400 uppercase tracking-widest">{t('storm.extreme')}</span>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
