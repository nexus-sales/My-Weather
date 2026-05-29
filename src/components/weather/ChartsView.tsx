'use client';

import React from 'react';
import { WeatherData } from '@/services/weatherService';
import { useTranslations } from 'next-intl';
import { BarChart3, Cloud, Droplets, Wind } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartsViewProps {
  weather: WeatherData;
}

export default function ChartsView({ weather }: ChartsViewProps) {
  const t = useTranslations('Charts');
  const data = weather.hourly;

  const chartData = data.time?.slice(0, 48).map((time, i) => {
    const d = new Date(time);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: data.temp ? Math.round(data.temp[i]) : 0,
      cloud: data.cloudCover ? data.cloudCover[i] : 0,
      precip: data.precipProb ? data.precipProb[i] : 0,
    };
  }) || [];

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2 pl-2">
        <h2 className="text-2xl font-bold font-outfit tracking-tight text-white flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={22} />
          {t('title')}
        </h2>
        <p className="text-xs text-zinc-400 font-inter">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Gráfico de Temperatura y Nubes */}
        <ChartCard 
          title={t('thermal')} 
          icon={<Cloud size={16} />}
          data={chartData}
          dataKey1="temp"
          dataKey2="cloud"
          color1="#3b82f6"
          color2="#818cf8"
          label1={t('temp')}
          label2={t('cloud')}
          unit1="°C"
          unit2="%"
        />

        {/* Gráfico de Humedad y Lluvia */}
        <ChartCard 
          title={t('hydro')} 
          icon={<Droplets size={16} />}
          data={chartData}
          dataKey1="precip"
          color1="#60a5fa"
          label1={t('precip')}
          unit1="%"
        />
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  dataKey1: string;
  dataKey2?: string;
  color1: string;
  color2?: string;
  label1: string;
  label2?: string;
  unit1: string;
  unit2?: string;
}

function ChartCard({ title, icon, data, dataKey1, dataKey2, color1, color2, label1, label2, unit1, unit2 }: ChartCardProps) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-white/5 text-zinc-300 border border-white/5">
          {icon}
        </div>
        <h3 className="text-[10px] font-outfit font-semibold tracking-widest text-zinc-400 uppercase">{title}</h3>
      </div>
      
      <div className="h-auto min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${dataKey1}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color1} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color1} stopOpacity={0} />
              </linearGradient>
              {dataKey2 && color2 && (
                <linearGradient id={`grad-${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color2} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color2} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-inter)' }} interval={4} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-inter)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(16px)' }}
              itemStyle={{ fontSize: '10px', fontFamily: 'var(--font-inter)', color: '#fafafa' }}
              labelStyle={{ fontSize: '9px', fontFamily: 'var(--font-outfit)', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Area type="monotone" dataKey={dataKey1} stroke={color1} fill={`url(#grad-${dataKey1})`} strokeWidth={2} />
            {dataKey2 && color2 && <Area type="monotone" dataKey={dataKey2} stroke={color2} fill={`url(#grad-${dataKey2})`} strokeWidth={1.5} strokeDasharray="4 4" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
