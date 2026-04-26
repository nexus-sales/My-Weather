import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PWSState {
  apiKey: string;
  selectedStationId: string | null;
  autoRefresh: boolean;
  refreshIntervalMin: number;
  favoriteStations: string[];

  setApiKey: (key: string) => void;
  setSelectedStation: (id: string | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (minutes: number) => void;
  addFavoriteStation: (id: string) => void;
  removeFavoriteStation: (id: string) => void;
}

export const usePWSStore = create<PWSState>()(
  persist(
    (set) => ({
      apiKey: '',
      selectedStationId: null,
      autoRefresh: false,
      refreshIntervalMin: 5,
      favoriteStations: [],

      setApiKey: (apiKey) => set({ apiKey }),
      setSelectedStation: (selectedStationId) => set({ selectedStationId }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshIntervalMin) => set({ refreshIntervalMin }),

      addFavoriteStation: (id) =>
        set((state) => ({
          favoriteStations: state.favoriteStations.includes(id)
            ? state.favoriteStations
            : [...state.favoriteStations, id].slice(0, 10),
        })),

      removeFavoriteStation: (id) =>
        set((state) => ({
          favoriteStations: state.favoriteStations.filter((s) => s !== id),
        })),
    }),
    {
      name: 'myweather-pws-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
