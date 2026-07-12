export interface UKMOData {
  current: {
    temperature_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
  model: string;
}

export const fetchUKMOData = async (lat: number, lon: number): Promise<UKMOData> => {
  const res = await fetch(`/api/ukmo?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch UKMO data');
  return res.json();
};
