# MyWeather / METEORIX PRO

Aplicacion meteorologica avanzada construida con Next.js 16, datos en tiempo real, radar interactivo, graficas profesionales y arquitectura preparada para IA meteorologica.

El proyecto nacio como prototipo monolitico en `Meteorix pro.jsx` y esta migrando hacia una app modular de produccion con App Router, TypeScript y servicios separados.

## Estado actual

### Fase 1 — Estructura base (Completada)

- **Next.js 16 App Router** con React 19 y TypeScript estricto.
- **Tailwind CSS v4** con sistema de diseno "Mission Control" (tokens, fuentes Orbitron + Exo 2, animaciones).
- **Internacionalizacion** con `next-intl` (Espanol / Ingles).

### Fase 2 — Servicios y fetching (Completada)

- **Zustand stores**: `useLocationStore` (coords, favoritos, historial), `useUIStore` (tab activa, capa radar), `usePWSStore` (estaciones favoritas, seleccion, auto-refresh).
- **Servicios tipados**: `weatherService` (Open-Meteo ECMWF + historico 7 dias), `geoService` (Nominatim busqueda + geocodificacion inversa).
- **Hooks TanStack Query**: `useWeather` (10 min), `useWeatherHistory` (inmutable), `usePWSNearby` + `usePWSStation` (5 min), `useAlerts` (resuelve el pais desde las coordenadas y consulta Meteoalarm solo si esta cubierto — ES/DE/FR/IT/PT/NL/BE — cache 30 min).
- **Geolocalizacion automatica**: `useGeolocation` con `navigator.geolocation`, geocodificacion inversa y fallback a Madrid.
- **Route Handlers (proxies server-side)** — las API keys nunca llegan al cliente:

| Ruta | Servicio | Clave |
|------|----------|-------|
| `/api/aemet` | AEMET OpenData — avisos oficiales Espana | `AEMET_API_KEY` |
| `/api/meteoalarm` | Meteoalarm RSS — alertas europeas (7 paises) | Sin clave |
| `/api/airquality` | Open-Meteo Air Quality — PM2.5, PM10, NO2, O3, AQI, polenes | Sin clave |
| `/api/marine` | Open-Meteo Marine — oleaje, swell, temperatura del mar | Sin clave |
| `/api/dwd` | DWD ICON (icon\_d2 / icon\_eu / icon\_global) — nowcasting | Sin clave |
| `/api/nws` | NOAA NWS — forecast y alertas en territorio USA | Sin clave |
| `/api/lightning` | Indices convectivos CAPE/LI (Open-Meteo) + Blitzortung strikes | `BLITZORTUNG_TOKEN` (opcional) |
| `/api/wu` | Weather Underground — estaciones PWS cercanas | `WEATHER_UNDERGROUND_API_KEY` |
| `/api/tomorrow` | Tomorrow.io — FWI, polenes, condicion de conduccion | `TOMORROW_API_KEY` |
| `/api/owm` | OpenWeatherMap — segunda fuente GFS para comparacion de modelos | `OPENWEATHERMAP_API_KEY` |
| `/api/tiles/owm/[layer]/[z]/[x]/[y]` | Tiles de nubes/viento OWM para el radar Leaflet (whitelist de capa + coordenadas numericas) | `OPENWEATHERMAP_API_KEY` |
| `/api/eumetsat/wms` | EUMETSAT WMS — satelite MSG/MTG (whitelist de capa, token OAuth cacheado en servidor) | `EUMETSAT_CONSUMER_KEY` + `EUMETSAT_CONSUMER_SECRET` |
| `/api/met-eireann` | Met Éireann — forecast oficial para Irlanda | Sin clave |
| `/api/rainviewer` | RainViewer — metadata del ultimo frame de radar/satelite | Sin clave |
| `/api/ai` | AETHER AI — chat meteorologico via Anthropic Claude | `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL` opcional) |

### Fase 3 — Refactor de componentes (En progreso)

