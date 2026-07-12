import { useQuery } from '@tanstack/react-query';

export interface SpaceWeatherData {
  kpIndex: number | null;
  kpTime: string | null;
  flareClass: string | null;
  flareTime: string | null;
  auroraProbability: number | null;
  auroraTime: string | null;
}

const fetchSpaceWeather = async (lat: number, lon: number): Promise<SpaceWeatherData> => {
  const res = await fetch(`/api/spaceweather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch space weather');
  return res.json();
};

/** Real NOAA SWPC planetary Kp-index, latest X-ray flare class, and aurora probability at these coordinates. */
export const useSpaceWeather = (lat: number, lon: number) => {
  return useQuery({
    queryKey: ['space-weather', Math.round(lat), Math.round(lon)],
    queryFn: () => fetchSpaceWeather(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};
