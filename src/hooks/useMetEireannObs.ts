import { useQuery } from '@tanstack/react-query';
import { fetchNearbyMetEireannObs } from '@/services/metEireannObsService';
import { isIrelandCoords } from '@/services/metEireannService';
import { useLocationStore } from '@/store/useLocationStore';

/**
 * Real Met Éireann station observations near the point.
 *
 * Gated to Ireland: the network only covers the island, and each call fans out
 * to one request per station, so there is no reason to fire it elsewhere.
 */
export const useNearbyMetEireannObs = () => {
  const { coords } = useLocationStore();
  const isIreland = isIrelandCoords(coords.lat, coords.lon);

  return useQuery({
    queryKey: ['met-eireann-obs', coords.lat, coords.lon],
    queryFn: () => fetchNearbyMetEireannObs(coords.lat, coords.lon),
    enabled: isIreland && !!coords.lat && !!coords.lon,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};