- `RadarView` con Windy embed y 5 capas seleccionables.
- `Forecast7Days`, `HourlyChart`, `SearchBar`, `LocaleSwitcher` extraidos.
- `DashboardView`, `CurrentWeatherCard` e `IntelligenceStrip` interactivo en dashboard para tiempo actual, avisos, tormentas, calidad del aire, mar y confianza.
- **Sensores de Telemetría Avanzada**: 8 widgets interactivos con animaciones (Viento, Sol, Lluvia, UV, Presión, Humedad, Visibilidad y Fase Lunar).
- Base responsive para movil/tablet/desktop con navegacion inferior en pantallas pequenas.
- PWA inicial: `manifest`, iconos SVG, `theme-color` y service worker propio.
- **AETHER AI**: chat interactivo (`AetherChat` + `/api/ai`) implementado end-to-end. El *Daily Briefing* es un scorecard heuristico local (deporte/ruta/foto/playa/jardin), no un resumen generado por el LLM.
- **Modulo Analisis** (`ChartsView`) y **Modulo Historico** (`HistoryView`) wireados y funcionales sobre datos reales; **Estaciones PWS** (`StationsView`) combina estaciones AEMET cercanas con Weather Underground — el embed Netatmo previsto en el roadmap original no esta implementado.
- Multi-ciudad y favoritos (`FavoritesBar` sobre `useLocationStore`) implementado.

### Fase 5 — Calidad y radar interactivo (Completada 2026-04-27)

#### Correcciones de estabilidad

- **HourlyChart**: eliminado warning de Recharts `width(-1)/height(-1)` cambiando `height="100%"` a `height={220}` en `ResponsiveContainer`. Con `height: 100%` sobre un contenedor cuyo alto se resuelve por `aspect-ratio` CSS, Recharts no podía medir el contenedor antes de renderizar.
- **AEMET radar 404 en cascada**: el cliente lanzaba 7 peticiones secuenciales probando rutas de radar; cada 404 aparecia en la consola del navegador. Se introdujo el sentinel `__radar_probe__` en `/api/aemet` para que el sondeo ocurra enteramente en el servidor: el cliente hace una sola peticion y recibe el resultado o `[]`.
- **Encoding ISO-8859-15**: todas las respuestas de AEMET (metadatos y datos) usaban `charset=ISO-8859-15`; llamar a `.json()` directamente las trataba como UTF-8 y los caracteres acentuados aparecian como `Bolet??n`. Se implemento `parseAemet()` que lee `ArrayBuffer` y lo decodifica con `TextDecoder` usando el charset del header `Content-Type`.
- **Radar AEMET — ruta correcta**: mediante pruebas directas a la API se determino que el endpoint funcional es `red/radar/nacional` (no `observacion/radar/2d/...`). La respuesta `datos` de este endpoint es un GIF de imagen, no JSON, por lo que se añadio deteccion de `Content-Type: image/*` para devolver `{ url: datosUrl }` en lugar de intentar parsear como JSON.
- **Prediccion maritima — mapeo de campos**: la respuesta de AEMET para prediccion costera anida el texto en `situacion.texto` y la validez en `situacion.fin`; el servicio devolvía el objeto crudo y `coastal.texto` era `undefined`. Se normalizo el mapeo en `fetchAemetCoastalForecast`.

#### Radar interactivo georeferenciado

- **`RadarMap` (Leaflet + AEMET overlay)**: nuevo componente en `src/components/radar/RadarMap.tsx`. Muestra un mapa interactivo Leaflet con tiles CartoDB Dark Matter como fondo y el GIF del radar nacional AEMET superpuesto como `ImageOverlay` georeferenciado sobre los bounds `[26°N, -19.5°W] → [44.5°N, 5°E]` (cubre Peninsula, Baleares y Canarias).
  - [x] Indice de conduccion: score 0-100 combinando lluvia + viento + visibilidad + temperatura de asfalto. (Implementado como lógica interna en los widgets).
  - `mix-blend-mode: screen` aplicado via `eventHandlers.load`: convierte el negro (areas sin cobertura) en transparente, dejando visibles unicamente los ecos de precipitacion.
  - Filtro `brightness(2) contrast(1.5) saturate(3)` para realzar los colores del radar sobre el fondo oscuro.
  - Altura fija de 300 px en el contenedor para que Leaflet resuelva correctamente su layout (el patron `aspect-video` + `height: 100%` no funciona con la inicializacion interna de Leaflet).
  - Circulo de localizacion del usuario (radio 5 km, cyan `#00d4ff`).
  - Importado con `dynamic(() => import(...), { ssr: false })` para evitar errores de SSR con la API del DOM de Leaflet.
