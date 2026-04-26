'use client';

import { useTranslations } from 'next-intl';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { WeatherData } from '@/services/weatherService';
import { Activity } from 'lucide-react';

interface HourlyChartProps {
  data: WeatherData['hourly'];
}

export default function HourlyChart({ data }: HourlyChartProps) {
  const t = useTranslations('Dashboard');

  // Prepare data for the first 24 hours
  const chartData = data.time.slice(0, 24).map((time, i) => {
    const date = new Date(time);
    return {
      hour: date.getHours() + ':00',
      temp: Math.round(data.temp[i]),
      precip: data.precipProb[i],
    };
  });

  return (
    <div className="w-full bg-meteorix-card border border-meteorix-border rounded-3xl p-6 backdrop-blur-xl animate-fadein" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-4 h-4 text-meteorix-blue/60" />
        <h3 className="text-[10px] tracking-[0.4em] text-meteorix-blue/80 font-bold uppercase">
          Evolución Térmica (24H)
        </h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a5aff" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#1a5aff" stopOpacity={0} />
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
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
              unit="°"
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#040d22', 
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '700',
                fontFamily: 'var(--font-orbitron)',
                color: '#fff'
              }}
              itemStyle={{ color: '#00d4ff' }}
              cursor={{ stroke: 'rgba(0,212,255,0.2)', strokeWidth: 1 }}
            />
            
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#00d4ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              animationDuration={2000}
            />

            <Area 
              type="monotone" 
              dataKey="precip" 
              stroke="#1a5aff" 
              strokeWidth={1}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorPrecip)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
          <span className="text-[9px] tracking-widest text-white/40 font-bold uppercase">Temperatura</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1a5aff] opacity-50" />
          <span className="text-[9px] tracking-widest text-white/40 font-bold uppercase">Prob. Lluvia</span>
        </div>
      </div>
    </div>
  );
}
