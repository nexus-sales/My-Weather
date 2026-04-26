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
    weatherCode: number;
    time: string;
  };
  hourly: {
    time: string[];
    temp: number[];
    precipProb: number[];
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
  url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index');
  url.searchParams.append('hourly', 'temperature_2m,precipitation_probability,weather_code');
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
      precip: data.current.precipitation,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time,
      temp: data.hourly.temperature_2m,
      precipProb: data.hourly.precipitation_probability,
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
