import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

// Root SEO Engineering (FST Unit 6: Metadata API)
export const metadata: Metadata = {
  title: {
    default: 'FinDora',
    template: '%s | FinDora',
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('findora-theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#f9c8cf]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
