'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ALERTS_COUNTRY_NAMES, useAlerts } from '@/hooks/useAlerts';
import { useLocationStore } from '@/store/useLocationStore';

const SEVERITY_RANK: Record<string, number> = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };

// Same neon hex scale UVWidget already uses for its risk levels — kept consistent
// with the rest of the app instead of introducing a fourth ad-hoc palette. Inline
// hex (not Tailwind classes) because `meteorix-*` utilities aren't registered in
// the theme and silently render as nothing — see globals.css.
const SEVERITY_STYLE: Record<string, { color: string; glow: string }> = {
  Extreme: { color: '#ff3e3e', glow: 'rgba(255, 62, 62, 0.12)' },
  Severe: { color: '#ff8c35', glow: 'rgba(255, 140, 53, 0.12)' },
  Moderate: { color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.12)' },
  Minor: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.12)' },
};

const DEFAULT_STYLE = { color: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.1)' };

export default function OfficialAlerts() {
  const t = useTranslations('Alerts');
  const locale = useLocale();
  const { coords } = useLocationStore();
  const { data: alerts, isLoading, country } = useAlerts(coords.lat, coords.lon);
  const [isExpanded, setIsExpanded] = useState(true);

  // Not loaded yet, or the current location isn't in a Meteoalarm-covered country.
  if (isLoading || !alerts || !country) return null;

  const countryName = ALERTS_COUNTRY_NAMES[country]?.[locale === 'en' ? 'en' : 'es'] ?? country.toUpperCase();

  const sorted = [...alerts].sort(
    (a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)
  );
  const topAlerts = sorted.slice(0, 5);
  const remaining = alerts.length - topAlerts.length;

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 animate-fadein">
        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
        <span className="text-sm text-emerald-300 font-medium">{t('none', { country: countryName })}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 animate-fadein">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border shrink-0" style={{ backgroundColor: 'rgba(255, 140, 53, 0.12)', borderColor: 'rgba(255, 140, 53, 0.3)' }}>
          <ShieldAlert size={16} style={{ color: '#ff8c35' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">{t('eyebrow')}</div>
          <h3 className="text-base font-bold text-white/90">
            {t('title', { count: alerts.length, country: countryName })}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-white/50 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-white/50 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <>
          <div className="space-y-2 mt-4">
            {topAlerts.map((alert) => {
              const style = SEVERITY_STYLE[alert.severity] ?? DEFAULT_STYLE;
              return (
                <div
                  key={alert.id}
                  className="flex flex-col gap-1 px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: style.glow, borderColor: style.color + '40' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold" style={{ color: style.color }}>
                      {alert.event || alert.title}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest shrink-0 px-2 py-0.5 rounded"
                      style={{ color: style.color, backgroundColor: style.color + '20' }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  {alert.area && <span className="text-xs text-white/65">{alert.area}</span>}
                </div>
              );
            })}
          </div>

          {remaining > 0 && (
            <a
              href={`https://meteoalarm.org?region=${country.toUpperCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[11px] text-white/60 hover:text-[#ff8c35] uppercase tracking-widest underline decoration-dotted underline-offset-4 transition-colors"
            >
              {t('more', { count: remaining })}
            </a>
          )}
        </>
      )}
    </div>
  );
}
