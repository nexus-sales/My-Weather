'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocationStore } from '@/store/useLocationStore';
import { getCityFromCoords } from '@/services/geoService';

export default function LocationPrompt() {
  const t = useTranslations('LocationPrompt');
  const [show, setShow] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { setCoords, setCityName } = useLocationStore();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Check if permission was already granted or denied
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'granted') {
          // Si ya hay permiso, actualizar coordenadas silenciosamente
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude: lat, longitude: lon } = pos.coords;
              setCoords({ lat, lon });
              const name = await getCityFromCoords(lat, lon);
              setCityName(name);
            },
            (err) => console.error('Error fetching granted location:', err)
          );
        } else if (status.state === 'prompt') {
          // If it's the first time, wait a bit and show our custom prompt
          timer = setTimeout(() => setShow(true), 1500);
        }
      });
    } else {
      // Fallback for browsers without permissions API
      const hasAsked = localStorage.getItem('nexus-location-asked');
      if (!hasAsked) {
        timer = setTimeout(() => setShow(true), 0);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [setCityName, setCoords]);

  const handleAllow = () => {
    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        const name = await getCityFromCoords(lat, lon);
        setCityName(name);
        localStorage.setItem('nexus-location-asked', 'true');
        setShow(false);
        setIsRequesting(false);
      },
      (err) => {
        console.error(err);
        localStorage.setItem('nexus-location-asked', 'true');
        setShow(false);
        setIsRequesting(false);
      }
    );
  };

  const handleIgnore = () => {
    localStorage.setItem('nexus-location-asked', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-8 bg-black/60 backdrop-blur-md animate-fadein">
      <div className="relative max-w-md w-full bg-meteorix-card border border-meteorix-blue/30 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_80px_rgba(26,61,77,0.15)] overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-meteorix-blue/10 blur-[60px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-meteorix-blue/20 text-meteorix-highlight shadow-[0_0_30px_rgba(26,61,77,0.2)] animate-bounce-subtle">
            <MapPin size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-orbitron tracking-widest text-white uppercase">
              {t('title')}
            </h2>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed font-exo2">
              {t('body')}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-4">
            {/* bg-[#A95025] instead of bg-meteorix-orange: at text-xs (12px) even font-black doesn't meet WCAG's bold-large-text exemption, so this button needs its own darker shade to hit 4.5:1 against text-aether-text (token's #D4652F only gets 3.27:1) */}
            <button
              onClick={handleAllow}
              disabled={isRequesting}
              className="w-full py-4 rounded-2xl bg-[#A95025] text-aether-text font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white hover:text-[#A95025] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(169,80,37,0.3)]"
            >
              {isRequesting ? (
                 <div className="w-4 h-4 border-2 border-aether-text/30 border-t-aether-text rounded-full animate-spin" />
              ) : (
                 <Navigation2 size={16} />
              )}
              {t('button')}
            </button>
            
            <button
              onClick={handleIgnore}
              className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10 hover:text-white/60"
            >
              {t('ignore')}
            </button>
          </div>
        </div>

        <button 
          onClick={handleIgnore}
          className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
