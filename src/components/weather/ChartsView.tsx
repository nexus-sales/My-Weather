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
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-orbitron tracking-widest text-white uppercase flex items-center gap-3">
          <BarChart3 className="text-meteorix-blue" />
          {t('title')}
        </h2>
        <p className="text-xs text-white/40 tracking-wider">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Gráfico de Temperatura y Nubes */}
        <ChartCard 
          title={t('thermal')} 
          icon={<Cloud size={16} />}
          data={chartData}
          dataKey1="temp"
          dataKey2="cloud"
          color1="#00d4ff"
          color2="#6366f1"
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
          color1="#4d7fff"
          label1={t('precip')}
          unit1="%"
        />
      </div>
    </div>
  );
}

function ChartCard({ title, icon, data, dataKey1, dataKey2, color1, color2, label1, label2, unit1, unit2 }: any) {
  return (
    <div className="bg-meteorix-card border border-meteorix-border rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-white/5 text-white/60">
          {icon}
        </div>
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase font-orbitron">{title}</h3>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${dataKey1}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color1} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color1} stopOpacity={0} />
              </linearGradient>
              {dataKey2 && (
                <linearGradient id={`grad-${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color2} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={color2} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} interval={5} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#040d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '10px', fontFamily: 'Orbitron' }}
            />
            <Area type="monotone" dataKey={dataKey1} stroke={color1} fill={`url(#grad-${dataKey1})`} strokeWidth={2} />
            {dataKey2 && <Area type="monotone" dataKey={dataKey2} stroke={color2} fill={`url(#grad-${dataKey2})`} strokeWidth={1} strokeDasharray="5 5" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
