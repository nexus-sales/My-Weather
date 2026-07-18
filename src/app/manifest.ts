import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Solajero',
    short_name: 'Solajero',
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
        src: '/icons/solajero-icon.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/solajero-icon.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
