'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useIntelligence } from '@/hooks/useIntelligence';
import { usePWSNearby, WUNotConfiguredError } from '@/hooks/usePWS';
import { useNearbyMetars } from '@/hooks/useMetar';
import { useNearbyMetEireannObs } from '@/hooks/useMetEireannObs';
import { useLocationStore } from '@/store/useLocationStore';
import { WeatherData } from '@/services/weatherService';
import { distanceKm } from '@/lib/weatherUtils';
import { Satellite, Radio, Activity, MapPin, Gauge, Wifi, Plane, CloudSun } from 'lucide-react';

interface StationsViewProps {
  weather: WeatherData;
}

export default function StationsView({ weather }: StationsViewProps) {
  const t = useTranslations('Stations');
  const { coords } = useLocationStore();
  const intelligence = useIntelligence(weather);
  const { aemet } = intelligence;
  const pwsNearby = usePWSNearby(8);
  const metarNearby = useNearbyMetars();
  const metEireannObs = useNearbyMetEireannObs();
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
          <Satellite className="text-meteorix-highlight" size={22} />
          {t('title')}
        </h2>
        <p className="text-xs text-white/60 font-inter">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station Card */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-meteorix-highlight/5">
             <Radio size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 rounded-2xl bg-white/5 text-meteorix-highlight border border-white/5">
                  <Satellite size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-outfit font-semibold text-meteorix-highlight uppercase tracking-[0.2em] mb-1">{t('reference')}</div>
                  <h3 className="text-2xl font-bold text-white font-outfit tracking-tight">
                    {aemet.nearestStation?.ubi || (intelligence.loadStates.stations ? t('syncing') : t('outOfRange'))}
                  </h3>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <StationMetric label={t('temp')} value={`${aemet.nearestStation?.ta || '--'}°C`} color="text-white font-semibold" />
               <StationMetric label={t('wind')} value={`${Math.round((aemet.nearestStation?.vvm || 0) * 3.6)} km/h`} color="text-white/90" />
               <StationMetric label={t('humidity')} value={`${aemet.nearestStation?.hr || '--'}%`} color="text-white/80" />
               <StationMetric label={t('pressure')} value={`${aemet.nearestStation?.pres || '--'} hPa`} color="text-white/60" />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] text-white/50 uppercase tracking-widest font-semibold font-inter">
               <span>ID: {aemet.nearestStation?.idema || 'N/A'}</span>
               <span>{t('lastObs')}: {aemet.nearestStation ? new Date(aemet.nearestStation.fint).toLocaleTimeString() : '--'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities & Status */}
        <div className="space-y-6">
            <div className="glass-panel p-6">
               <h4 className="text-[10px] font-outfit font-semibold text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
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
                          <span className="text-[9px] font-semibold text-white/80 uppercase tracking-widest font-inter">{cap}</span>
                       </div>
                     );
                  })}
               </div>
            </div>

            <div className="p-6 border border-meteorix-blue/10 rounded-3xl bg-meteorix-blue/5">
               <p className="text-[10px] leading-relaxed text-meteorix-highlight/80 italic font-medium font-inter">
                  {t('note')}
               </p>
            </div>
         </div>
      </div>

      {/* The national forecast provider, deliberately kept out of the station
          lists below. What the app holds from Met Éireann is a point forecast
          (HARMONIE), not an anemometer reading, so listing it beside AEMET and
          METAR rows would present a model value as a measurement. Separate
          block, explicit disclaimer. */}
      {intelligence.metEireann.isAvailable && intelligence.metEireann.nextHour && (
        <div className="glass-panel p-6 border-l-2 border-l-emerald-400/40">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-outfit font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                <span className="text-emerald-300"><CloudSun size={16} /></span>
                {t('official.title')}
              </h3>
              <p className="text-[10px] text-white/50 mt-1 font-inter max-w-2xl leading-relaxed">
                {t('official.disclaimer')}
              </p>
            </div>
            {intelligence.metEireann.updated && (
              <div className="text-[9px] uppercase tracking-widest text-white/45 shrink-0 text-right">
                {t('official.issued')}<br />
                {new Date(intelligence.metEireann.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <ForecastMetric label={t('temp')} value={formatNumber(intelligence.metEireann.nextHour.temp, '°C')} />
            {/* Met Éireann reports wind in m/s in the forecast XML. */}
            <ForecastMetric label={t('wind')} value={formatWindFromMs(intelligence.metEireann.nextHour.windSpeed)} />
            <ForecastMetric label={t('rain')} value={formatNumber(intelligence.metEireann.nextHour.precipitation, ' mm')} />
            <ForecastMetric label={t('humidity')} value={formatNumber(intelligence.metEireann.nextHour.humidity, '%')} />
            <ForecastMetric label={t('pressure')} value={formatNumber(intelligence.metEireann.nextHour.pressure, ' hPa')} />
            <ForecastMetric label={t('panels.direction')} value={formatDirection(intelligence.metEireann.nextHour.windDirection)} />
          </div>
        </div>
      )}

      {/* Three networks now (AEMET, METAR, PWS), so the row splits at 2xl
          instead of xl — at xl each column was too narrow for the metric grid
          inside a station row. */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <StationListPanel
          title={t('panels.aemetTitle')}
          subtitle={t('panels.aemetSubtitle')}
          icon={<Satellite size={16} />}
          isLoading={intelligence.loadStates.stations}
          emptyText={t('noStations')}
          syncingText={t('panels.syncing')}
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
                { label: t('panels.gust'), value: formatWindFromMs(station.vmax) },
                { label: t('humidity'), value: formatNumber(station.hr, '%') },
                { label: t('pressure'), value: formatNumber(station.pres, ' hPa') },
                { label: t('rain'), value: formatNumber(station.prec, ' mm') },
                { label: t('panels.direction'), value: formatDirection(station.dv) },
                { label: t('panels.altitude'), value: formatNumber(station.alt, ' m') },
              ]}
              observedAt={station.fint}
              obsLabel={t('panels.obs')}
            />
          ))}
        </StationListPanel>

        {/* Only rendered in Ireland — the hook is disabled elsewhere, so an
            empty panel never appears outside the network's coverage. */}
        {metEireannObs.isEnabled && (
          <StationListPanel
            title={t('panels.meTitle')}
            subtitle={t('panels.meSubtitle')}
            icon={<CloudSun size={16} />}
            isLoading={metEireannObs.isLoading}
            errorText={metEireannObs.isError ? t('panels.meError') : undefined}
            emptyText={t('panels.meEmpty')}
            syncingText={t('panels.syncing')}
            footnote={t('panels.approxNote')}
          >
            {(metEireannObs.data ?? []).map((station) => (
              <StationRow
                key={station.slug}
                name={station.stationName}
                source={`Met Éireann · ${station.slug}`}
                distance={`${station.positionIsApproximate ? '~' : ''}${station.distanceKm.toFixed(1)} km`}
                metrics={[
                  { label: t('temp'), value: formatNumber(station.temperature, '°C') },
                  { label: t('wind'), value: formatNumber(station.windSpeed, ' km/h') },
                  { label: t('panels.gust'), value: formatNumber(station.windGusts, ' km/h') },
                  { label: t('humidity'), value: formatNumber(station.humidity, '%') },
                  { label: t('pressure'), value: formatNumber(station.pressure, ' hPa') },
                  { label: t('rain'), value: formatNumber(station.rainfall, ' mm') },
                  { label: t('panels.direction'), value: station.cardinalDirection ?? formatDirection(station.windDirection) },
                ]}
                observedAt={station.observedAt}
                obsLabel={t('panels.obs')}
              />
            ))}
          </StationListPanel>
        )}

        <StationListPanel
          title={t('panels.metarTitle')}
          subtitle={t('panels.metarSubtitle')}
          icon={<Plane size={16} />}
          isLoading={metarNearby.isLoading}
          errorText={metarNearby.isError ? t('panels.metarError') : undefined}
          emptyText={t('panels.metarEmpty')}
          syncingText={t('panels.syncing')}
        >
          {(metarNearby.data ?? []).slice(0, 12).map((station) => (
            <StationRow
              key={station.stationId}
              name={station.stationName}
              source={`METAR · ${station.stationId}`}
              distance={`${station.distanceKm.toFixed(1)} km`}
              metrics={[
                { label: t('temp'), value: formatNumber(station.temperature, '°C') },
                { label: t('wind'), value: formatNumber(station.windSpeed, ' km/h') },
                { label: t('panels.gust'), value: formatNumber(station.windGusts, ' km/h') },
                { label: t('panels.dewPoint'), value: formatNumber(station.dewPoint, '°C') },
                { label: t('pressure'), value: formatNumber(station.pressure, ' hPa') },
                { label: t('panels.direction'), value: formatDirection(station.windDirection) },
                { label: t('panels.altitude'), value: formatNumber(station.elevation, ' m') },
              ]}
              observedAt={station.observedAt}
              obsLabel={t('panels.obs')}
            />
          ))}
        </StationListPanel>

        <StationListPanel
          title={t('panels.pwsTitle')}
          subtitle={t('panels.pwsSubtitle')}
          icon={<Wifi size={16} />}
          isLoading={pwsNearby.isLoading}
          syncingText={t('panels.syncing')}
          errorText={
            pwsNearby.error instanceof WUNotConfiguredError
              ? t('panels.pwsNotConfigured')
              : pwsNearby.isError
              ? t('panels.pwsError')
              : undefined
          }
          emptyText={t('panels.pwsEmpty')}
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
                { label: t('panels.gust'), value: formatNumber(station.metric?.windGust, ' km/h') },
                { label: t('humidity'), value: formatNumber(station.humidity, '%') },
                { label: t('pressure'), value: formatNumber(station.metric?.pressure, ' hPa') },
                { label: t('rain'), value: formatNumber(station.metric?.precipRate, ' mm/h') },
                { label: t('panels.direction'), value: formatDirection(station.winddir) },
                { label: 'UV', value: formatNumber(station.uv, '') },
              ]}
              observedAt={station.obsTimeUtc}
              obsLabel={t('panels.obs')}
            />
          ))}
        </StationListPanel>
      </div>
    </div>
  );
}

function ForecastMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] border border-white/5 px-3 py-2">
      <div className="text-[8px] uppercase tracking-widest text-white/50">{label}</div>
      <div className="text-xs font-bold text-white/95 mt-1">{value}</div>
    </div>
  );
}

function StationMetric({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="space-y-2">
       <div className="text-[9px] font-outfit font-semibold text-white/50 uppercase tracking-widest">{label}</div>
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
  syncingText,
  footnote,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  errorText?: string;
  emptyText: string;
  syncingText: string;
  footnote?: string;
  children: React.ReactNode;
}) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-outfit font-semibold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-meteorix-highlight">{icon}</span>
            {title}
          </h3>
          <p className="text-[10px] text-white/50 mt-1 font-inter">{subtitle}</p>
        </div>
        <Gauge size={16} className="text-white/45" />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-[10px] uppercase tracking-widest text-white/50">{syncingText}</div>
      ) : errorText ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs text-amber-100">{errorText}</div>
      ) : hasItems ? (
        <div className="divide-y divide-white/5 max-h-[620px] overflow-y-auto pr-2">{children}</div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs text-white/60">{emptyText}</div>
      )}

      {footnote && !isLoading && !errorText && (
        <p className="mt-4 pt-3 border-t border-white/5 text-[9px] leading-relaxed text-white/40 font-inter">{footnote}</p>
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
  obsLabel,
}: {
  name: string;
  source: string;
  distance: string;
  metrics: { label: string; value: string }[];
  observedAt?: string;
  obsLabel: string;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{name}</div>
          <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50">
            <MapPin size={11} />
            <span>{source}</span>
            <span className="text-white/40">/</span>
            <span>{distance}</span>
          </div>
          {observedAt && (
            <div className="mt-1 text-[9px] uppercase tracking-widest text-white/45">
              {obsLabel} {formatObservedTime(observedAt)}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-[360px]">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-white/[0.04] border border-white/5 px-3 py-2">
              <div className="text-[8px] uppercase tracking-widest text-white/50">{metric.label}</div>
              <div className="text-xs font-bold text-white/95 mt-1">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
