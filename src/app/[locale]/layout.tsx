import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Outfit, Inter } from 'next/font/google';
import '../globals.css';
import { Metadata, Viewport } from 'next';
import QueryProvider from '@/providers/QueryProvider';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export const metadata: Metadata = {
  title: 'MyWeather',
  description: 'The most advanced weather app ever built with web technology. Created by Salvador Munoz Portillo.',
  applicationName: 'MyWeather',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MyWeather',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/meteorix-icon.svg',
    apple: '/icons/meteorix-maskable.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030b1a',
  colorScheme: 'dark',
};

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030b1a] text-[#c8e0f0]">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ServiceWorkerRegister />
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
