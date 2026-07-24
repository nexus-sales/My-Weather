type WeatherCondition = {
  label: {
    es: string;
    en: string;
  };
  icon: string;
};

export const WMO_MAP: Record<number, WeatherCondition> = {
  0: { label: { es: 'Despejado', en: 'Clear sky' }, icon: '☀️' },
  1: { label: { es: 'Casi despejado', en: 'Mainly clear' }, icon: '🌤️' },
  2: { label: { es: 'Parcialmente nublado', en: 'Partly cloudy' }, icon: '⛅' },
  3: { label: { es: 'Cubierto', en: 'Overcast' }, icon: '☁️' },
  45: { label: { es: 'Niebla', en: 'Fog' }, icon: '🌫️' },
  48: { label: { es: 'Niebla escarchada', en: 'Depositing rime fog' }, icon: '🌫️' },
  51: { label: { es: 'Llovizna debil', en: 'Light drizzle' }, icon: '🌦️' },
  53: { label: { es: 'Llovizna moderada', en: 'Moderate drizzle' }, icon: '🌦️' },
  55: { label: { es: 'Llovizna densa', en: 'Dense drizzle' }, icon: '🌧️' },
  61: { label: { es: 'Lluvia debil', en: 'Slight rain' }, icon: '🌧️' },
  63: { label: { es: 'Lluvia moderada', en: 'Moderate rain' }, icon: '🌧️' },
  65: { label: { es: 'Lluvia intensa', en: 'Heavy rain' }, icon: '🌧️' },
  71: { label: { es: 'Nevada debil', en: 'Slight snow' }, icon: '🌨️' },
  73: { label: { es: 'Nevada moderada', en: 'Moderate snow' }, icon: '❄️' },
  75: { label: { es: 'Nevada intensa', en: 'Heavy snow' }, icon: '❄️' },
  77: { label: { es: 'Granizo', en: 'Snow grains' }, icon: '🌨️' },
  80: { label: { es: 'Chubascos debiles', en: 'Slight rain showers' }, icon: '🌦️' },
  81: { label: { es: 'Chubascos moderados', en: 'Moderate rain showers' }, icon: '🌧️' },
  82: { label: { es: 'Chubascos violentos', en: 'Violent rain showers' }, icon: '⛈️' },
  85: { label: { es: 'Nieve en chubascos', en: 'Snow showers' }, icon: '🌨️' },
  86: { label: { es: 'Nieve intensa', en: 'Heavy snow showers' }, icon: '❄️' },
  95: { label: { es: 'Tormenta', en: 'Thunderstorm' }, icon: '⛈️' },
  96: { label: { es: 'Tormenta con granizo', en: 'Thunderstorm with hail' }, icon: '⛈️' },
  99: { label: { es: 'Tormenta severa', en: 'Severe thunderstorm' }, icon: '🌪️' },
};

export const getWeatherCondition = (code: number, locale = 'es') => {
  const condition = WMO_MAP[code] ?? {
    label: { es: 'Variable', en: 'Variable' },
    icon: '🌡️',
  };

  return {
    label: locale === 'en' ? condition.label.en : condition.label.es,
    icon: condition.icon,
  };
};

export const getWindDirection = (degree: number) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  return directions[Math.round(degree / 22.5) % 16];
};

// Great-circle distance in km. Single source of truth: the "nearest station"
// pick used to compare raw lat/lon deltas with Pythagoras, which silently
// over-weights longitude away from the equator (at 28°N a degree of longitude
// is ~98 km against ~111 km for latitude), so it could rank a further station
// as the closer one.
export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Magnus formula. Single source of truth — DewPointWidget and HumidityWidget
// used to each compute this independently with different formulas and
// disagreed by several degrees for the same reading.
export const calculateDewPoint = (temp: number, humidity: number) => {
  const a = 17.27;
  const b = 237.7;
  // Math.log(0) = -Infinity would propagate to NaN — clamp to a valid range first.
  const safeHumidity = Math.max(1, Math.min(100, humidity));
  const alpha = ((a * temp) / (b + temp)) + Math.log(safeHumidity / 100);
  return (b * alpha) / (a - alpha);
};
