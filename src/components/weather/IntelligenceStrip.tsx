'use client';

import { AlertTriangle, RadioTower, Waves, Wind, ShieldCheck } from 'lucide-react';
import { useWeatherIntelligence } from '@/hooks/useIntelligence';

const riskLabels: Record<string, string> = {
  none: 'Sin riesgo',
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
  extreme: 'Extremo',
};

const riskColor: Record<string, string> = {
  none: 'text-meteorix-green',
  low: 'text-meteorix-green',
  moderate: 'text-yellow-300',
  high: 'text-meteorix-orange',
  extreme: 'text-red-400',
};

function firstNumber(values?: number[]) {
  const value = values?.find((item) => typeof item === 'number' && Number.isFinite(item));
  return typeof value === 'number' ? value : null;
}

function aqLabel(aqi: number | null) {
  if (aqi === null) return 'Sin datos';
  if (aqi <= 20) return 'Muy buena';
  if (aqi <= 40) return 'Buena';
  if (aqi <= 60) return 'Moderada';
  if (aqi <= 80) return 'Mala';
  return 'Muy mala';
}

export default function IntelligenceStrip() {
  const { alerts, lightning, airQuality, marine } = useWeatherIntelligence();

  const alertCount = alerts.data?.length ?? 0;
  const stormRisk = lightning.data?.convective?.current?.risk ?? 'none';
  const cape = lightning.data?.convective?.current?.cape ?? null;
  const aqi = firstNumber(airQuality.data?.hourly?.european_aqi);
  const pm10 = firstNumber(airQuality.data?.hourly?.pm10);
  const waveHeight = firstNumber(marine.data?.hourly?.wave_height);
  const seaTemp = firstNumber(marine.data?.hourly?.sea_surface_temperature);

  const items = [
    {
      icon: AlertTriangle,
      label: 'Avisos oficiales',
      value: alerts.isLoading ? 'Sync' : alertCount > 0 ? `${alertCount} activos` : 'Sin avisos',
      detail: alertCount > 0 ? alerts.data?.[0]?.event || alerts.data?.[0]?.title : 'Meteoalarm / AEMET listo',
      tone: alertCount > 0 ? 'text-meteorix-orange' : 'text-meteorix-green',
    },
    {
      icon: RadioTower,
      label: 'Tormentas',
      value: lightning.isLoading ? 'Sync' : riskLabels[stormRisk],
      detail: cape !== null ? `CAPE ${Math.round(cape)} J/kg` : 'Indices convectivos',
      tone: riskColor[stormRisk],
    },
    {
      icon: Wind,
      label: 'Aire / calima',
      value: airQuality.isLoading ? 'Sync' : aqLabel(aqi),
      detail: pm10 !== null ? `PM10 ${Math.round(pm10)} ug/m3` : 'AQI europeo',
      tone: aqi !== null && aqi > 60 ? 'text-meteorix-orange' : 'text-meteorix-green',
    },
    {
      icon: Waves,
      label: 'Mar / costa',
      value: marine.isLoading ? 'Sync' : waveHeight !== null ? `${waveHeight.toFixed(1)} m` : 'Sin costa',
      detail: seaTemp !== null ? `Mar ${seaTemp.toFixed(1)} C` : 'Open-Meteo Marine',
      tone: waveHeight !== null && waveHeight > 2 ? 'text-meteorix-orange' : 'text-meteorix-blue',
    },
    {
      icon: ShieldCheck,
      label: 'Confianza',
      value: 'Base alta',
      detail: 'ECMWF + fuentes oficiales',
      tone: 'text-meteorix-blue',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-meteorix-card border border-meteorix-border rounded-2xl p-4 backdrop-blur-xl min-h-[118px]"
        >
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="text-[8px] tracking-[0.26em] text-white/35 font-bold uppercase">
              {item.label}
            </div>
            <item.icon className={`w-4 h-4 ${item.tone}`} />
          </div>
          <div className={`font-orbitron text-lg font-black ${item.tone}`}>
            {item.value}
          </div>
          <div className="mt-2 text-[10px] leading-relaxed text-white/35 font-bold uppercase tracking-widest line-clamp-2">
            {item.detail}
          </div>
        </div>
      ))}
    </section>
  );
}
