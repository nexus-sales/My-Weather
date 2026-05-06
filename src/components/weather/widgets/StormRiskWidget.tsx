'use client';

import { Zap, Activity, ShieldAlert } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface StormRiskWidgetProps {
  risk: number;
  cape: number;
  liftedIndex: number;
  rifts: string;
}

export default function StormRiskWidget({ risk, cape, liftedIndex, rifts }: StormRiskWidgetProps) {
  // Color based on risk level
  const color = risk > 70 ? '#ff3e3e' : risk > 40 ? '#fbbf24' : '#00ff88';
  const isHighRisk = risk > 60;

  return (
    <WidgetWrapper title="Riesgo de Tormenta / Convección" icon={<Zap size={14} style={{ color }} className={isHighRisk ? 'animate-bounce' : ''} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-orbitron font-black text-white leading-none">
              {risk}<span className="text-[10px] text-white/50 ml-1">%</span>
            </span>
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest mt-1">Prob. de Descargas</span>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-tighter px-2 py-0.5 rounded border ${isHighRisk ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
              {rifts}
            </span>
          </div>
        </div>

        {/* Technical Data HUD */}
        <div className="mt-4 grid grid-cols-2 gap-2">
           <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[6px] font-orbitron text-white/40 uppercase block mb-1">CAPE Index</span>
              <span className="text-[10px] font-mono text-white/90">{cape} <span className="text-[6px] text-white/30">J/kg</span></span>
           </div>
           <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[6px] font-orbitron text-white/40 uppercase block mb-1">Lifted Index</span>
              <span className="text-[10px] font-mono text-white/90">{liftedIndex}</span>
           </div>
        </div>

        {/* Warning strip if needed */}
        {isHighRisk && (
          <div className="mt-2 flex items-center gap-2 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 animate-pulse">
             <ShieldAlert size={10} className="text-red-400" />
             <span className="text-[6px] font-mono text-red-400 uppercase tracking-widest">Inestabilidad Extrema Detectada</span>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
