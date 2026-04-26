import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyWeather / METEORIX PRO',
    short_name: 'MyWeather',
    description: 'Centro meteorologico personal con datos en tiempo real, radar, alertas e IA.',
    start_url: '/es',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#030b1a',
    theme_color: '#030b1a',
    categories: ['weather', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/meteorix-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/meteorix-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
