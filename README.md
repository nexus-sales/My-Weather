# MyWeather / METEORIX PRO

Aplicacion meteorologica avanzada construida con Next.js, datos en tiempo real, radar interactivo, graficas profesionales y una arquitectura preparada para IA meteorologica.

El proyecto nacio como prototipo monolitico en `Meteorix pro.jsx` y ahora esta migrando hacia una app modular de produccion con App Router, TypeScript y servicios separados.

## Estado actual

### Completado

- Base en **Next.js App Router**.
- **React 19** y **TypeScript**.
- **Tailwind CSS v4** para estilos globales.
- Internacionalizacion con **next-intl**.
- Estado global ligero con **Zustand**.
- Fetching/cache con **TanStack Query**.
- Servicios separados para Open-Meteo y Nominatim.
- Componentes iniciales para busqueda, forecast, grafica horaria, radar y cambio de idioma.

### En progreso

- Migracion del dashboard completo desde `Meteorix pro.jsx`.
- Modulos de radar, estaciones PWS, historico y analisis avanzado.
- AETHER AI como briefing y chat meteorologico.
- Alertas inteligentes y fuentes oficiales como AEMET/Meteoalarm.

## Stack

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Recharts**
- **Zustand** para estado global ligero
- **TanStack Query** para llamadas meteorologicas y cache
- **next-intl** para internacionalizacion
- **Supabase** mas adelante para favoritos, usuarios, historial y alertas persistentes
- **PWA** con `next-pwa` o configuracion propia

## Fuentes de datos previstas

- **Open-Meteo**: condiciones actuales, prevision, historico, calidad del aire y datos marinos.
- **OpenStreetMap Nominatim**: busqueda de ciudades y geocodificacion inversa.
- **Windy**: radar, satelite y capas meteorologicas.
- **Weather Underground / Netatmo**: estaciones personales PWS.
- **AEMET OpenData**: avisos y estaciones oficiales en Espana.
- **Meteoalarm**: alertas oficiales europeas.
- **Anthropic Claude**: IA AETHER para analisis meteorologico y briefing.

## Instalacion

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de produccion
npm run start    # servir build
npm run lint     # lint
```

## Estructura

```txt
src/
  app/[locale]/        # rutas localizadas
  components/          # UI, radar y componentes meteorologicos
  hooks/               # hooks de datos
  i18n/                # configuracion next-intl
  lib/                 # utilidades meteorologicas
  providers/           # providers globales
  services/            # APIs externas
  store/               # Zustand stores
```

## Documentos del proyecto

- `Readme · MD`: documentacion larga del concepto original y roadmap extendido.
- `sugerencias.MD`: lista viva de ideas y mejoras.
- `ideas.MD`: valoracion inicial y propuestas de producto.
- `Meteorix pro.jsx`: prototipo original monolitico.

## Roadmap corto

- Completar el dashboard modular.
- Integrar AETHER como briefing diario inteligente.
- Anadir favoritos multi-ciudad con `localStorage`.
- Anadir alertas inteligentes por lluvia, viento, UV y cambios bruscos.
- Integrar AEMET/Meteoalarm para avisos oficiales.
- Preparar PWA y cache offline.

## Creditos

Desarrollado por Salvador Munoz Portillo con apoyo de Claude y Codex.

Repositorio previsto: `https://github.com/nexus-sales/My-Weather.git`
