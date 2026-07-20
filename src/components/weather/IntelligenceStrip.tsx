'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, ChevronDown, ChevronUp, CloudSun, DatabaseZap, Moon, ShieldAlert, Waves, Wind, Zap } from 'lucide-react';
import { IntelligenceData } from '@/hooks/useIntelligence';
import { ALERTS_COUNTRY_NAMES } from '@/hooks/useAlerts';

const RadarMap = dynamic(() => import('@/components/radar/RadarMap'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video rounded-xl border border-white/10 bg-[#00060f] flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  ),
});

interface IntelligenceStripProps {
  data: IntelligenceData;
}

export default function IntelligenceStrip({ data }: IntelligenceStripProps) {
  const t = useTranslations('Intelligence');
  const locale = useLocale();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const tideTrendLabel = t(`values.${data.marine.tideTrend}`);
  const illumination = Math.round(data.lunar.illumination * 100);

  const cards = [
    { id: 'alerts', label: t('cards.alerts'), icon: ShieldAlert, color: data.alerts.level === 'none' ? 'text-white/45' : 'text-meteorix-orange', value: data.alerts.count > 0 ? t('values.activeAlerts', { count: data.alerts.count }) : t('values.noRisk') },
    { id: 'storms', label: t('cards.storms'), icon: Zap, color: data.storms.risk > 50 ? 'text-yellow-400' : 'text-white/45', value: t('values.stormRisk', { risk: data.storms.risk }) },
    { id: 'air', label: t('cards.air'), icon: Wind, color: 'text-meteorix-green', value: t('values.aqi', { aqi: data.air.aqi }) },
    { id: 'marine', label: t('cards.marine'), icon: Waves, color: 'text-blue-400', value: t('values.waveTrend', { wave: data.marine.waveHeight, trend: tideTrendLabel }) },
    { id: 'lunar', label: t('cards.lunar'), icon: Moon, color: 'text-indigo-300', value: t('values.moonLight', { illumination }) },
    ...(data.isSpain ? [{ id: 'aemet', label: t('cards.aemet'), icon: DatabaseZap, color: 'text-cyan-300', value: t('values.extraLayers') }] : []),
    ...(data.metEireann.isAvailable ? [{ id: 'metEireann', label: t('cards.metEireann'), icon: CloudSun, color: 'text-emerald-300', value: t('values.officialForecast') }] : []),
    { id: 'confidence', label: t('cards.confidence'), icon: CheckCircle2, color: 'text-meteorix-highlight', value: t('values.highConfidence', { score: data.confidence.score }) },
  ];

  return (
    <div className="w-full space-y-4 animate-fadein" style={{ animationDelay: '100ms' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {cards.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveCard(isActive ? null : card.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-meteorix-blue/20 border-meteorix-blue/60 shadow-[0_0_25px_rgba(26,61,77,0.2)]'
                  : 'meteorix-card hover:border-white/20'
              }`}
            >
              <card.icon className={`w-5 h-5 mb-3 ${card.color} ${isActive ? 'brightness-125' : ''}`} />
              <span className={`text-[8px] tracking-[0.2em] font-bold uppercase mb-1 ${isActive ? 'text-white/80' : 'text-white/60'}`}>{card.label}</span>
              <span className="text-[10px] font-bold font-orbitron tracking-widest text-white uppercase">{card.value}</span>
              <div className="mt-2">
                {isActive ? <ChevronUp size={10} className="text-meteorix-highlight" /> : <ChevronDown size={10} className="text-white/45" />}
              </div>
            </button>
          );
        })}
      </div>

      {activeCard && (
        <div className="bg-meteorix-card/60 border border-meteorix-border rounded-2xl p-6 backdrop-blur-xl animate-fadein border-t-meteorix-blue/30">
          {(data.loadStates.alerts || data.loadStates.marine || data.loadStates.weather) && activeCard === null && (
            <div className="flex items-center justify-center py-2">
               <div className="text-[8px] text-white/45 animate-pulse uppercase tracking-widest">{t('syncing')}</div>
            </div>
          )}

          {activeCard === 'alerts' && data.loadStates.alerts && (
             <div className="flex items-center justify-center py-8">
               <div className="w-4 h-4 border-2 border-meteorix-orange/30 border-t-meteorix-orange rounded-full animate-spin" />
             </div>
          )}

          {activeCard === 'alerts' && !data.loadStates.alerts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] tracking-widest text-meteorix-orange font-bold mb-4 uppercase">
                  {t('alertsTitle')}
                  {data.alerts.country && (
                    <span className="text-white/50 normal-case tracking-normal">
                      {' '}— {ALERTS_COUNTRY_NAMES[data.alerts.country]?.[locale === 'en' ? 'en' : 'es'] ?? data.alerts.country.toUpperCase()}
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {data.alerts.details.length > 0 ? data.alerts.details.map((detail, index) => (
                    <div key={index} className="text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-meteorix-orange animate-ping" />
                      {detail}
                    </div>
                  )) : <div className="text-xs text-white/50 italic">{t('noAlerts')}</div>}
                </div>
              </div>
            </div>
          )}

          {activeCard === 'storms' && data.loadStates.weather && (
             <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('analyzingConvection')}</div>
          )}

          {activeCard === 'storms' && !data.loadStates.weather && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <Metric label={t('metrics.cape')} value={`${data.storms.cape} J/kg`} color="text-yellow-500" />
              <Metric label={t('metrics.lifted')} value={data.storms.liftedIndex.toString()} color="text-yellow-500" />
              <Metric label={t('metrics.convective')} value={data.storms.rifts} />
              <Metric label={t('metrics.maxGusts')} value={`${Math.round(data.storms.maxGusts)} km/h`} />
            </div>
          )}

          {activeCard === 'air' && data.loadStates.weather && (
             <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('measuringParticles')}</div>
          )}

          {activeCard === 'air' && !data.loadStates.weather && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <Metric label={t('metrics.globalAqi')} value={data.air.aqi.toString()} color="text-meteorix-green" />
              <Metric label="PM10" value={`${data.air.pm10} ug/m3`} />
              <Metric label="PM2.5" value={`${data.air.pm25} ug/m3`} />
              <Metric label={t('metrics.quality')} value={data.air.status} />
            </div>
          )}

          {activeCard === 'marine' && data.loadStates.marine && (
             <div className="flex items-center justify-center py-8">
               <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
             </div>
          )}

          {activeCard === 'marine' && !data.loadStates.marine && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              <Metric label={t('metrics.waveHeight')} value={`${data.marine.waveHeight}m`} color="text-blue-400" />
              <Metric label={t('metrics.period')} value={`${data.marine.period}s`} />
              <Metric label={t('metrics.seaTemp')} value={`${data.marine.temp}C`} />
              <Metric label={t('metrics.tideLevel')} value={`${data.marine.seaLevel}m`} />
              <Metric label={t('metrics.trend')} value={tideTrendLabel} />
              <Metric
                label={t('metrics.nextTide')}
                value={data.marine.nextTide
                  ? `${t(`tides.${data.marine.nextTide.type}`)} ${new Date(data.marine.nextTide.time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`
                  : t('tides.noData')}
              />
              <div className="col-span-2 sm:col-span-3 md:col-span-6 text-[9px] leading-relaxed text-white/50 border-t border-white/5 pt-4">
                {t('tides.note', { source: data.marine.source })}
              </div>
            </div>
          )}

          {activeCard === 'lunar' && data.loadStates.weather && (
            <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('calculatingEphemeris')}</div>
          )}

          {activeCard === 'lunar' && !data.loadStates.weather && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              <Metric label={t('metrics.phase')} value={t(`lunarPhases.${data.lunar.phaseKey}`)} color="text-indigo-300" />
              <Metric label={t('metrics.illumination')} value={`${illumination}%`} />
              <Metric label={t('metrics.moonAge')} value={`${data.lunar.ageDays.toFixed(1)} d`} />
              <Metric label={t('metrics.fullMoon')} value={data.lunar.nextFullMoon} />
              <Metric label={t('metrics.newMoon')} value={data.lunar.nextNewMoon} />
            </div>
          )}

          {activeCard === 'aemet' && (data.loadStates.stations || data.loadStates.radar) && (
             <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('connectingAemet')}</div>
          )}

          {activeCard === 'aemet' && !(data.loadStates.stations || data.loadStates.radar) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] tracking-widest text-cyan-300 font-bold mb-4 uppercase">{t('aemet.title')}</h4>
                
                {data.aemet.nearestStation ? (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-4">
                    <div className="text-[8px] tracking-widest text-white/50 uppercase mb-2">{t('aemet.nearestStation')}</div>
                    <div className="text-sm font-bold text-white/90 mb-1">{data.aemet.nearestStation.ubi}</div>
                    <div className="flex gap-6 mt-3">
                      <div>
                        <div className="text-[8px] text-white/45 uppercase mb-1">{t('aemet.temperature')}</div>
                        <div className="text-sm font-bold font-orbitron text-cyan-300">{data.aemet.nearestStation.ta}ºC</div>
                      </div>
                      {data.aemet.nearestStation.vvm !== undefined && (
                        <div>
                          <div className="text-[8px] text-white/45 uppercase mb-1">{t('aemet.wind')}</div>
                          <div className="text-sm font-bold font-orbitron text-white/60">{Math.round(data.aemet.nearestStation.vvm * 3.6)} km/h</div>
                        </div>
                      )}
                      {data.aemet.nearestStation.prec !== undefined && (
                        <div>
                          <div className="text-[8px] text-white/45 uppercase mb-1">{t('aemet.rain')}</div>
                          <div className="text-sm font-bold font-orbitron text-meteorix-highlight">{data.aemet.nearestStation.prec} mm</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 text-[8px] text-white/45 uppercase">
                      {t('aemet.obs')} {new Date(data.aemet.nearestStation.fint).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-white/50 italic mb-4">{t('aemet.noStations')}</div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.aemet.capabilities.map((capability) => (
                    <div key={capability} className="text-[9px] text-white/65 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                      {t(`aemet.capabilities.${capability}`)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[10px] tracking-widest text-cyan-300 font-bold mb-4 uppercase">{t('aemet.radarTitle')}</h4>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <RadarMap />
                </div>
                {data.aemet.coastal && (
                  <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-4">
                    <div className="text-[8px] tracking-widest text-blue-400 uppercase mb-2">{t('aemet.marineTitle')}</div>
                    <div className="text-[10px] font-bold text-white/80 mb-2">{data.aemet.coastal.nombre}</div>
                    <p className="text-[9px] text-white/65 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                      {data.aemet.coastal.texto}
                    </p>
                  </div>
                )}
                <p className="text-[9px] text-white/50 leading-relaxed italic border-l-2 border-cyan-400/30 pl-3">{t('aemet.note')}</p>
              </div>
            </div>
          )}

          {activeCard === 'metEireann' && data.loadStates.metEireann && (
             <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('connectingMetEireann')}</div>
          )}

          {activeCard === 'metEireann' && !data.loadStates.metEireann && data.metEireann.isAvailable && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2 md:col-span-4">
                <h4 className="text-[10px] tracking-widest text-emerald-300 font-bold mb-2 uppercase">{t('metEireann.title')}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{t('metEireann.current')}</p>
              </div>
              <Metric label={t('metEireann.temp')} value={typeof data.metEireann.nextHour?.temp === 'number' ? `${data.metEireann.nextHour.temp}C` : t('tides.noData')} color="text-emerald-300" />
              <Metric label={t('metEireann.wind')} value={typeof data.metEireann.nextHour?.windSpeed === 'number' ? `${Math.round(data.metEireann.nextHour.windSpeed * 3.6)} km/h` : t('tides.noData')} />
              <Metric label={t('metEireann.rain')} value={typeof data.metEireann.nextHour?.precipitation === 'number' ? `${data.metEireann.nextHour.precipitation}mm` : t('tides.noData')} />
              <Metric label={t('metEireann.humidity')} value={typeof data.metEireann.nextHour?.humidity === 'number' ? `${data.metEireann.nextHour.humidity}%` : t('tides.noData')} />
              <Metric label={t('metEireann.pressure')} value={typeof data.metEireann.nextHour?.pressure === 'number' ? `${data.metEireann.nextHour.pressure} hPa` : t('tides.noData')} />
              <Metric label={t('metEireann.cloud')} value={typeof data.metEireann.nextHour?.cloudiness === 'number' ? `${data.metEireann.nextHour.cloudiness}%` : t('tides.noData')} />
              <Metric
                label={t('metEireann.updated')}
                value={data.metEireann.updated
                  ? new Date(data.metEireann.updated).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                  : t('tides.noData')}
              />
              <Metric label={t('confidence.source')} value={data.metEireann.source} />
            </div>
          )}

          {activeCard === 'confidence' && data.loadStates.weather && (
             <div className="flex items-center justify-center py-8 text-white/45 animate-pulse">{t('calculatingConsistency')}</div>
          )}

          {activeCard === 'confidence' && !data.loadStates.weather && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-[10px] tracking-widest text-meteorix-highlight font-bold mb-2 uppercase">{t('confidence.title')}</h4>
                  <p className="text-xs text-white/60 leading-relaxed">{t('confidence.body', { score: data.confidence.score })}</p>
                </div>
                <div className="bg-meteorix-blue/10 p-4 rounded-xl border border-meteorix-blue/20">
                  <div className="text-2xl font-black font-orbitron text-meteorix-highlight">{data.confidence.score}%</div>
                  <div className="text-[8px] tracking-widest text-white/50 text-center uppercase">{t('confidence.trustScore')}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex gap-8">
                <div className="text-[9px] font-bold text-white/60 uppercase">{t('confidence.source')}: <span className="text-white/70">{data.confidence.source}</span></div>
                <div className="text-[9px] font-bold text-white/60 uppercase">{t('confidence.consistency')}: <span className="text-white/70">{data.confidence.consistency}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color = 'text-white/80' }: { label: string; value: string; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[8px] tracking-widest text-white/50 uppercase">{label}</div>
      <div className={`text-lg font-bold font-orbitron uppercase ${color}`}>{value}</div>
    </div>
  );
}
