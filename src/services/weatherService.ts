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
  source?: 'open-meteo' | 'owm' | 'tomorrow';
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

// ── Unit converters (from metric) ────────────────────────────────────────────

function toImperial(data: WeatherData): WeatherData {
  const c2f = (v: number) => parseFloat(((v * 9) / 5 + 32).toFixed(1));
  const kmh2mph = (v: number) => parseFloat((v * 0.621371).toFixed(1));
  const mm2in = (v: number) => parseFloat((v * 0.0393701).toFixed(2));
  const km2mi = (v: number) => parseFloat((v * 0.621371).toFixed(2));

  return {
    ...data,
    current: {
      ...data.current,
      temp: c2f(data.current.temp),
      feelsLike: c2f(data.current.feelsLike),
      windSpeed: kmh2mph(data.current.windSpeed),
      gusts: kmh2mph(data.current.gusts),
      precip: mm2in(data.current.precip),
      visibility: km2mi(data.current.visibility),
    },
    hourly: {
      ...data.hourly,
      temp: data.hourly.temp.map(c2f),
    },
    daily: {
      ...data.daily,
      tempMax: data.daily.tempMax.map(c2f),
      tempMin: data.daily.tempMin.map(c2f),
      precipSum: data.daily.precipSum.map(mm2in),
    },
  };
}

// ── WMO code mappers ─────────────────────────────────────────────────────────

function owmCodeToWmo(id: number): number {
  if (id >= 200 && id < 300) return 95;
  if (id >= 300 && id < 400) return 51;
  if (id >= 500 && id < 502) return 61;
  if (id >= 502 && id < 600) return 65;
  if (id >= 600 && id < 700) return 71;
  if (id >= 700 && id < 800) return 45;
  if (id === 800) return 0;
  if (id === 801) return 1;
  if (id === 802) return 2;
  return 3;
}

function tomorrowCodeToWmo(id: number): number {
  const map: Record<number, number> = {
    1000: 0, 1100: 1, 1101: 2, 1102: 3, 1001: 3,
    2000: 45, 2100: 45,
    4000: 51, 4001: 61, 4200: 61, 4201: 65,
    5000: 71, 5001: 73, 5100: 71, 5101: 75,
    6000: 56, 6001: 66, 6200: 66, 6201: 67,
    7000: 85, 7101: 86, 7102: 85,
    8000: 95,
  };
  return map[id] ?? 3;
}

// ── Provider fetchers ────────────────────────────────────────────────────────

async function fetchWeatherFromOpenMeteo(lat: number, lon: number, units: string): Promise<WeatherData> {
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
  if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);

  const data = await res.json();

  return {
    source: 'open-meteo',
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
      visibility: (data.current.visibility ?? 0) / 1000,
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
    },
  };
}

interface OWMCurrentResponse {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number; gust?: number };
  weather: [{ id: number }];
  clouds: { all: number };
  visibility?: number;
  rain?: { '1h'?: number };
}

interface OWMForecastEntry {
  dt: number;
  main: { temp: number };
  wind: { speed: number };
  weather: [{ id: number }];
  clouds: { all: number };
  pop: number;
  rain?: { '3h'?: number };
}