- **`/api/rainviewer`**: proxy server-side que obtiene el path del ultimo frame de radar de `api.rainviewer.com/public/weather-maps.json` (revalida cada 5 min). Se mantiene como alternativa futura; actualmente el componente usa el GIF AEMET.
- **Dependencias nuevas**: `leaflet@1.9.4`, `react-leaflet@5.0.0`, `@types/leaflet`.

### Fase 6 — Auditoria tecnica y de seguridad (Completada 2026-07-12)

- **Limpieza**: eliminado `src/components/meteorix/` (10 archivos, ~960 lineas de UI paralela sin usar — confirmado con `grep` en todo el repo antes de borrar, no solo `src/`). Quitados los excludes de `tsconfig.json`/`eslint.config.mjs` que ya no apuntaban a nada.
- **Seguridad**: `/api/tiles/owm/[layer]/[z]/[x]/[y]` ahora valida `layer` contra una whitelist y `z/x/y` como numericos (mismo patron que `/api/aemet` y `/api/eumetsat/wms`) — antes reenviaba la clave de OpenWeatherMap para cualquier valor sin validar. `next` actualizado a `16.2.10` (cierra 8 CVEs conocidas, 1 de severidad alta) y `next-intl` parcheado via `npm audit fix`.
- **Alertas oficiales Meteoalarm conectadas**: `useAlerts` ya no depende de un pais fijo — resuelve el pais desde las coordenadas actuales (reverse geocoding, cache 6h) y solo consulta Meteoalarm si esta entre los 7 paises cubiertos (ES/DE/FR/IT/PT/NL/BE). Nuevo componente `OfficialAlerts` en el dashboard: no renderiza nada fuera de esos paises, muestra un aviso de "sin avisos" cuando no hay riesgo, y los 5 avisos mas severos (ordenados por severidad CAP) cuando los hay. Antes, la ruta `/api/meteoalarm` y el hook existian pero ningun componente los usaba.
- Pendiente: rate limiting compartido (store, no memoria local) sobre `/api/*` antes del primer despliegue publico con claves reales — no urgente mientras el proyecto siga sin desplegarse.

## Stack

- **Next.js 16 App Router** — SSR, Route Handlers como proxies
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Recharts** para graficas meteorologicas
- **Zustand** para estado global
- **TanStack Query v5** para fetching y cache declarativos
- **next-intl** para internacionalizacion
- **Supabase** — fase futura (favoritos, historial, alertas persistentes)
- **PWA nativa** sin dependencia externa inicial: `manifest.ts`, service worker y cache basica

## Fuentes de datos activas

- **Open-Meteo** — condiciones actuales (ECMWF), prevision 7 dias, historico, calidad del aire, datos marinos, indices convectivos y visibilidad.
- **OpenStreetMap Nominatim** — busqueda de ciudades y geocodificacion inversa.
- **Windy Embed** — radar, satelite y capas meteorologicas interactivas.
- **AEMET OpenData** — avisos y alertas oficiales en Espana.
- **Meteoalarm** — alertas meteorologicas europeas via RSS.
- **DWD ICON** — modelo aleman de alta resolucion para nowcasting.
- **NOAA NWS** — forecast oficial para ubicaciones en EE.UU.
- **Blitzortung** — rayos en tiempo real (requiere token de operador).

## Fuentes de datos pendientes de clave

