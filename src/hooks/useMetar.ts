import { useQuery } from '@tanstack/react-query';
import { fetchNearbyMetars } from '@/services/metarService';
import { useLocationStore } from '@/store/useLocationStore';

/**
 * Nearby airport METAR observations, nearest first.
 *
 * Global and key-free, so this is the station list that works outside AEMET's
 * Spain-only coverage. Routine reports are hourly, so refreshing faster than
 * that would only re-fetch the same observation.
 */
export const useNearbyMetars = () => {
  const { coords } = useLocationStore();

  return useQuery({
    queryKey: ['metar-nearby', coords.lat, coords.lon],
    queryFn: () => fetchNearbyMetars(coords.lat, coords.lon),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};
