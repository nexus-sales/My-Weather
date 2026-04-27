export interface LunarData {
  phase: number;
  ageDays: number;
  illumination: number;
  phaseKey: string;
  nextNewMoon: string;
  nextFullMoon: string;
}

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 24 * 60 * 60 * 1000;

const phaseKeys = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
];

const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);

const nextPhaseDate = (date: Date, targetPhase: number) => {
  const elapsedDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS;
  const currentCycle = elapsedDays / SYNODIC_MONTH_DAYS;
  const targetCycle = Math.floor(currentCycle) + targetPhase;
  const normalizedTarget = targetCycle <= currentCycle ? targetCycle + 1 : targetCycle;

  return new Date(KNOWN_NEW_MOON_UTC + normalizedTarget * SYNODIC_MONTH_DAYS * DAY_MS);
};

export const getLunarData = (date = new Date(), locale = 'es'): LunarData => {
  const elapsedDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS;
  const phase = ((elapsedDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS / SYNODIC_MONTH_DAYS;
  const ageDays = phase * SYNODIC_MONTH_DAYS;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const phaseIndex = Math.round(phase * 8) % 8;

  return {
    phase,
    ageDays,
    illumination,
    phaseKey: phaseKeys[phaseIndex],
    nextNewMoon: formatDate(nextPhaseDate(date, 1), locale),
    nextFullMoon: formatDate(nextPhaseDate(date, 0.5), locale),
  };
};
