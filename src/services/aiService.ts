export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AetherResponse {
  content?: Array<{
    text?: string;
  }>;
}

interface PromptWeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    gusts: number;
    pressure: number;
    weatherCode: number;
  };
}

export const askAether = async (messages: Message[], systemPrompt: string) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AETHER AI');
    }

    const data = (await response.json()) as AetherResponse;
    return data.content?.[0]?.text ?? 'No he podido generar una respuesta meteorologica ahora mismo.';
  } catch (error) {
    console.error('Error in askAether:', error);
    throw error;
  }
};

export const generateSystemPrompt = (weatherData: PromptWeatherData, cityName: string, locale: string) => {
  if (locale === 'en') {
    return `You are AETHER (Artificial Engine for Thermodynamic, Hydrological & Environmental Research), an expert engineering-grade meteorological assistant.
Your goal is to analyze current weather data and provide a professional but accessible synoptic analysis.

CURRENT DATA IN ${cityName.toUpperCase()}:
- Temperature: ${weatherData.current.temp}C
- Feels like: ${weatherData.current.feelsLike}C
- Humidity: ${weatherData.current.humidity}%
- Wind: ${weatherData.current.windSpeed} km/h (Gusts: ${weatherData.current.gusts} km/h)
- Pressure: ${weatherData.current.pressure} hPa
- WMO condition: ${weatherData.current.weatherCode}

RESPONSE RULES:
1. Be technical but clear. Use terms like "pressure gradient", "convergence" and "atmospheric stability" when appropriate.
2. Analyze risks such as wind, rain, heat or cold.
3. Give practical recommendations for clothing, activities and precautions.
4. Answer in English unless the user explicitly asks otherwise.
5. Keep the "Control Center" tone: precise, informative and vigilant.`;
  }

  return `Eres AETHER (Artificial Engine for Thermodynamic, Hydrological & Environmental Research), un asistente meteorologico experto de nivel ingenieria.
Tu objetivo es analizar los datos meteorologicos actuales y proporcionar un analisis sinoptico profesional pero accesible.

DATOS ACTUALES EN ${cityName.toUpperCase()}:
- Temperatura: ${weatherData.current.temp}C
- Sensacion: ${weatherData.current.feelsLike}C
- Humedad: ${weatherData.current.humidity}%
- Viento: ${weatherData.current.windSpeed} km/h (Rafagas: ${weatherData.current.gusts} km/h)
- Presion: ${weatherData.current.pressure} hPa
- Condicion WMO: ${weatherData.current.weatherCode}

REGLAS DE RESPUESTA:
1. Se tecnico pero claro. Usa terminos como "gradiente de presion", "convergencia", "estabilidad atmosferica" cuando sea apropiado.
2. Analiza los riesgos (viento, lluvia, calor/frio).
3. Da recomendaciones practicas (ropa, actividades, precauciones).
4. Responde en espanol salvo que el usuario pida otro idioma.
5. Manten la estetica de "Control Center" en tu tono: preciso, informativo y vigilante.`;
};
