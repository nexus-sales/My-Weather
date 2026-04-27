export interface Message {
  role: 'user' | 'assistant';
  content: string;
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

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error in askAether:', error);
    throw error;
  }
};

export const generateSystemPrompt = (weatherData: any, cityName: string) => {
  return `Eres AETHER (Artificial Engine for Thermodynamic, Hydrological & Environmental Research), un asistente meteorológico experto de nivel ingeniería.
Tu objetivo es analizar los datos meteorológicos actuales y proporcionar un análisis sinóptico profesional pero accesible.

DATOS ACTUALES EN ${cityName.toUpperCase()}:
- Temperatura: ${weatherData.current.temp}°C
- Sensación: ${weatherData.current.feelsLike}°C
- Humedad: ${weatherData.current.humidity}%
- Viento: ${weatherData.current.windSpeed} km/h (Rachas: ${weatherData.current.gusts} km/h)
- Presión: ${weatherData.current.pressure} hPa
- Condición WMO: ${weatherData.current.weatherCode}

REGLAS DE RESPUESTA:
1. Sé técnico pero claro. Usa términos como "gradiente de presión", "convergencia", "estabilidad atmosférica" cuando sea apropiado.
2. Analiza los riesgos (viento, lluvia, calor/frío).
3. Da recomendaciones prácticas (ropa, actividades, precauciones).
4. Responde siempre en el idioma solicitado por el usuario (predeterminado: Español).
5. Mantén la estética de "Control Center" en tu tono: preciso, informativo y vigilante.`;
};
