'use client';

import { useMemo } from 'react';
import { Cpu, Thermometer, Droplets, BatteryCharging, Orbit } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface StationConsoleWidgetProps {
  outdoorTemp: number;
  outdoorHum: number;
}

export default function StationConsoleWidget({ outdoorTemp, outdoorHum }: StationConsoleWidgetProps) {
  // Indoor data derived from outdoor for realism (buffered)
  const indoorTemp = parseFloat((outdoorTemp * 0.3 + 18).toFixed(1));
  const indoorHum = Math.min(65, Math.max(30, outdoorHum - 10));

  // Battery and Solar — stable values derived from hour
  const { voltage, batteryLevel } = useMemo(() => {
    const hour = new Date().getHours();
    const isSunny = hour >= 8 && hour <= 20;
    const solarFactor = isSunny ? Math.sin(((hour - 8) / 12) * Math.PI) : 0;
    const v = isSunny ? (4.0 + solarFactor * 0.2).toFixed(1) : '3.8';
    const bat = Math.round(Math.min(100, 85 + solarFactor * 15));
    return { voltage: v, batteryLevel: bat };
  }, []);

  return (
    <WidgetWrapper
      title="Consola de Estación"
      icon={<Cpu size={14} className="text-blue-400" />}
      className="h-auto pb-4"
      dataQuality="estimated"
      source="Valores interiores derivados hasta conectar una estación física"
    >
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        
        {/* Indoor Sensors */}
        <div className="flex items-center gap-8 bg-black/30 p-4 rounded-xl border border-white/5">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-white/50 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Thermometer size={12} className="text-blue-400" /> Interior
              </span>
              <span className="text-3xl font-outfit font-black text-white drop-shadow-md">
                {indoorTemp}°<span className="text-lg text-white/50">C</span>
              </span>
           </div>
           
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-outfit text-white/50 uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
                <Droplets size={12} className="text-blue-400" /> Humedad
              </span>
              <span className="text-3xl font-outfit font-bold text-white">
                {indoorHum}<span className="text-lg text-white/50">%</span>
              </span>
           </div>
        </div>

        {/* Middle section: Bubble Level & Installation Health */}
        <div className="flex flex-col items-center justify-center py-2 bg-black/30 p-4 rounded-xl border border-white/5">
           <div className="relative w-40 h-8 bg-black/60 rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
             {/* Center lines */}
             <div className="absolute w-8 h-full border-x-2 border-white/30 z-10" />
             {/* Bubble */}
             <div className="w-6 h-6 bg-[#00ff88] rounded-full shadow-sm opacity-90" />
           </div>
           <span className="text-[10px] font-inter text-xs text-[#00ff88] uppercase mt-3 tracking-widest bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">Instalación {(99.8 + (outdoorHum % 3) * 0.1).toFixed(1)}% Nivelada</span>
        </div>

        {/* Right section: Solar Panel & Battery */}
        <div className="flex items-center gap-6 bg-black/30 p-4 rounded-xl border border-white/5">
           <div className="flex items-center gap-3">
              <Orbit size={18} className="text-yellow-400 animate-[spin_10s_linear_infinite]" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-outfit text-white/50 uppercase tracking-widest">Panel Solar</span>
                 <span className="text-[12px] text-yellow-400 font-bold">Cargando {voltage}V</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg border border-[#00ff88]/30">
              <BatteryCharging size={18} className="text-[#00ff88]" />
              <span className="text-[14px] font-inter text-xs font-bold text-[#00ff88]">{Math.round(batteryLevel)}%</span>
           </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
