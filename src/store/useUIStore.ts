import { create } from 'zustand';

interface UIState {
  // Navigation
  activeTab: 'dashboard' | 'radar' | 'ai' | 'charts' | 'history' | 'stations';
  isSidebarOpen: boolean;
  
  // Radar
  radarLayer: 'radar' | 'satellite' | 'clouds' | 'temp' | 'wind';
  
  // Actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setRadarLayer: (layer: UIState['radarLayer']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  isSidebarOpen: false,
  radarLayer: 'radar',

  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setRadarLayer: (radarLayer) => set({ radarLayer }),
}));
