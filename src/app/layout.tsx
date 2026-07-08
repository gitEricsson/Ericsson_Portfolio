import type { Metadata, Viewport } from 'next';
import { Archivo, Fragment_Mono, EB_Garamond } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/shell/AppShell';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
});

const fragment = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-fragment',
  display: 'swap',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ericsson Raphael : Software & Data Engineer',
  description:
    'Software and data engineer. Distributed systems, data pipelines, web3. Also: philosophy, film photography, music in every genre. Black and white, by choice.',
  keywords: [
    'Ericsson Raphael',
    'software engineer',
    'data engineer',
    'backend engineer',
    'Moniepoint',
    'Lagos',
    'web scraping',
    'web3',
  ],
  openGraph: {
    title: 'Ericsson Raphael : Signal / Noise',
    description: 'A monochrome data installation that happens to be a resume.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#111114',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fragment.variable} ${garamond.variable}`}
    >
      <body className="bg-black font-sans text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
