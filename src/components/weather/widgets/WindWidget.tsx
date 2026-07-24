'use client';

import { useState } from 'react';
import { Wind, Navigation, RadioTower } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import WidgetWrapper from './WidgetWrapper';
import ExpandedWidgetView from './ExpandedWidgetView';
import type { WeatherData } from '@/services/weatherService';

/** A real anemometer reading from a nearby ground station, already converted to km/h. */
export interface WindObservation {
  stationName: string;
  network: string;
  distanceKm: number;
  speed: number;
  gusts?: number;
  observedAt: string;
  /** Station position is a geocoded place name, so the distance is indicative. */
  positionIsApproximate?: boolean;
}

interface WindWidgetProps {
  speed: number;
  direction: number;
  gusts?: number;
  title: string;
  daily?: Pick<WeatherData['daily'], 'time' | 'windMax' | 'windGustsMax' | 'windDirDominant'>;
  /** Omitted when no trustworthy nearby observation exists (outside station coverage, too far, or stale). */
  observation?: WindObservation;
}

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function WindWidget({ speed, direction, gusts, title, daily, observation }: WindWidgetProps) {
  const locale = useLocale();
  const t = useTranslations('Widgets');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Rounded to the same precision already shown (speed.toFixed(1) below) so
  // trivial float jitter between re-renders doesn't produce a "new" duration
  // string — which would restart the CSS animation from its 0% keyframe and
  // read as a visible stutter even though the displayed speed didn't change.
  const roundedSpeed = Math.round(speed * 10) / 10;
  const duration = roundedSpeed > 0 ? Math.max(0.4, 25 / roundedSpeed) : 0;
  // Gusts noticeably above sustained speed = more relevant to flag than a static "stable" label.
  const isGusty = typeof gusts === 'number' && gusts > speed * 1.3 && gusts - speed > 5;

  return (
    <>
    <WidgetWrapper
      title={title}
      icon={<Wind size={14} className="animate-pulse text-blue-400" />}
      onExpand={daily ? () => setIsDetailOpen(true) : undefined}
    >
      <div className="relative flex flex-col items-center w-full h-full min-w-0">
        {/* The rotor and its compass backdrop share one fixed-size box. The
            backdrop used to be `absolute inset-0` across the whole card, so it
            centred itself against the full content height rather than against
            the rotor — anything added below (the observation block) pushed the
            compass down on top of the readouts, which is what showed up as
            overlapping text on narrow phone layouts. */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full rounded-full border border-white/5 bg-zinc-900/40 shadow-inner" />

          {/* Direction Markers */}
          <svg viewBox="0 0 100 100" className="absolute w-32 h-32 opacity-20">
            {COMPASS_DIRECTIONS.map((d, i) => {
              const a = (i * 45 - 90) * (Math.PI / 180);
              return (
                <text 
                  key={d}
                  x={50 + 42 * Math.cos(a)} 
                  y={50 + 42 * Math.sin(a)}
                  fill="white" fontSize="6" textAnchor="middle" alignmentBaseline="middle"
                  fontFamily="Orbitron"
                >
                  {d}
                </text>
              );
            })}
            {/* Compass Ticks */}
            {[...Array(72)].map((_, i) => (
              <line 
                key={i}
                x1="50" y1="12" x2="50" y2={i % 9 === 0 ? "8" : "10"}
                stroke="white" strokeWidth={i % 9 === 0 ? "0.5" : "0.2"}
                transform={`rotate(${i * 5} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Turbine Rotor */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Support Mast */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-t from-transparent via-white/10 to-white/40 rounded-full" />
          
          {/* Rotor: outer div holds the static wind-direction heading, inner
              div holds only the spin animation. Both used to fight over the
              same `transform` on one element — a running CSS animation
              fully overrides a static `transform`, so direction was never
              actually visible, and any re-render that restarted the
              animation would flash the direction value for a frame before
              the spin resumed, looking like a stutter. */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: `rotate(${direction}deg)` }}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ animation: duration > 0 ? `spin ${duration}s linear infinite` : 'none' }}
            >
              <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-sm">
                {[0, 120, 240].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 50 50)`}>
                    <path
                      d="M50 50 L50 10 Q65 10 55 50 Z"
                      fill="url(#blade-gradient)"
                      stroke="rgba(96, 165, 250, 0.5)"
                      strokeWidth="0.5"
                    />
                    <line x1="50" y1="50" x2="50" y2="20" stroke="white" strokeWidth="0.3" strokeOpacity="0.6" />
                  </g>
                ))}
                <circle cx="50" cy="50" r="5" className="fill-[#030b1a] stroke-blue-400 stroke-2" />
                <circle cx="50" cy="50" r="1.5" className="fill-blue-400 animate-pulse" />

                <defs>
                  <linearGradient id="blade-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="rgba(0, 80, 255, 0.2)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        </div>

        {/* Data Overlay */}
        <div className="mt-1 flex flex-col items-center w-full min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-outfit font-bold text-white tracking-tighter leading-none drop-shadow-glow">
              {speed.toFixed(1)}
            </span>
            <span className="text-[10px] text-blue-400 font-outfit uppercase tracking-widest opacity-80">km/h</span>
          </div>
          
          {/* Wraps instead of overflowing: at the mobile two-column grid width
              the direction and gust chips do not fit on one line. */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-full">
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-orange-400 animate-ping shrink-0" />
               <span className="text-[10px] font-inter text-white/65 whitespace-nowrap">{direction}° {COMPASS_DIRECTIONS[Math.round(direction/45)%8]}</span>
            </div>
            {typeof gusts === 'number' && (
              <>
                <div className="w-[1px] h-2 bg-white/10" />
                <span className={`text-[10px] font-outfit uppercase tracking-tighter ${isGusty ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {t('wind.gustsShort', { value: gusts.toFixed(0) })}
                </span>
              </>
            )}
          </div>

          {/* Nearby real observation. The dial above is a model forecast; in
              complex terrain a model can read half the sustained wind an
              anemometer a couple of km away is actually measuring, so the
              measurement is shown alongside rather than silently disagreeing
              off-screen. Only rendered when it is close and recent enough to
              describe the same conditions — see WidgetGrid for the gating. */}
          {observation && (
            <div className="mt-2 w-full min-w-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-cyan-400/5 border border-cyan-400/15">
              <div className="flex items-center gap-1 text-cyan-300/80 w-full min-w-0 justify-center">
                <RadioTower size={9} className="shrink-0" />
                <span className="text-[8px] font-outfit uppercase tracking-widest truncate min-w-0" title={observation.stationName}>
                  {observation.stationName}
                </span>
              </div>
              <div className="text-[10px] font-outfit text-white/90 text-center leading-tight">
                {observation.speed.toFixed(0)} km/h
                {typeof observation.gusts === 'number' && (
                  <span className="text-white/60"> · {t('wind.gustsShort', { value: observation.gusts.toFixed(0) })}</span>
                )}
              </div>
              <div className="text-[7px] font-inter text-white/40 uppercase tracking-wider text-center truncate w-full min-w-0">
                {t('wind.observedFrom', {
                  network: observation.network,
                  distance: `${observation.positionIsApproximate ? '~' : ''}${observation.distanceKm.toFixed(1)}`,
                  time: new Date(observation.observedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>

    {daily && (
      <ExpandedWidgetView
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`${title} · 7 dias`}
        icon={<Wind size={16} />}
      >
        <div className="flex flex-col gap-2">
          {daily.time.map((dateStr, i) => {
            const date = new Date(dateStr);
            const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
            const dayDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date);
            const dirLabel = COMPASS_DIRECTIONS[Math.round(daily.windDirDominant[i] / 45) % 8];
            return (
              <div key={dateStr} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex flex-col min-w-[64px]">
                  <span className="text-xs font-bold text-white capitalize">{dayName}</span>
                  <span className="text-[10px] text-white/50">{dayDate}</span>
                </div>

                <div className="flex items-center gap-2 text-meteorix-highlight" title={`${daily.windDirDominant[i]}°`}>
                  <Navigation size={16} style={{ transform: `rotate(${daily.windDirDominant[i]}deg)` }} />
                  <span className="text-[10px] font-inter text-white/65 w-6">{dirLabel}</span>
                </div>

                <div className="flex flex-col items-end min-w-[70px]">
                  <span className="text-sm font-bold text-white">{daily.windMax[i].toFixed(0)} km/h</span>
                  <span className="text-[10px] text-white/50">{t('wind.gustsShort', { value: daily.windGustsMax[i].toFixed(0) })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ExpandedWidgetView>
    )}
    </>
  );
}
