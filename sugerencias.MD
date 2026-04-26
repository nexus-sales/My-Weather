# Sugerencias para MyWeather

Archivo vivo para ir anotando, ordenar y priorizar ideas nuevas.

## Prioridad alta

- Indice de tormentas en tiempo real: integrar Blitzortung u otra fuente de rayos para mostrar actividad electrica en el mapa.
- Rosa de los vientos animada: componente visual que gire segun la direccion real del viento y muestre velocidad/rachas.
- Multi-ciudad y favoritos: guardar 5-10 ubicaciones en localStorage para cambiar rapidamente sin usar Supabase al principio.
- Alertas oficiales europeas: integrar Meteoalarm para avisos meteorologicos relevantes en Espana y Europa.
- Briefing diario inteligente: resumen tipo "lo importante de hoy" con riesgos, cambios respecto a ayer, mejor franja horaria y recomendacion practica.
- Alertas inteligentes personalizadas: lluvia cercana, viento fuerte, UV alto, bajada/subida brusca de temperatura, presion cayendo rapido.
- Indices Bio-Meteorologicos Avanzados: implementar WBGT (Wet Bulb Globe Temperature), Humidex y Wind Chill para una evaluacion real del estres termico y riesgos para la salud.

## Prioridad media

- Datos astronomicos ampliados: fase lunar, posicion solar, elevacion, azimut y calidad de seeing.
- Oleaje para ubicaciones costeras: usar Open-Meteo Marine para altura, periodo y direccion de olas.
- Calidad del aire: PM2.5, PM10, NO2, O3 y AQI con Open-Meteo Air Quality.
- PWA completa: manifest, service worker, instalacion movil y cache de ultimos datos.
- Trayectoria de sistemas: capa de presion/isobaras para lectura sinoptica visual.
- AEMET OpenData: avisos oficiales, estaciones cercanas y comparacion con Open-Meteo en Espana.
- Sistema de confianza del pronostico: indicar si la prevision es alta, media o baja segun estabilidad y acuerdo entre modelos.
- Nowcasting hiperlocal: mostrar la diferencia entre el modelo global ECMWF y el regional DWD ICON-D2 (resolucion 1km) para la siguiente hora. Feature unico que ningun servicio generalista expone.
- Niebla y visibilidad: Open-Meteo ya devuelve la variable `visibility` pero casi nadie la muestra bien. Indicador tipo "Visibilidad: 200 m — niebla densa" con icono y nivel de riesgo.
- Analisis de Anomalias Historicas: comparar datos actuales con medias climaticas de 30 anos (ERA5) para detectar desviaciones significativas ("Hoy hace +4°C mas de lo normal").
- Deteccion de Isla de Calor Urbana: comparar en tiempo real estaciones PWS del centro urbano vs periferia/aeropuerto para cuantificar el efecto termico de la ciudad.

## Prioridad baja / futuro

- Persistencia avanzada con Supabase: favoritos sincronizados, historial, preferencias y alertas guardadas.
- Exportacion de datos: CSV/JSON de series horarias, historicas y comparativas.
- Widget embebible: version compacta configurable para otras webs.
- Temas visuales: modo claro, alto contraste y modo daltonismo.

## Ideas diferenciales

- "Dia perfecto" scorer: puntuacion 0-100 para senderismo, playa, ciclismo, fotografia, astronomia y deporte.
- Astronomia fotografica: transparencia atmosferica, seeing y Bortle local para recomendar noches de fotografia.
- Resumen de voz: usar Web Speech API para leer el briefing meteorologico diario.
- Comparador de modelos: GFS vs ECMWF vs ICON para detectar divergencias y baja confianza.
- Modo Canarias: alisios, calima, inversion termica, cota de nubes, diferencias norte/sur, costa/medianias/cumbre.
- Calima y polvo sahariano: destacar PM10, visibilidad y riesgo respiratorio cuando aplique.
- Modo mar/costa: oleaje, viento costero, mareas, temperatura del mar e indice playa/surf/pesca.
- Perfiles de uso: casa, trabajo, playa, montana, huerto, fotografia, deporte y conduccion.
- Indice de conduccion: score 0-100 combinando lluvia + viento + visibilidad + temperatura de asfalto. AETHER puede calcularlo. Alta demanda practica y facil de implementar sobre datos ya disponibles.
- Compartir el tiempo: boton para generar una URL shareable tipo `/ciudad?fecha` o una imagen de resumen para compartir en redes sociales. Vector de viralidad y retencion de usuarios.
- Indices Sectoriales: FWI (Fire Weather Index) para riesgo de incendios, produccion fotovoltaica estimada e indices agricolas (GDD/horas frio).
- Modo Sinoptico Puro: vista simplificada de mapas de altura (500hPa, 850hPa) y chorro polar para analistas avanzados.

## 🏗️ Hoja de ruta: Migracion a Next.js (Modular)

Siguiendo el "Stack de produccion" definido en el README:

- [ ] **Fase 1: Estructura Base**
  - Inicializar proyecto Next.js (App Router) + TypeScript + Tailwind.
  - Configurar Layout global (Mission Control CSS tokens).
  - Implementar Store global con Zustand (Ubicacion, Preferencias).

- [ ] **Fase 2: Servicios y Fetching**
  - Migrar funciones de fetch a TanStack Query (Open-Meteo, Nominatim).
  - Crear Route Handlers para proxies (WU, Meteoalarm).
  - Tipado estricto de todas las respuestas de API.

- [ ] **Fase 3: Refactor de Componentes**
  - Extraer componentes de UI (Hero, Cards, Charts) del monolitico.
  - Implementar Dashboard principal modularizado.
  - Integrar Windy como componente cliente dedicado.

- [ ] **Fase 4: Nuevas Features (Post-migracion)**
  - Implementar Multi-ciudad y Favoritos.
  - Integrar AETHER con el nuevo sistema de estados.
  - Activar PWA y modo offline.

- Que fuente conviene para rayos en produccion y que limites tiene?
- Meteoalarm permite integracion estable via RSS/API para el alcance deseado?
- AETHER debe ser solo chat o tambien generar automaticamente un briefing diario? (Respuesta provisional: las dos, son capas distintas. Briefing automatico al cargar + chat bajo demanda + AETHER proactivo que interrumpe cuando detecta cambios bruscos — presion cayendo rapido, tormenta acercandose — sin que el usuario pregunte.)
- Conviene mantenerlo como artefacto JSX o migrarlo pronto a Vite + React modular?
- Que features deben funcionar sin API key para que la demo sea convincente?

## Ideas descartadas o aplazadas

- Backend obligatorio desde el inicio: aplazado. Mejor empezar con localStorage/PWA y pasar a backend cuando alertas/persistencia lo pidan.
- Exponer claves privadas en frontend: descartado para produccion; usar proxy/backend cuando haya APIs sensibles.

## Notas tecnicas

- El JSX monolitico puede volverse dificil de mantener. Si el proyecto crece, migrar a Vite + React con carpetas `components`, `hooks`, `services`, `utils` y `data`.
- `corsproxy.io` puede servir como demo, pero no deberia dependerse de el en produccion.
- Revisar la codificacion de los Markdown para mantenerlos en UTF-8 limpio.
