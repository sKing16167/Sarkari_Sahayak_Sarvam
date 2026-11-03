import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sarkari Sahayak (सरकारी सहायक) — बोलकर जानें 26+ सरकारी योजनाएं',
  description:
    'Voice-first Indian Government Welfare Scheme Assistant across 8 Indic languages, powered by Sarvam AI (Saaras v3, Sarvam 105B, Mayura v1, Bulbul v3).',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'सरकारी सहायक',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F57C00',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${jakarta.variable} ${notoDevanagari.variable}`}>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1E1E1E] antialiased selection:bg-[#FFE0B2] selection:text-[#572800]">
        <div className="w-full min-h-screen relative flex flex-col civic-bg-pattern">
          {children}
        </div>
      </body>
    </html>
  );
}
