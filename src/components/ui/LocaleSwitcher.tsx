'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {useTransition} from 'react';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onLocaleChange(nextLocale: 'en' | 'es') {
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div className="flex gap-2 p-1 bg-meteorix-bg/50 border border-meteorix-border rounded-lg backdrop-blur-sm">
      <button
        onClick={() => onLocaleChange('es')}
        disabled={isPending}
        className={`px-3 py-1 text-[10px] font-bold tracking-widest transition-all rounded ${
          locale === 'es' 
            ? 'bg-meteorix-blue/20 text-meteorix-highlight border border-meteorix-blue/50 shadow-[0_0_10px_rgba(26,61,77,0.2)]'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        ESP
      </button>
      <button
        onClick={() => onLocaleChange('en')}
        disabled={isPending}
        className={`px-3 py-1 text-[10px] font-bold tracking-widest transition-all rounded ${
          locale === 'en' 
            ? 'bg-meteorix-blue/20 text-meteorix-highlight border border-meteorix-blue/50 shadow-[0_0_10px_rgba(26,61,77,0.2)]'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        ENG
      </button>
    </div>
  );
}
