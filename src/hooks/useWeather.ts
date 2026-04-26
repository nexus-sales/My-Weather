import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/services/weatherService';
import { useLocationStore } from '@/store/useLocationStore';

export const useWeather = () => {
  const { coords, units } = useLocationStore();

  return useQuery({
    queryKey: ['weather', coords.lat, coords.lon, units],
    queryFn: () => fetchWeather(coords.lat, coords.lon, units),
    enabled: !!coords.lat && !!coords.lon,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};
