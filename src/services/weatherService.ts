export interface WeatherHistory {
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
    precipSum: number[];
    windMax: number[];
  };
}

export const fetchWeatherHistory = async (lat: number, lon: number): Promise<WeatherHistory> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lon.toString());
  url.searchParams.append('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max');
  url.searchParams.append('past_days', '7');
  url.searchParams.append('forecast_days', '0');
  url.searchParams.append('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch weather history');

  const data = await res.json();
  return {
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
      precipSum: data.daily.precipitation_sum,
      windMax: data.daily.wind_speed_10m_max,
    },
  };
};

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDir: number;
    gusts: number;
    uvIndex: number;
    precip: number;
    visibility: number;
    weatherCode: number;
    cloudCover: number;
    time: string;
  };
  hourly: {
    time: string[];
    temp: number[];
    precipProb: number[];
    cloudCover: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
    precipSum: number[];
    precipProb: number[];
    sunrise: string[];
    sunset: string[];
    uvMax: number[];
  };
}

export const fetchWeather = async (lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lon.toString());
  url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility,cloud_cover');
  url.searchParams.append('hourly', 'temperature_2m,precipitation_probability,weather_code,cloud_cover');
  url.searchParams.append('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max');
  url.searchParams.append('timezone', 'auto');
  
  if (units !== 'metric') {
    url.searchParams.append('temperature_unit', 'fahrenheit');
    url.searchParams.append('wind_speed_unit', 'mph');
    url.searchParams.append('precipitation_unit', 'inch');
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch weather data');
  
  const data = await res.json();
  
  return {
    current: {
      temp: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.pressure_msl,
      windSpeed: data.current.wind_speed_10m,
      windDir: data.current.wind_direction_10m,
      gusts: data.current.wind_gusts_10m,
      uvIndex: data.current.uv_index,
      precip: Math.max(data.current.precipitation || 0, data.current.rain || 0, data.current.showers || 0),
      visibility: data.current.visibility,
      weatherCode: data.current.weather_code,
      cloudCover: data.current.cloud_cover,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time,
      temp: data.hourly.temperature_2m,
      precipProb: data.hourly.precipitation_probability,
      cloudCover: data.hourly.cloud_cover,
      weatherCode: data.hourly.weather_code,
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
      precipSum: data.daily.precipitation_sum,
      precipProb: data.daily.precipitation_probability_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uvMax: data.daily.uv_index_max,
    }
  };
};

export async function fetchAirQuality(lat: number, lon: number) {
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lon.toString());
  url.searchParams.append('current', 'european_aqi,pm10,pm2_5,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen');
  url.searchParams.append('timezone', 'auto');

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      aqi: data.current.european_aqi,
      pm10: data.current.pm10,
      pm25: data.current.pm2_5,
      pollen: {
        alder: data.current.alder_pollen,
        birch: data.current.birch_pollen,
        grass: data.current.grass_pollen,
      }
    };
  } catch (error) {
    console.error('Air Quality API Error:', error);
    return null;
  }
}

export async function fetchHistoricalAnomaly(lat: number, lon: number) {
  const today = new Date();
  // We compare with the same day 30 years ago (climatological standard)
  const targetYear = today.getFullYear() - 30;
  const dateStr = `${targetYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lon.toString());
  url.searchParams.append('start_date', dateStr);
  url.searchParams.append('end_date', dateStr);
  url.searchParams.append('daily', 'temperature_2m_max');
  url.searchParams.append('timezone', 'auto');

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.daily.temperature_2m_max[0];
  } catch {
    return null;
  }
}
