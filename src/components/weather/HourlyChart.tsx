'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';

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
  temperatureLabel: string;
  rainLabel: string;
}

function CustomTooltip({ active, payload, label, temperatureLabel, rainLabel }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const temp = payload.find((p) => p.dataKey === 'temp');
  const precip = payload.find((p) => p.dataKey === 'precip');

  return (
    <div className="bg-meteorix-card border border-meteorix-border rounded-xl px-4 py-3 text-[10px] font-orbitron font-bold tracking-wider space-y-1.5">
      <div className="text-white/40 uppercase mb-2">{label}</div>
      {temp && (
        <div className="flex items-center gap-2 text-[#2DD4BF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] inline-block" />
          {temperatureLabel}: {temp.value}C
        </div>
      )}
      {precip && (
        <div className="flex items-center gap-2 text-[#6B8CAE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6B8CAE] inline-block" />
          {rainLabel}: {precip.value}%
        </div>
      )}
    </div>
  );
}

export default function HourlyChart({ data }: HourlyChartProps) {
  const t = useTranslations('Dashboard');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const chartData = data.time?.slice(0, 24).map((time, i) => {
    const h = new Date(time).getHours();
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      temp: data.temp ? Math.round(data.temp[i]) : 0,
      precip: data.precipProb ? (data.precipProb[i] ?? 0) : 0,
    };
  }) || [];

  const temps = chartData.map((d) => d.temp);
  const tempMin = Math.min(...temps) - 2;
  const tempMax = Math.max(...temps) + 2;

  if (!isMounted) {
    return (
      <div className="w-full h-[320px] bg-meteorix-card border border-meteorix-border rounded-3xl p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-meteorix-blue/10 border-t-meteorix-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full meteorix-card rounded-3xl p-6 animate-fadein flex flex-col h-[400px]" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-4 h-4 text-meteorix-blue/80" />
        <h3 className="text-[10px] tracking-[0.4em] text-white/60 font-bold uppercase">
          {t('thermalEvolution')}
        </h3>
      </div>

      <div className="h-auto min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%" aspect={2.5}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B8CAE" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B8CAE" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(232,244,240,0.10)" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}
              interval={3}
            />
            <YAxis
              yAxisId="temp"
              orientation="left"
              domain={[tempMin, tempMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(45,212,191,0.7)', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(v) => `${v}°`}
              width={36}
            />
            <YAxis
              yAxisId="precip"
              orientation="right"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(107,140,174,0.7)', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />

            <Tooltip content={<CustomTooltip temperatureLabel={t('temperature')} rainLabel={t('rain')} />} cursor={{ stroke: 'rgba(45,212,191,0.25)', strokeWidth: 1 }} />
            <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#2DD4BF" strokeWidth={3} fill="url(#gradTemp)" animationDuration={1500} />
            <Area yAxisId="precip" type="monotone" dataKey="precip" stroke="#6B8CAE" strokeWidth={2} strokeDasharray="5 4" fill="url(#gradPrecip)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
          <span className="text-[9px] tracking-widest text-white/60 font-bold uppercase">{t('temperature')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-[#6B8CAE] opacity-80" />
          <span className="text-[9px] tracking-widest text-white/60 font-bold uppercase">{t('rainProbability')}</span>
        </div>
      </div>
    </div>
  );
}
