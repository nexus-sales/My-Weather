'use client';

import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import SearchBar from '@/components/ui/SearchBar';
import DashboardView from '@/components/weather/DashboardView';
import RadarView from '@/components/radar/RadarView';
import AetherChat from '@/components/ai/AetherChat';
import ChartsView from '@/components/weather/ChartsView';
import HistoryView from '@/components/weather/HistoryView';
import StationsView from '@/components/weather/StationsView';
import { useWeather } from '@/hooks/useWeather';
import { useLocationStore } from '@/store/useLocationStore';
import { BarChart3, BrainCircuit, History, LayoutDashboard, Map as MapIcon, Satellite } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import LocationPrompt from '@/components/ui/LocationPrompt';

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
    <div className="relative min-h-screen overflow-hidden flex flex-col font-inter">
      <LocationPrompt />
      
      {/* Background Gradient Base (WeatherBackground will sit above this if used, otherwise this is the default deep state) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#09090b] to-[#09090b]"></div>

      <header className="relative z-40 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-zinc-950/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-zinc-950/20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium tracking-tight text-white font-outfit">
            {t('title')}
          </h1>
          <div className="hidden lg:block text-xs font-medium text-white/50 border-l border-white/10 pl-4 uppercase tracking-wider">
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

      {/* Premium Segmented Controls (Tabs) */}
      <nav className="relative z-30 flex items-center justify-start sm:justify-center px-4 md:px-8 py-3 border-b border-white/5 bg-black/20 backdrop-blur-xl overflow-x-auto no-scrollbar">
        <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ease-out whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/60 hover:text-white/75 hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-meteorix-highlight' : ''} />
              <span className="text-xs font-medium tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="md:hidden relative z-20 px-6 py-4 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5">
        <SearchBar />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 py-8 md:py-12 animate-fadein overflow-y-auto">
        <div className="max-w-[1500px] w-full px-4 md:px-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-32">
              <div className="w-10 h-10 border-[3px] border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
              <div className="text-sm font-medium tracking-widest text-white/50 uppercase">{t('loading')}</div>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-950/20 border border-red-900/30 p-6 rounded-2xl text-center text-sm font-medium max-w-md mx-auto">
              {t('connectionError')}
            </div>
          ) : weather && (
            <div className="animate-slideup">
              {activeTab === 'dashboard' && <DashboardView weather={weather} cityName={cityName} />}
              {activeTab === 'radar' && <RadarView />}
              {activeTab === 'ai' && <AetherChat weather={weather} cityName={cityName} />}
              {activeTab === 'charts' && <ChartsView weather={weather} />}
              {activeTab === 'history' && <HistoryView />}
              {activeTab === 'stations' && <StationsView weather={weather} />}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-auto pb-8 pt-4 text-center text-xs text-white/45 font-medium tracking-widest uppercase">
        {t('footer')}
      </footer>
    </div>
  );
}
