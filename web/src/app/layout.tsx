import type { Metadata } from 'next';
import './globals.css';

// Root SEO Engineering (FST Unit 6: Metadata API)
export const metadata: Metadata = {
  title: {
    default: 'FinDora — DJSCE Campus Lost & Found',
    template: '%s | FinDora DJSCE',
  },
  description:
    'Dwarkadas J. Sanghvi College of Engineering official lost and found portal. Report items, track claims, and match belongings with Gemini AI.',
  keywords: ['DJSCE', 'Lost and Found', 'Campus Portal', 'Next.js App Router', 'FinDora'],
  authors: [{ name: 'DJSCE ADF & FST Engineering Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#f9c8cf]">
        {children}
      </body>
    </html>
  );
}
