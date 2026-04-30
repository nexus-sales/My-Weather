'use client';

import React, { useMemo } from 'react';
import { Sparkles, Umbrella, Wind, Sun, Car, Bike, Camera, MapPin, AlertTriangle, Volume2, Info } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';

interface DailyBriefingProps {
  weather: WeatherData;
  cityName: string;
}

export default function DailyBriefing({ weather, cityName }: DailyBriefingProps) {
  const current = weather.current;

  const handleSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Logic for the briefing
  const briefing = useMemo(() => {
    const isRainy = current.precip > 0.1;
    const isWindy = current.windSpeed > 25;
    const isHot = current.temp > 30;
    const isCold = current.temp < 10;
    
    // Activity Scores (0-100)
    const outdoor = Math.max(0, 100 - (isRainy ? 60 : 0) - (isWindy ? 40 : 0) - (isHot ? 20 : 0));
    const beach = Math.max(0, (current.temp > 25 ? 80 : 20) + (current.cloudCover < 10 ? 20 : -40) - (isRainy ? 100 : 0));
    const photo = Math.max(0, 70 + (current.cloudCover < 30 ? 30 : -20) + (current.visibility > 10 ? 10 : -30));
    const garden = Math.max(0, 100 - (isHot ? 40 : 0) - (isCold ? 60 : 0) + (isRainy ? 20 : 0));

    // Simple anomaly heuristic (April baseline ~18C)
    const baseline = 18;
    const anomaly = current.temp - baseline;

    const scores = {
      outdoor,
      beach,
      photo,
      garden,
      driving: Math.max(0, 100 - (isRainy ? 40 : 0) - (current.visibility < 5 ? 60 : 0)),
      anomaly: parseFloat(anomaly.toFixed(1))
    };

    let summary = "";
    if (isRainy) summary = "Se esperan precipitaciones. Día ideal para actividades de interior o lectura.";
    else if (isWindy) summary = "Viento fuerte detectado. Precaución en zonas arboladas y conducción.";
    else if (isHot) summary = "Calor intenso. Busca sombras y mantén la hidratación alta.";
    else if (current.cloudCover > 80) summary = "Cielos muy cubiertos, pero sin lluvia inminente. Buena luz difusa para fotos.";
    else summary = "Condiciones óptimas. El tiempo no será un impedimento para tus planes hoy.";

    return { scores, summary };
  }, [current]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-meteorix-blue/20 via-transparent to-purple-500/10 p-6 backdrop-blur-xl animate-fadein shadow-2xl">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-meteorix-blue/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-meteorix-blue/20 text-meteorix-blue shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Nexus Intelligence Briefing</h3>
                <p className="text-xl font-bold text-white/90">Situación en {cityName}</p>
              </div>
            </div>
            <button 
              onClick={() => handleSpeech(`Resumen meteorológico para ${cityName}. ${briefing.summary}`)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-meteorix-blue transition-all border border-white/5"
              title="Escuchar resumen"
            >
              <Volume2 size={18} />
            </button>
          </div>
          
          <p className="text-sm md:text-base leading-relaxed text-white/70 max-w-2xl font-medium">
            {briefing.summary}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {current.precip > 0 && (
              <Badge icon={<Umbrella size={12} />} label="Paraguas necesario" color="bg-meteorix-blue/20 text-meteorix-blue" />
            )}
            {current.windSpeed > 20 && (
              <Badge icon={<Wind size={12} />} label="Rachas de viento" color="bg-meteorix-orange/20 text-meteorix-orange" />
            )}
            {current.visibility < 5 && (
              <Badge icon={<AlertTriangle size={12} />} label="Baja visibilidad" color="bg-red-500/20 text-red-400" />
            )}
            {Math.abs(briefing.scores.anomaly) > 2 && (
               <Badge 
                 icon={<Info size={12} />} 
                 label={`${briefing.scores.anomaly > 0 ? '+' : ''}${briefing.scores.anomaly}°C vs Media ERA5`} 
                 color={briefing.scores.anomaly > 0 ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"} 
               />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full xl:w-auto">
          <ScoreCard icon={<Bike size={18} />} label="Deporte" score={briefing.scores.outdoor} color="text-meteorix-green" />
          <ScoreCard icon={<Car size={18} />} label="Ruta" score={briefing.scores.driving} color="text-meteorix-blue" />
          <ScoreCard icon={<Camera size={18} />} label="Foto" score={briefing.scores.photo} color="text-purple-400" />
          <ScoreCard icon={<Sun size={18} />} label="Playa" score={briefing.scores.beach} color="text-yellow-400" />
          <ScoreCard icon={<Sparkles size={18} />} label="Jardín" score={briefing.scores.garden} color="text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {icon}
      {label}
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
