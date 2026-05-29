'use client';

import { Thermometer, Shirt, Activity } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface ThermalComfortWidgetProps {
  temp: number;
  humidity: number;
  windSpeed: number;
}

export default function ThermalComfortWidget({ temp, humidity, windSpeed }: ThermalComfortWidgetProps) {
  // Compute Heat Index / Wind Chill or simple Feel-like Sensation
  // Simple Apparent Temperature (Feel Like) formula approximation
  // AT = T + 0.33 * e - 0.70 * ws - 4.0
  // where e = water vapor pressure (hPa) = (rh / 100) * 6.105 * exp(17.27 * T / (237.7 + T))
  const rh = humidity;
  const ws = windSpeed / 3.6; // convert km/h to m/s
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
  const feelLike = temp + 0.33 * e - 0.7 * ws - 4.0;
  
  const finalFeel = Math.round(feelLike * 10) / 10;

  // Sensation category and styling
  let sensation = 'Neutral';
  let advice = 'Ropa habitual';
  let color = '#38bdf8'; // sky-400
  let dangerLevel = 'Bajo';
  let percentage = 50; // slider position

  if (feelLike >= 40) {
    sensation = 'Calor Extremo';
    advice = 'Peligro de golpe de calor. Hidrátate.';
    color = '#ef4444'; // red-500
    dangerLevel = 'Extremo';
    percentage = 95;
  } else if (feelLike >= 35) {
    sensation = 'Calor Muy Alto';
    advice = 'Evita esfuerzo. Busca sombra y agua.';
    color = '#f97316'; // orange-500
    dangerLevel = 'Muy Alto';
    percentage = 85;
  } else if (feelLike >= 30) {
    sensation = 'Calor Moderado';
    advice = 'Ropa ligera, ventilación y agua.';
    color = '#fbbf24'; // amber-400
    dangerLevel = 'Moderado';
    percentage = 70;
  } else if (feelLike >= 18 && feelLike < 30) {
    sensation = 'Confortable';
    advice = 'Condiciones ideales. Ropa casual.';
    color = '#34d399'; // emerald-400
    dangerLevel = 'Ninguno';
    percentage = 50;
  } else if (feelLike >= 10 && feelLike < 18) {
    sensation = 'Fresco';
    advice = 'Prenda de abrigo fina o chaqueta.';
    color = '#60a5fa'; // blue-400
    dangerLevel = 'Ninguno';
    percentage = 35;
  } else if (feelLike >= 0 && feelLike < 10) {
    sensation = 'Frío';
    advice = 'Abrigo grueso, protege cuello/manos.';
    color = '#818cf8'; // indigo-400
    dangerLevel = 'Bajo';
    percentage = 20;
  } else if (feelLike < 0) {
    sensation = 'Frío Extremo';
    advice = 'Riesgo de hipotermia. Varias capas.';
    color = '#a5b4fc'; // indigo-300
    dangerLevel = 'Alto';
    percentage = 5;
  }

  return (
    <WidgetWrapper title="Confort Térmico" icon={<Thermometer size={14} style={{ color }} />}>
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-[10px] font-outfit text-zinc-400 uppercase tracking-widest">SENSACIÓN TÉRMICA</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-outfit font-bold text-white">{finalFeel}°</span>
                <span className="text-xs text-zinc-400">real {Math.round(temp)}°</span>
              </div>
           </div>
           <span className="text-[8px] font-inter px-2 py-1 rounded bg-zinc-800/80 text-zinc-300 uppercase font-semibold border border-white/5">
             {sensation}
           </span>
        </div>

        {/* Comfort Bar */}
        <div className="flex flex-col gap-2 my-4">
           <div className="flex items-center justify-between">
             <span className="text-[10px] font-inter text-zinc-300">Índice Bioclimático</span>
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
          <div className="flex items-center gap-1.5 text-zinc-400">
             <Shirt size={12} className="text-zinc-400" />
             <span className="text-[10px] font-inter text-zinc-300">{advice}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-inter">
             <Activity size={10} />
             <span>Calculado con Temp, Humedad y Viento</span>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
