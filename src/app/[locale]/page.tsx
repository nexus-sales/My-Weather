'use client';

import {useTranslations} from 'next-intl';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import SearchBar from '@/components/ui/SearchBar';
import Forecast7Days from '@/components/weather/Forecast7Days';
import HourlyChart from '@/components/weather/HourlyChart';
import RadarView from '@/components/radar/RadarView';
import { useWeather } from '@/hooks/useWeather';
import { useLocationStore } from '@/store/useLocationStore';
import { getWeatherCondition } from '@/lib/weatherUtils';
import { MapPin, LayoutDashboard, Map as MapIcon, BrainCircuit, BarChart3, History, Satellite } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const t = useTranslations('Index');
  const d = useTranslations('Dashboard');
  const { cityName } = useLocationStore();
  const { activeTab, setActiveTab } = useUIStore();
  const { data: weather, isLoading, error } = useWeather();
  useGeolocation();

  const TABS = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'radar', label: 'RADAR', icon: MapIcon },
    { id: 'ai', label: 'AETHER AI', icon: BrainCircuit },
    { id: 'charts', label: 'ANÁLISIS', icon: BarChart3 },
    { id: 'history', label: 'HISTÓRICO', icon: History },
    { id: 'stations', label: 'ESTACIONES', icon: Satellite },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-meteorix-bg text-foreground bg-meteorix-gradient flex flex-col">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-meteorix opacity-50" />
      
      {/* Scanline Effect */}
      <div className="scan-overlay" />

      {/* Header */}
      <header className="relative z-40 flex items-center justify-between px-8 py-4 border-b border-meteorix-border bg-meteorix-bg/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-widest text-meteorix-blue animate-pulse-glow font-orbitron">
            {t('title')}
          </h1>
          <div className="hidden lg:block text-[8px] font-orbitron tracking-[0.2em] text-white/30 border-l border-white/10 pl-4 uppercase">
            Control Center v5.0
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="relative z-30 flex items-center justify-center px-8 border-b border-white/5 bg-meteorix-bg/40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-meteorix-blue text-meteorix-blue bg-meteorix-blue/5' 
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden relative z-20 px-8 py-4 bg-meteorix-bg/20 backdrop-blur-sm border-b border-white/5">
        <SearchBar />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-8 py-8 md:py-12 animate-fadein overflow-y-auto">
        <div className="max-w-7xl w-full">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-32">
              <div className="w-12 h-12 border-4 border-meteorix-blue/30 border-t-meteorix-blue rounded-full animate-spin" />
              <div className="text-xs font-orbitron tracking-widest text-meteorix-blue/50 uppercase animate-blink">Syncing Satellite Data...</div>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-950/20 border border-red-900/50 p-6 rounded-2xl text-center">
              ⚠️ Connection Error. Re-linking to ECMWF satellites...
            </div>
          ) : weather && (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Weather Card */}
                    <div className="relative group bg-meteorix-card border border-meteorix-border p-8 rounded-3xl backdrop-blur-2xl transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-[10px] tracking-[0.4em] text-meteorix-blue/60 font-bold uppercase">
                          {d('current_weather')}
                        </h3>
                        <div className="text-4xl" title={getWeatherCondition(weather.current.weatherCode).label}>
                          {getWeatherCondition(weather.current.weatherCode).icon}
                        </div>
                      </div>
                      
                      <div className="text-8xl font-black text-meteorix-blue mb-4 font-orbitron drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                        {Math.round(weather.current.temp)}°
                      </div>
                      
                      <div className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-8 flex items-center gap-2">
                        <MapPin size={10} className="text-meteorix-blue" />
                        {cityName}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-8 border-t border-white/5">
                        <div className="text-left">
                          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('feels_like')}</div>
                          <div className="text-sm font-bold font-orbitron text-meteorix-orange">{Math.round(weather.current.feelsLike)}°C</div>
                        </div>
                        <div className="text-left">
                          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('humidity')}</div>
                          <div className="text-sm font-bold font-orbitron">{weather.current.humidity}%</div>
                        </div>
                        <div className="text-left">
                          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('wind')}</div>
                          <div className="text-sm font-bold font-orbitron text-meteorix-green">{Math.round(weather.current.windSpeed)} KM/H</div>
                        </div>
                        <div className="text-left">
                          <div className="text-[8px] tracking-widest opacity-40 mb-1 uppercase">{d('pressure')}</div>
                          <div className="text-sm font-bold font-orbitron opacity-70">{Math.round(weather.current.pressure)} HPA</div>
                        </div>
                      </div>
                    </div>

                    {/* Hourly Chart */}
                    <div className="lg:col-span-2">
                      <HourlyChart data={weather.hourly} />
                    </div>
                  </div>

                  {/* 7-Day Forecast */}
                  <Forecast7Days data={weather.daily} />
                </div>
              )}

              {activeTab === 'radar' && (
                <RadarView />
              )}

              {activeTab !== 'dashboard' && activeTab !== 'radar' && (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="text-[10px] tracking-[0.4em] font-bold text-white/30 uppercase mb-4 animate-pulse">
                    Módulo {activeTab.toUpperCase()} Offline
                  </div>
                  <p className="text-[8px] tracking-[0.2em] text-white/10 uppercase">En fase de migración técnica</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="relative z-10 mt-auto pb-12 text-center text-[10px] opacity-20 tracking-[0.5em] font-bold">
        METEOROLOGÍA A NIVEL DE INGENIERÍA
      </footer>
    </div>
  );
}
