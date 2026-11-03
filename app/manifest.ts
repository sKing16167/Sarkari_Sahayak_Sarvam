import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'सरकारी सहायक (Sarkari Sahayak) — Sarvam AI Welfare Assistant',
    short_name: 'सरकारी सहायक',
    description:
      'Voice-first Indian government welfare scheme assistant powered by Sarvam AI (Saaras v3, Sarvam 105B, Mayura v1, Bulbul v3).',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#F57C00',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
