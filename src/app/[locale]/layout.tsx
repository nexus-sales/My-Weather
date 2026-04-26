import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Orbitron, Exo_2 } from "next/font/google";
import "../globals.css";
import { Metadata } from 'next';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'MyWeather',
  description: 'The most advanced weather app ever built with web technology. Created by Salvador Muñoz Portillo.',
};

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} className={`${orbitron.variable} ${exo2.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030b1a] text-[#c8e0f0]">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
