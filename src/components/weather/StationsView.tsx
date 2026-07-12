'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useIntelligence } from '@/hooks/useIntelligence';
import { usePWSNearby, WUNotConfiguredError } from '@/hooks/usePWS';
import { useLocationStore } from '@/store/useLocationStore';
import { WeatherData } from '@/services/weatherService';
import { Satellite, Radio, Activity, MapPin, Gauge, Wifi } from 'lucide-react';

interface StationsViewProps {
  weather: WeatherData;
}

export default function StationsView({ weather }: StationsViewProps) {
  const t = useTranslations('Stations');
  const { coords } = useLocationStore();
  const intelligence = useIntelligence(weather);
  const { aemet } = intelligence;
  const pwsNearby = usePWSNearby(8);
  const nearbyAemetStations = React.useMemo(() => {
    return [...(aemet.stations ?? [])]
      .map((station) => ({
        ...station,
        distanceKm: distanceKm(coords.lat, coords.lon, station.lat, station.lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 18);
  }, [aemet.stations, coords.lat, coords.lon]);

  return (
    <div className="space-y-8 animate-fadein">
      <div className="flex flex-col gap-2 pl-2">
        <h2 className="text-2xl font-bold font-outfit tracking-tight text-white flex items-center gap-3">
          <Satellite className="text-blue-400" size={22} />
          {t('title')}
        </h2>
        <p className="text-xs text-zinc-400 font-inter">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station Card */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-blue-500/5">
             <Radio size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 rounded-2xl bg-white/5 text-blue-400 border border-white/5">
                  <Satellite size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-outfit font-semibold text-blue-400 uppercase tracking-[0.2em] mb-1">{t('reference')}</div>
                  <h3 className="text-2xl font-bold text-white font-outfit tracking-tight">
                    {aemet.nearestStation?.ubi || (intelligence.loadStates.stations ? t('syncing') : t('outOfRange'))}
                  </h3>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <StationMetric label={t('temp')} value={`${aemet.nearestStation?.ta || '--'}°C`} color="text-white font-semibold" />
               <StationMetric label={t('wind')} value={`${Math.round((aemet.nearestStation?.vvm || 0) * 3.6)} km/h`} color="text-zinc-200" />
               <StationMetric label={t('humidity')} value={`${aemet.nearestStation?.hr || '--'}%`} color="text-zinc-300" />
               <StationMetric label={t('pressure')} value={`${aemet.nearestStation?.pres || '--'} hPa`} color="text-zinc-400" />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-500 uppercase tracking-widest font-semibold font-inter">
               <span>ID: {aemet.nearestStation?.idema || 'N/A'}</span>
               <span>{t('lastObs')}: {aemet.nearestStation ? new Date(aemet.nearestStation.fint).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities & Status */}
        <div className="space-y-6">
            <div className="glass-panel p-6">
               <h4 className="text-[10px] font-outfit font-semibold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} /> {t('capabilities')}
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aemet.capabilities.map((cap) => {
                     const isAvailable = (cap === 'stations' && !!aemet.nearestStation) || 
                                       (cap === 'alerts' && !!intelligence.alerts) ||
                                       (cap === 'radar' && !!aemet.radar) ||
                                       (cap === 'forecast' && !!aemet.coastal) ||
                                       (cap === 'models');
                     
                     return (
                       <div key={cap} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-[9px] font-semibold text-zinc-300 uppercase tracking-widest font-inter">{cap}</span>
                       </div>
                     );
                  })}
               </div>
            </div>
            
            <div className="p-6 border border-blue-500/10 rounded-3xl bg-blue-500/5">
               <p className="text-[10px] leading-relaxed text-blue-400/80 italic font-medium font-inter">
                  {t('note')}
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <StationListPanel
          title="AEMET oficiales cercanas"
          subtitle="Red oficial. Observaciones puntuales, no modelo interpolado."
          icon={<Satellite size={16} />}
          isLoading={intelligence.loadStates.stations}
          emptyText={t('noStations')}
        >
          {nearbyAemetStations.map((station) => (
            <StationRow
              key={station.idema}
              name={station.ubi}
              source={`AEMET · ${station.idema}`}
              distance={`${station.distanceKm.toFixed(1)} km`}
              metrics={[
                { label: t('temp'), value: formatNumber(station.ta, '°C') },
                { label: t('wind'), value: formatWindFromMs(station.vvm) },
                { label: 'Racha', value: formatWindFromMs(station.vmax) },
                { label: t('humidity'), value: formatNumber(station.hr, '%') },
                { label: t('pressure'), value: formatNumber(station.pres, ' hPa') },
                { label: t('rain'), value: formatNumber(station.prec, ' mm') },
                { label: 'Dir.', value: formatDirection(station.dv) },
                { label: 'Alt.', value: formatNumber(station.alt, ' m') },
              ]}
              observedAt={station.fint}
            />
          ))}
        </StationListPanel>

        <StationListPanel
          title="PWS Weather Underground"
          subtitle="Estaciones personales cercanas cuando la API lo permite."
          icon={<Wifi size={16} />}
          isLoading={pwsNearby.isLoading}
          errorText={
            pwsNearby.error instanceof WUNotConfiguredError
              ? 'Estaciones personales no disponibles: Weather Underground solo emite claves ligadas a una estación (PWS) propia registrada.'
              : pwsNearby.isError
              ? 'Weather Underground no ha devuelto estaciones cercanas. Puede ser un fallo temporal de su API.'
              : undefined
          }
          emptyText="No hay PWS cercanas disponibles para esta zona."
        >
          {(pwsNearby.data ?? []).map((station) => (
            <StationRow
              key={station.stationID}
              name={station.neighborhood || station.stationID}
              source={`WU/PWS · ${station.stationID}`}
              distance={`${distanceKm(coords.lat, coords.lon, station.lat, station.lon).toFixed(1)} km`}
              metrics={[
                { label: t('temp'), value: formatNumber(station.metric?.temp, '°C') },
                { label: t('wind'), value: formatNumber(station.metric?.windSpeed, ' km/h') },
                { label: 'Racha', value: formatNumber(station.metric?.windGust, ' km/h') },
                { label: t('humidity'), value: formatNumber(station.humidity, '%') },
                { label: t('pressure'), value: formatNumber(station.metric?.pressure, ' hPa') },
                { label: t('rain'), value: formatNumber(station.metric?.precipRate, ' mm/h') },
                { label: 'Dir.', value: formatDirection(station.winddir) },
                { label: 'UV', value: formatNumber(station.uv, '') },
              ]}
              observedAt={station.obsTimeUtc}
            />
          ))}
        </StationListPanel>
      </div>
    </div>
  );
}

function StationMetric({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="space-y-2">
       <div className="text-[9px] font-outfit font-semibold text-zinc-500 uppercase tracking-widest">{label}</div>
       <div className={`text-2xl font-bold font-outfit ${color}`}>{value}</div>
    </div>
  );
}

function StationListPanel({
  title,
  subtitle,
  icon,
  isLoading,
  errorText,
  emptyText,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  errorText?: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-outfit font-semibold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-blue-400">{icon}</span>
            {title}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 font-inter">{subtitle}</p>
        </div>
        <Gauge size={16} className="text-zinc-600" />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-[10px] uppercase tracking-widest text-zinc-500">Sincronizando estaciones...</div>
      ) : errorText ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs text-amber-100">{errorText}</div>
      ) : hasItems ? (
        <div className="divide-y divide-white/5 max-h-[620px] overflow-y-auto pr-2">{children}</div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs text-zinc-400">{emptyText}</div>
      )}
    </div>
  );
}

function StationRow({
  name,
  source,
  distance,
  metrics,
  observedAt,
}: {
  name: string;
  source: string;
  distance: string;
  metrics: { label: string; value: string }[];
  observedAt?: string;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{name}</div>
          <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-500">
            <MapPin size={11} />
            <span>{source}</span>
            <span className="text-zinc-700">/</span>
            <span>{distance}</span>
          </div>
          {observedAt && (
            <div className="mt-1 text-[9px] uppercase tracking-widest text-zinc-600">
              Obs. {formatObservedTime(observedAt)}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-[360px]">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-white/[0.04] border border-white/5 px-3 py-2">
              <div className="text-[8px] uppercase tracking-widest text-zinc-500">{metric.label}</div>
              <div className="text-xs font-bold text-zinc-100 mt-1">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatNumber(value: number | undefined | null, suffix: string) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * 10) / 10}${suffix}` : '--';
}

function formatWindFromMs(value: number | undefined | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * 3.6)} km/h` : '--';
}

function formatDirection(value: number | undefined | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}°` : '--';
}

function formatObservedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
