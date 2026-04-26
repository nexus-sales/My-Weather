'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { searchCities, getCityFromCoords, CityResult } from '@/services/geoService';
import { useLocationStore } from '@/store/useLocationStore';
import { useTranslations } from 'next-intl';

export default function SearchBar() {
  const t = useTranslations('Index');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const { setCoords, setCityName, addToHistory } = useLocationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        try {
          const data = await searchCities(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    setCoords({ lat: city.lat, lon: city.lon });
    setCityName(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    addToHistory({ id: city.id, name: city.name, coords: { lat: city.lat, lon: city.lon } });
    setQuery('');
    setIsOpen(false);
  };

  const handleGeoLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        const name = await getCityFromCoords(lat, lon);
        setCityName(name);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ciudad..."
          className="w-full bg-[#001941]/60 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-sm font-exo2 focus:outline-none focus:border-meteorix-blue/40 transition-all placeholder:text-white/20"
        />
        {isLoading ? (
          <Loader2 className="absolute right-10 w-4 h-4 text-meteorix-blue/50 animate-spin" />
        ) : query && (
          <button onClick={() => setQuery('')} className="absolute right-10 hover:text-white transition-colors">
            <X className="w-4 h-4 text-white/30" />
          </button>
        )}
        <button 
          onClick={handleGeoLocation}
          className="absolute right-3 p-1 hover:bg-white/5 rounded-md transition-colors group"
          title="Usar mi ubicación"
        >
          <MapPin className="w-4 h-4 text-meteorix-blue/60 group-hover:text-meteorix-blue" />
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#040d22]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-fadein">
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-3 hover:bg-meteorix-blue/10 flex flex-col transition-colors border-b border-white/5 last:border-0"
            >
              <span className="text-sm font-bold text-white/90">{city.name}</span>
              <span className="text-[10px] text-white/40 tracking-wider uppercase">
                {city.state ? `${city.state}, ` : ''}{city.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
