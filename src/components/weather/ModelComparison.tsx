'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDWDData } from '@/services/dwdService';
import { WeatherData } from '@/services/weatherService';
import { GitCompare, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ModelComparisonProps {
  lat: number;
  lon: number;
  ecmwfData: WeatherData;
}

export default function ModelComparison({ lat, lon, ecmwfData }: ModelComparisonProps) {
  const { data: iconData, isLoading } = useQuery({
    queryKey: ['model-comparison', lat, lon],
    queryFn: () => fetchDWDData(lat, lon, 'icon_eu'),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) return (
    <div className="p-6 rounded-3xl border border-white/5 bg-white/5 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-4" />
      <div className="h-20 w-full bg-white/5 rounded" />
    </div>
  );

  const ecmwf = ecmwfData.current;
  const icon = iconData?.current;

  const diffTemp = icon ? Math.abs(ecmwf.temp - icon.temperature_2m) : 0;
  const isHighConfidence = diffTemp < 1.5;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#050a1a]/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-meteorix-blue/10 text-meteorix-blue">
            <GitCompare size={18} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/90 font-orbitron">Comparador de Modelos</h3>
        </div>
        {isHighConfidence ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-meteorix-green/10 border border-meteorix-green/20 text-[10px] text-meteorix-green font-bold uppercase">
            <CheckCircle2 size={12} /> Alta Consistencia
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-meteorix-orange/10 border border-meteorix-orange/20 text-[10px] text-meteorix-orange font-bold uppercase">
            <AlertCircle size={12} /> Divergencia Detectada
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ECMWF Table */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-meteorix-blue uppercase tracking-tighter">ECMWF IFS 0.1°</span>
            <span className="text-[8px] text-white/30 uppercase">Global Leader</span>
          </div>
          <Row label="Temperatura" value={`${ecmwf.temp.toFixed(1)}°C`} />
          <Row label="Viento" value={`${ecmwf.windSpeed.toFixed(1)} km/h`} />
          <Row label="Precipitación" value={`${ecmwf.precip.toFixed(1)} mm`} />
        </div>

        {/* ICON Table */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-meteorix-orange uppercase tracking-tighter">DWD ICON-EU</span>
            <span className="text-[8px] text-white/30 uppercase">European Precision</span>
          </div>
          <Row label="Temperatura" value={`${icon?.temperature_2m.toFixed(1)}°C`} />
          <Row label="Viento" value={`${icon?.wind_speed_10m.toFixed(1)} km/h`} />
          <Row label="Precipitación" value={`${icon?.precipitation.toFixed(1)} mm`} />
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-meteorix-blue/5 border border-meteorix-blue/10 flex gap-3 items-start">
        <Info size={14} className="text-meteorix-blue mt-0.5" />
        <p className="text-[9px] leading-relaxed text-white/40">
          El análisis comparativo detecta una diferencia térmica de {diffTemp.toFixed(1)}°C. 
          {isHighConfidence 
            ? " Los modelos coinciden en la trayectoria sinóptica, lo que otorga una alta fiabilidad al pronóstico."
            : " Existe divergencia entre los modelos global y regional. Se recomienda precaución en la planificación."}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/5 pb-1 last:border-0 last:pb-0">
      <span className="text-[9px] text-white/40 uppercase font-medium">{label}</span>
      <span className="text-xs font-bold font-orbitron text-white/80">{value}</span>
    </div>
  );
}
