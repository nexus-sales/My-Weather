import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Coords {
  lat: number;
  lon: number;
}

interface Favorite {
  id: string;
  name: string;
  coords: Coords;
}

interface LocationState {
  // Coordinates & City
  coords: Coords;
  cityName: string;
  
  // Preferences
  units: 'metric' | 'us' | 'uk' | 'ca';
  
  // Lists
  favorites: Favorite[];
  history: Favorite[];

  // Actions
  setCoords: (coords: Coords) => void;
  setCityName: (name: string) => void;
  setUnits: (units: LocationState['units']) => void;
  
  addFavorite: (city: Favorite) => void;
  removeFavorite: (id: string) => void;
  
  addToHistory: (city: Favorite) => void;
  clearHistory: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      // Defaults (Madrid)
      coords: { lat: 40.4165, lon: -3.7026 },
      cityName: 'Madrid, ES',
      units: 'metric',
      favorites: [],
      history: [],

      setCoords: (coords) => set({ coords }),
      setCityName: (cityName) => set({ cityName }),
      setUnits: (units) => set({ units }),

      addFavorite: (city) => 
        set((state) => ({
          favorites: state.favorites.some(f => f.id === city.id) 
            ? state.favorites 
            : [city, ...state.favorites].slice(0, 10)
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      addToHistory: (city) =>
        set((state) => ({
          history: [city, ...state.history.filter(h => h.id !== city.id)].slice(0, 5)
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'myweather-location-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
