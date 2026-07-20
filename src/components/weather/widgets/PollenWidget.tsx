'use client';

import { Flower2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import WidgetWrapper from './WidgetWrapper';

interface PollenWidgetProps {
  alder: number;
  birch: number;
  grass: number;
  dataQuality?: 'observed' | 'estimated' | 'static';
  source?: string;
}

// Approximate grains/m³ bands used by several European pollen indices — not an
// official per-species threshold table, just a reasonable 4-tier read.
const LEVELS = [
  { max: 20, key: 'low', color: '#00ff88' },
  { max: 50, key: 'moderate', color: '#ffcc00' },
  { max: 200, key: 'high', color: '#ff8c35' },
  { max: Infinity, key: 'veryHigh', color: '#ff3e3e' },
];

const levelFor = (value: number) => LEVELS.find((l) => value <= l.max) ?? LEVELS[LEVELS.length - 1];

export default function PollenWidget({ alder, birch, grass, dataQuality, source }: PollenWidgetProps) {
  const t = useTranslations('Widgets');

  const species = [
    { key: 'alder', value: alder },
    { key: 'birch', value: birch },
    { key: 'grass', value: grass },
  ];

  const worst = species.reduce((max, s) => (s.value > max.value ? s : max), species[0]);
  const worstLevel = levelFor(worst.value);

  return (
    <WidgetWrapper
      title={t('pollen.title')}
      icon={<Flower2 size={14} style={{ color: worstLevel.color }} />}
      dataQuality={dataQuality}
      source={source}
    >
      <div className="w-full h-full flex flex-col justify-between p-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-outfit font-black text-white leading-none">
              {t(`pollen.${worst.key}`)}
            </span>
            <span className="text-[7px] font-inter text-xs text-white/60 uppercase tracking-widest mt-1">
              {t('pollen.highest')}
            </span>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ color: worstLevel.color, backgroundColor: worstLevel.color + '20' }}
          >
            {t(`pollen.${worstLevel.key}`)}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {species.map((s) => {
            const level = levelFor(s.value);
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-[9px] font-outfit text-white/65 uppercase w-16 shrink-0">{t(`pollen.${s.key}`)}</span>
                <div className="flex-1 h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (s.value / 200) * 100)}%`, backgroundColor: level.color }}
                  />
                </div>
                <span className="text-[9px] font-inter text-xs text-white/70 w-10 text-right shrink-0">
                  {Math.round(s.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetWrapper>
  );
}
