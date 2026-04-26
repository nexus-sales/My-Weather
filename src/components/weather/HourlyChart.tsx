'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WeatherData } from '@/services/weatherService';
import { Activity } from 'lucide-react';

interface HourlyChartProps {
  data: WeatherData['hourly'];
}

interface TooltipEntry {
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const temp = payload.find((p: TooltipEntry) => p.dataKey === 'temp');
  const precip = payload.find((p: TooltipEntry) => p.dataKey === 'precip');

  return (
    <div className="bg-[#040d22] border border-[rgba(0,212,255,0.2)] rounded-xl px-4 py-3 text-[10px] font-orbitron font-bold tracking-wider space-y-1.5">
      <div className="text-white/40 uppercase mb-2">{label}</div>
      {temp && (
        <div className="flex items-center gap-2 text-[#00d4ff]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block" />
          TEMP: {temp.value}°C
        </div>
      )}
      {precip && (
        <div className="flex items-center gap-2 text-[#4d7fff]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4d7fff] inline-block" />
          LLUVIA: {precip.value}%
        </div>
      )}
    </div>
  );
}

export default function HourlyChart({ data }: HourlyChartProps) {
  const chartData = data.time.slice(0, 24).map((time, i) => {
    const h = new Date(time).getHours();
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      temp: Math.round(data.temp[i]),
      precip: data.precipProb[i] ?? 0,
    };
  });

  const temps = chartData.map((d) => d.temp);
  const tempMin = Math.min(...temps) - 2;
  const tempMax = Math.max(...temps) + 2;

  return (
    <div className="w-full h-full bg-meteorix-card border border-meteorix-border rounded-3xl p-6 backdrop-blur-xl animate-fadein" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-4 h-4 text-meteorix-blue/60" />
        <h3 className="text-[10px] tracking-[0.4em] text-meteorix-blue/80 font-bold uppercase">
          Evolución Térmica (24H)
        </h3>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4d7fff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4d7fff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,150,255,0.05)"
            />

            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
              interval={3}
            />

            {/* Left axis — temperature */}
            <YAxis
              yAxisId="temp"
              orientation="left"
              domain={[tempMin, tempMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(0,212,255,0.5)', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(v) => `${v}°`}
              width={36}
            />

            {/* Right axis — precipitation probability */}
            <YAxis
              yAxisId="precip"
              orientation="right"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(77,127,255,0.5)', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,212,255,0.15)', strokeWidth: 1 }} />

            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#00d4ff"
              strokeWidth={2.5}
              fill="url(#gradTemp)"
              animationDuration={1500}
            />

            <Area
              yAxisId="precip"
              type="monotone"
              dataKey="precip"
              stroke="#4d7fff"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="url(#gradPrecip)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#00d4ff]" />
          <span className="text-[9px] tracking-widest text-white/40 font-bold uppercase">Temperatura</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-[#4d7fff] opacity-70" />
          <span className="text-[9px] tracking-widest text-white/40 font-bold uppercase">Prob. Lluvia</span>
        </div>
      </div>
    </div>
  );
}