async function fetchWeatherFromOWM(lat: number, lon: number, units: string): Promise<WeatherData> {
  const base = `/api/owm?lat=${lat}&lon=${lon}`;
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${base}&type=weather`),
    fetch(`${base}&type=forecast`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error(`OWM responded ${currentRes.status}/${forecastRes.status}`);
  }

  const current: OWMCurrentResponse = await currentRes.json();
  const forecast: { list: OWMForecastEntry[]; city: { sunrise: number; sunset: number } } = await forecastRes.json();

  // OWM metric: wind in m/s → convert to km/h for consistency with Open-Meteo
  const msToKmh = (v: number) => parseFloat((v * 3.6).toFixed(1));

  const hourly = {
    time: forecast.list.map(e => new Date(e.dt * 1000).toISOString()),
    temp: forecast.list.map(e => e.main.temp),
    precipProb: forecast.list.map(e => Math.round(e.pop * 100)),
    cloudCover: forecast.list.map(e => e.clouds.all),
    weatherCode: forecast.list.map(e => owmCodeToWmo(e.weather[0].id)),
  };

  // Group 3-hour entries by calendar day
  const byDay = new Map<string, OWMForecastEntry[]>();
  for (const entry of forecast.list) {
    const day = new Date(entry.dt * 1000).toISOString().slice(0, 10);
    const bucket = byDay.get(day) ?? [];
    bucket.push(entry);
    byDay.set(day, bucket);
  }

  const days = [...byDay.keys()].sort().slice(0, 7);
  const todaySunrise = new Date(forecast.city.sunrise * 1000).toISOString();
  const todaySunset = new Date(forecast.city.sunset * 1000).toISOString();

  const daily = {
    time: days,
    tempMax: days.map(d => Math.max(...byDay.get(d)!.map(e => e.main.temp))),
    tempMin: days.map(d => Math.min(...byDay.get(d)!.map(e => e.main.temp))),
    weatherCode: days.map(d => {
      const entries = byDay.get(d)!;
      return owmCodeToWmo(entries[Math.floor(entries.length / 2)].weather[0].id);
    }),
    precipSum: days.map(d => byDay.get(d)!.reduce((s, e) => s + (e.rain?.['3h'] ?? 0), 0)),
    precipProb: days.map(d => Math.round(Math.max(...byDay.get(d)!.map(e => e.pop)) * 100)),
    sunrise: days.map((_, i) => (i === 0 ? todaySunrise : '')),
    sunset: days.map((_, i) => (i === 0 ? todaySunset : '')),
    uvMax: days.map(() => 0),
  };

  const result: WeatherData = {
    source: 'owm',
    current: {
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windSpeed: msToKmh(current.wind.speed),
      windDir: current.wind.deg,
      gusts: msToKmh(current.wind.gust ?? current.wind.speed),
      uvIndex: 0,
      precip: current.rain?.['1h'] ?? 0,
      visibility: (current.visibility ?? 0) / 1000,
      weatherCode: owmCodeToWmo(current.weather[0].id),
      cloudCover: current.clouds.all,
      time: new Date(current.dt * 1000).toISOString(),
    },
    hourly,
    daily,
  };

  return units !== 'metric' ? toImperial(result) : result;
}

interface TomorrowRealtimeResponse {
  data: {
    time: string;
    values: {
      temperature: number;
      temperatureApparent: number;
      humidity: number;
      windSpeed: number;
      windGust: number;
      windDirection: number;
      precipitationIntensity: number;
      uvIndex: number;
      visibility: number;
      cloudCover: number;
      pressureSurfaceLevel: number;
      weatherCode: number;
    };
  };
}

interface TomorrowHourlyEntry {
  time: string;
  values: {
    temperature: number;
    precipitationProbability: number;
    cloudCover: number;
    weatherCode: number;
  };
}

interface TomorrowDailyEntry {
  time: string;
  values: {
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    precipitationProbabilityMax: number;
    precipitationIntensityAvg: number;
    sunriseTime: string;
    sunsetTime: string;
    uvIndexMax: number;
  };
}

async function fetchWeatherFromTomorrow(lat: number, lon: number, units: string): Promise<WeatherData> {
  const base = `/api/tomorrow?lat=${lat}&lon=${lon}`;
  const [realtimeRes, hourlyRes, dailyRes] = await Promise.all([
    fetch(`${base}&type=realtime`),
    fetch(`${base}&type=forecast&timesteps=1h`),
    fetch(`${base}&type=forecast&timesteps=1d`),
  ]);

  if (!realtimeRes.ok || !hourlyRes.ok || !dailyRes.ok) {
    throw new Error(`Tomorrow.io responded ${realtimeRes.status}/${hourlyRes.status}/${dailyRes.status}`);
  }

  const rt: TomorrowRealtimeResponse = await realtimeRes.json();
  const hourlyData: { timelines: { hourly: TomorrowHourlyEntry[] } } = await hourlyRes.json();
  const dailyData: { timelines: { daily: TomorrowDailyEntry[] } } = await dailyRes.json();

  const v = rt.data.values;
  const hourlyList = hourlyData.timelines.hourly;
  const dailyList = dailyData.timelines.daily;

  // Tomorrow.io metric: wind already in km/h, temperature in °C
  const result: WeatherData = {
    source: 'tomorrow',
    current: {
      temp: v.temperature,
      feelsLike: v.temperatureApparent,
      humidity: v.humidity,
      pressure: v.pressureSurfaceLevel,
      windSpeed: v.windSpeed,
      windDir: v.windDirection,
      gusts: v.windGust,
      uvIndex: v.uvIndex,
      precip: v.precipitationIntensity,
      visibility: v.visibility,
      weatherCode: tomorrowCodeToWmo(v.weatherCode),
      cloudCover: v.cloudCover,
      time: rt.data.time,
    },
    hourly: {
      time: hourlyList.map(e => e.time),
      temp: hourlyList.map(e => e.values.temperature),
      precipProb: hourlyList.map(e => e.values.precipitationProbability),
      cloudCover: hourlyList.map(e => e.values.cloudCover),
      weatherCode: hourlyList.map(e => tomorrowCodeToWmo(e.values.weatherCode)),
    },
    daily: {
      time: dailyList.map(e => e.time.slice(0, 10)),
      tempMax: dailyList.map(e => e.values.temperatureMax),
      tempMin: dailyList.map(e => e.values.temperatureMin),
      weatherCode: dailyList.map(e => tomorrowCodeToWmo(e.values.weatherCode)),
      precipSum: dailyList.map(e => e.values.precipitationIntensityAvg * 24),
      precipProb: dailyList.map(e => e.values.precipitationProbabilityMax),
      sunrise: dailyList.map(e => e.values.sunriseTime),
      sunset: dailyList.map(e => e.values.sunsetTime),
      uvMax: dailyList.map(e => e.values.uvIndexMax),
    },
  };

  return units !== 'metric' ? toImperial(result) : result;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const fetchWeather = async (lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> => {
  try {
    return await fetchWeatherFromOpenMeteo(lat, lon, units);
  } catch (err) {
    console.warn('[weather] Open-Meteo failed, trying OWM:', (err as Error).message);
    try {
      return await fetchWeatherFromOWM(lat, lon, units);
    } catch (err2) {
      console.warn('[weather] OWM failed, trying Tomorrow.io:', (err2 as Error).message);
      return await fetchWeatherFromTomorrow(lat, lon, units);
    }
  }
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
