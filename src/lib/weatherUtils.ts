export const WMO_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: "Despejado", icon: "☀️" },
  1: { label: "Casi despejado", icon: "🌤️" },
  2: { label: "Parcialmente nublado", icon: "⛅" },
  3: { label: "Cubierto", icon: "☁️" },
  45: { label: "Niebla", icon: "🌫️" },
  48: { label: "Niebla escarchada", icon: "🌫️" },
  51: { label: "Llovizna débil", icon: "🌦️" },
  53: { label: "Llovizna moderada", icon: "🌦️" },
  55: { label: "Llovizna densa", icon: "🌧️" },
  61: { label: "Lluvia débil", icon: "🌧️" },
  63: { label: "Lluvia moderada", icon: "🌧️" },
  65: { label: "Lluvia intensa", icon: "🌧️" },
  71: { label: "Nevada débil", icon: "🌨️" },
  73: { label: "Nevada moderada", icon: "❄️" },
  75: { label: "Nevada intensa", icon: "❄️" },
  77: { label: "Granizo", icon: "🌨️" },
  80: { label: "Chubascos débiles", icon: "🌦️" },
  81: { label: "Chubascos moderados", icon: "🌧️" },
  82: { label: "Chubascos violentos", icon: "⛈️" },
  85: { label: "Nieve en chubascos", icon: "🌨️" },
  86: { label: "Nieve intensa", icon: "❄️" },
  95: { label: "Tormenta", icon: "⛈️" },
  96: { label: "Tormenta c/ granizo", icon: "⛈️" },
  99: { label: "Tormenta severa", icon: "🌪️" }
};

export const getWeatherCondition = (code: number) => {
  return WMO_MAP[code] || { label: "Variable", icon: "🌡️" };
};

export const getWindDirection = (degree: number) => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  return directions[Math.round(degree / 22.5) % 16];
};
