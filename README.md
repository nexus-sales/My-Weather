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
- **Hooks TanStack Query**: `useWeather` (10 min), `useWeatherHistory` (inmutable), `usePWSNearby` + `usePWSStation` (5 min), `useAlerts` (30 min).
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

### Fase 3 — Refactor de componentes (En progreso)

- `RadarView` con Windy embed y 5 capas seleccionables.
- `Forecast7Days`, `HourlyChart`, `SearchBar`, `LocaleSwitcher` extraidos.
- Base responsive para movil/tablet/desktop con navegacion inferior en pantallas pequenas.
- PWA inicial: `manifest`, iconos SVG, `theme-color` y service worker propio.
- Pendiente: modulos AETHER AI, Analisis, Historico y Estaciones PWS.

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

- **Open-Meteo** — condiciones actuales (ECMWF), prevision 7 dias, historico, calidad del aire, datos marinos, indices convectivos.
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
      aemet/       airquality/  dwd/      lightning/
      marine/      meteoalarm/  nws/      owm/
      tomorrow/    wu/
  components/
    radar/         # RadarView (Windy embed)
    ui/            # SearchBar, LocaleSwitcher
    weather/       # Forecast7Days, HourlyChart
  hooks/           # useWeather, useWeatherHistory, useGeolocation,
                   # usePWS, useAlerts
  i18n/            # configuracion next-intl
  lib/             # weatherUtils (codigos WMO)
  providers/       # QueryProvider (TanStack Query)
  services/        # weatherService, geoService
  store/           # useLocationStore, useUIStore, usePWSStore
```

## Roadmap

- [ ] Completar el dashboard modular (extraer hero card a componente).
- [ ] Modulo Analisis — 8 graficas profesionales con Recharts.
- [ ] Modulo Historico — ultimos 7 dias con estadisticas.
- [ ] Modulo Estaciones PWS — Netatmo embed + WU con clave + modo demo.
- [ ] AETHER AI — briefing diario automatico + chat interactivo con Claude.
- [ ] Multi-ciudad y favoritos — UI sobre `useLocationStore`.
- [ ] Alertas inteligentes — lluvia cercana, viento fuerte, UV alto, presion cayendo.
- [x] PWA base — manifest, iconos, theme color, service worker y cache inicial.
- [ ] PWA avanzada — instalacion guiada, pantalla offline propia, cache por estrategia y pruebas Lighthouse.
- [ ] Responsive avanzado — optimizar tablet/desktop con layouts especificos por modulo.
- [ ] Supabase — favoritos sincronizados, historial y alertas persistentes.

## Documentos del proyecto

- `Readme · MD` — documentacion larga del concepto y roadmap extendido.
- `sugerencias.MD` — lista viva de ideas y mejoras priorizadas.
- `Meteorix pro.jsx` — prototipo monolitico original (referencia de migracion).

## Creditos

Desarrollado por Salvador Munoz Portillo con apoyo de Claude (Anthropic).

Repositorio: `https://github.com/nexus-sales/My-Weather.git`
