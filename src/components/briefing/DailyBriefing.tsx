'use client';

import React, { useMemo } from 'react';
import { Sparkles, Umbrella, Wind, Sun, Car, Bike, Camera, MapPin, AlertTriangle, Volume2, Info } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';
import { useTranslations, useLocale } from 'next-intl';
import { useIntelligence } from '@/hooks/useIntelligence';

interface DailyBriefingProps {
  weather: WeatherData;
  cityName: string;
}

export default function DailyBriefing({ weather, cityName }: DailyBriefingProps) {
  const t = useTranslations('Briefing');
  const locale = useLocale();
  const intelligence = useIntelligence(weather);

  const briefing = useMemo(() => {
    if (!weather) return null;

    const { current } = weather;
    const isRainy = current.precip > 0.5;
    const isHot = current.temp > 30;
    const isCold = current.temp < 10;

    const outdoor = Math.max(0, 100 - (isRainy ? 50 : 0) - (isHot ? 30 : 0));
    const beach = Math.max(0, 100 - (isRainy ? 80 : 0) - (isCold ? 50 : 0) + (current.temp > 25 ? 20 : 0));
    const photo = Math.max(0, 70 + (current.cloudCover < 30 ? 30 : -20) + (current.visibility > 10 ? 10 : -30));
    const garden = Math.max(0, 100 - (isHot ? 40 : 0) - (isCold ? 60 : 0) + (isRainy ? 20 : 0));

    const scores = {
      outdoor,
      beach,
      photo,
      garden,
      driving: Math.max(0, 100 - (isRainy ? 40 : 0) - (current.visibility < 5 ? 60 : 0)),
    };

    let summary = t('summaries.optimal');
    if (isRainy) summary = t('summaries.rain');
    else if (current.windSpeed > 40) summary = t('summaries.wind');
    else if (isHot) summary = t('summaries.hot');
    else if (current.cloudCover > 80) summary = t('summaries.clouds');

    return { scores, summary };
  }, [weather, t]);

  const handleSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!briefing) return null;

  const anomaly = intelligence.climate?.anomaly || 0;
  const showAnomaly = Math.abs(anomaly) > 1.5;

  return (
    <div className="bg-meteorix-card border border-meteorix-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-meteorix-blue/5 blur-[120px] -mr-48 -mt-48 rounded-full" />
      
      <div className="relative flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-meteorix-blue/20 text-meteorix-blue shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">{t('title')}</h3>
                <p className="text-xl font-bold text-white/90">{t('situation', { city: cityName })}</p>
              </div>
            </div>
            <button 
              onClick={() => handleSpeech(`${t('voiceIntro', { city: cityName })} ${briefing.summary}`)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-meteorix-blue transition-all border border-white/5"
              title={t('speech')}
            >
              <Volume2 size={18} />
            </button>
          </div>
          
          <p className="text-sm md:text-base leading-relaxed text-white/70 max-w-2xl font-medium">
            {briefing.summary}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {weather.current.precip > 0.5 && (
              <Badge icon={<Umbrella size={12} />} label={t('umbrella')} color="bg-blue-500/20 text-blue-400" />
            )}
            {weather.current.windSpeed > 35 && (
              <Badge icon={<Wind size={12} />} label={t('wind')} color="bg-orange-500/20 text-orange-400" />
            )}
            {weather.current.visibility < 5 && (
              <Badge icon={<AlertTriangle size={12} />} label={t('visibility')} color="bg-red-500/20 text-red-400" />
            )}
            {showAnomaly && (
               <Badge 
                 icon={<Info size={12} />} 
                 label={`${anomaly > 0 ? '+' : ''}${anomaly}°C vs 30y ERA5`} 
                 color={anomaly > 0 ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"} 
               />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full xl:w-auto">
          <ScoreCard label={t('activities.sport')} score={briefing.scores.outdoor} icon={<Bike size={14} />} color="text-meteorix-blue" />
          <ScoreCard label={t('activities.route')} score={briefing.scores.driving} icon={<Car size={14} />} color="text-meteorix-blue" />
          <ScoreCard label={t('activities.photo')} score={briefing.scores.photo} icon={<Camera size={14} />} color="text-meteorix-blue" />
          <ScoreCard label={t('activities.beach')} score={briefing.scores.beach} icon={<Sun size={14} />} color="text-meteorix-blue" />
          <ScoreCard label={t('activities.garden')} score={briefing.scores.garden} icon={<MapPin size={14} />} color="text-meteorix-blue" />
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${color}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ScoreCard({ icon, label, score, color }: { icon: React.ReactNode; label: string; score: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 w-full min-w-[100px]">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</div>
      <div className="text-xl font-black font-orbitron text-white/90">{score}%</div>
      <div className="mt-2 h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
