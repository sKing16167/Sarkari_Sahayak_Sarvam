import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarkari Sahayak (सरकारी सहायक) — Voice Scheme Assistant',
  description: 'Voice-first government welfare scheme assistant powered by Sarvam AI for multilingual Indian citizens.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] antialiased flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#FAF8F5] relative flex flex-col shadow-lg border-x border-[#EADCC9]/50">
          {children}
        </div>
      </body>
    </html>
  );
}