- **Weather Underground** — red de estaciones personales PWS (requiere poseer una estacion).
- **Tomorrow.io** — indice de incendios, polenes, condicion de conduccion (clave gratuita).
- **OpenWeatherMap** — comparacion de modelos GFS vs ECMWF (clave gratuita).
- **Anthropic Claude** — IA AETHER para analisis sinoptico y briefing diario.

## Instalacion

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

Copiar `.env.local.example` a `.env.local` y rellenar las claves necesarias.

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de produccion
npm run start    # servir build
npm run lint     # lint
```

## Estructura

```
src/
  app/
    [locale]/      # rutas localizadas (layout + page)
    api/           # Route Handlers — proxies server-side
      aemet/       airquality/  ai/          dwd/
      eumetsat/    lightning/   marine/      met-eireann/
      meteoalarm/  nws/         owm/         rainviewer/
      tiles/owm/   tomorrow/    wu/
  components/
    ai/            # AetherChat (chat con Claude)
    briefing/      # DailyBriefing (scorecard heuristico)
    pwa/           # ServiceWorkerRegister
    radar/         # RadarView + RadarMap (Leaflet + overlay AEMET)
    ui/            # SearchBar, LocaleSwitcher, LocationPrompt, WeatherBackground
    weather/       # DashboardView, ChartsView, HistoryView, StationsView,
                   # OfficialAlerts, FavoritesBar, widgets/ (17 sensores)
  hooks/           # useWeather, useWeatherHistory, useGeolocation,
                   # usePWS, useAlerts, useIntelligence
  i18n/            # configuracion next-intl
  lib/             # weatherUtils (codigos WMO)
  providers/       # QueryProvider (TanStack Query)
  services/        # weatherService, geoService, aemetService, dwdService,
                   # marineService, metEireannService, astroService, aiService
  store/           # useLocationStore, useUIStore, usePWSStore
```

## Roadmap

- [ ] Completar el dashboard modular (extraer hero card a componente).
- [ ] Modulo Analisis — ampliar `ChartsView` a las 8 graficas profesionales previstas (hoy: 1 grafico combinado temp/nubes/precip).
- [x] Modulo Historico — `HistoryView`, ultimos 7 dias con estadisticas.
- [ ] Modulo Estaciones PWS — `StationsView` combina AEMET + Weather Underground; falta el embed Netatmo y el modo demo.
- [x] AETHER AI — chat interactivo con Claude (`AetherChat` + `/api/ai`). El briefing diario sigue siendo heuristico local, no generado por el LLM.
- [x] Multi-ciudad y favoritos — `FavoritesBar` sobre `useLocationStore`.
- [x] Alertas inteligentes personalizadas: lluvia cercana, viento fuerte, UV alto, bajada/subida brusca de temperatura, presion cayendo rapido (Integrado visualmente en los nuevos sensores).
- [x] Avisos oficiales Meteoalarm (ES/DE/FR/IT/PT/NL/BE) — `OfficialAlerts` en el dashboard, resuelve el pais desde las coordenadas.
- [x] PWA base — manifest, iconos, theme color, service worker y cache inicial.
- [x] **Meteorix Pro v5.0 Dashboard**: Rediseño completo del núcleo central, HUD dinámico y suite de 8 sensores de telemetría avanzada (Fase 4 completada con excelencia).
- [ ] Rate limiting compartido sobre `/api/*` — antes del primer despliegue publico con claves reales.
- [ ] PWA avanzada — instalacion guiada, pantalla offline propia, cache por tipo de dato y validacion Lighthouse.
- [ ] Responsive avanzado — optimizar tablet/desktop con layouts especificos por modulo.
- [ ] Supabase — favoritos sincronizados, historial y alertas persistentes.

## Documentos del proyecto

- `Readme · MD` — documentacion larga del concepto y roadmap extendido.
- `sugerencias.MD` — lista viva de ideas y mejoras priorizadas.
- `Meteorix pro.jsx` — prototipo monolitico original (referencia de migracion).

## Creditos

Desarrollado por Salvador Munoz Portillo con apoyo de Claude (Anthropic).

Repositorio: `https://github.com/nexus-sales/My-Weather.git`
