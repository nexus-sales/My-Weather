export interface DWDData {
  current: {
    temperature_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
  model: string;
  fallback?: boolean;
}

export const fetchDWDData = async (lat: number, lon: number, model: string = 'icon_eu'): Promise<DWDData> => {
  const res = await fetch(`/api/dwd?lat=${lat}&lon=${lon}&model=${model}`);
  if (!res.ok) throw new Error('Failed to fetch DWD data');
  return res.json();
};
