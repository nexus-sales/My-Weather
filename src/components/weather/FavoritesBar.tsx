'use client';

import { Star, X, MapPin } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';

export default function FavoritesBar() {
  const { favorites, removeFavorite, setCoords, setCityName } = useLocationStore();

  if (favorites.length === 0) return null;

  return (
    <div className="flex items-center gap-3 w-full overflow-x-auto no-scrollbar pb-2 animate-fadein">
      <div className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] text-white/20 uppercase whitespace-nowrap">
        <Star size={10} className="text-meteorix-blue/40" />
        Favoritos:
      </div>
      
      {favorites.map((fav) => (
        <div key={fav.id} className="group flex items-center gap-1">
          <button
            onClick={() => {
              setCoords(fav.coords);
              setCityName(fav.name);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-meteorix-card border border-meteorix-border hover:border-meteorix-blue/30 hover:bg-meteorix-blue/5 transition-all whitespace-nowrap"
          >
            <MapPin size={8} className="text-meteorix-blue/50" />
            <span className="text-[10px] font-bold text-white/60 group-hover:text-meteorix-blue transition-colors">
              {fav.name.split(',')[0]}
            </span>
          </button>
          
          <button
            onClick={() => removeFavorite(fav.id)}
            className="p-1.5 rounded-full hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar de favoritos"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
