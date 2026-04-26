'use client';

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/store/useLocationStore';
import { getCityFromCoords } from '@/services/geoService';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  supported: boolean;
}

export function useGeolocation(): GeolocationState {
  const { setCoords, setCityName } = useLocationStore();
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    supported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  useEffect(() => {
    if (!state.supported) return;

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        setCoords({ lat, lon });
        try {
          const cityName = await getCityFromCoords(lat, lon);
          setCityName(cityName);
        } catch {
          setCityName(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
        setState((s) => ({ ...s, loading: false, error: null }));
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: err.message }));
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
