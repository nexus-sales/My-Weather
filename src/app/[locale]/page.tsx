'use client';

import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import SearchBar from '@/components/ui/SearchBar';
import DashboardView from '@/components/weather/DashboardView';
import RadarView from '@/components/radar/RadarView';
import AetherChat from '@/components/ai/AetherChat';
import { useWeather } from '@/hooks/useWeather';
import { useLocationStore } from '@/store/useLocationStore';
import { BarChart3, BrainCircuit, History, LayoutDashboard, Map as MapIcon, Satellite } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export default function HomePage() {
  const t = useTranslations('Index');
  const { cityName } = useLocationStore();
  const { activeTab, setActiveTab } = useUIStore();
  const { data: weather, isLoading, error } = useWeather();

  const tabs = [
    { id: 'dashboard', label: t('tabs.dashboard'), icon: LayoutDashboard },
    { id: 'radar', label: t('tabs.radar'), icon: MapIcon },
    { id: 'ai', label: t('tabs.ai'), icon: BrainCircuit },
    { id: 'charts', label: t('tabs.charts'), icon: BarChart3 },
    { id: 'history', label: t('tabs.history'), icon: History },
    { id: 'stations', label: t('tabs.stations'), icon: Satellite },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-meteorix-bg text-foreground bg-meteorix-gradient flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-meteorix opacity-50" />
      <div className="scan-overlay" />

      <header className="relative z-40 flex items-center justify-between px-8 py-4 border-b border-meteorix-border bg-meteorix-bg/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-widest text-meteorix-blue animate-pulse-glow font-orbitron">
            {t('title')}
          </h1>
          <div className="hidden lg:block text-[8px] font-orbitron tracking-[0.2em] text-white/30 border-l border-white/10 pl-4 uppercase">
            {t('controlCenter')}
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
        </div>
      </header>

      <nav className="relative z-30 flex items-center justify-center px-8 border-b border-white/5 bg-meteorix-bg/40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      <div className="md:hidden relative z-20 px-8 py-4 bg-meteorix-bg/20 backdrop-blur-sm border-b border-white/5">
        <SearchBar />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-8 py-8 md:py-12 animate-fadein overflow-y-auto">
        <div className="max-w-[1500px] w-full px-4 md:px-0">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-32">
              <div className="w-12 h-12 border-4 border-meteorix-blue/30 border-t-meteorix-blue rounded-full animate-spin" />
              <div className="text-xs font-orbitron tracking-widest text-meteorix-blue/50 uppercase animate-blink">{t('loading')}</div>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-950/20 border border-red-900/50 p-6 rounded-2xl text-center font-orbitron text-xs tracking-widest uppercase">
              {t('connectionError')}
            </div>
          ) : weather && (
            <>
              {activeTab === 'dashboard' && <DashboardView weather={weather} cityName={cityName} />}
              {activeTab === 'radar' && <RadarView />}
              {activeTab === 'ai' && <AetherChat weather={weather} cityName={cityName} />}

              {activeTab !== 'dashboard' && activeTab !== 'radar' && activeTab !== 'ai' && (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="text-[10px] tracking-[0.4em] font-bold text-white/30 uppercase mb-4 animate-pulse">
                    {t('moduleOffline', { module: activeTab.toUpperCase() })}
                  </div>
                  <p className="text-[8px] tracking-[0.2em] text-white/10 uppercase">{t('moduleMigrating')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-auto pb-12 text-center text-[10px] opacity-20 tracking-[0.5em] font-bold uppercase">
        {t('footer')}
      </footer>
    </div>
  );
}
