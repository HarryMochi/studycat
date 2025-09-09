
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  metadataBase: new URL('https://studycat.tech'),
  title: {
    default: 'StudyCat: Your Curious AI Guide to Mastering Any Subject',
    template: `%s | StudyCat`,
  },
  description: 'Pounce on any topic with StudyCat! Generate personalized, step-by-step learning paths with an AI-powered course tailored just for you.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'StudyCat: AI-Powered Learning Paths',
    description: 'Instantly generate courses on any topic and learn at your own pace.',
    url: 'https://studycat.tech',
    siteName: 'StudyCat',
    images: [
      {
        url: 'https://studycat.tech/og-image.png', // It's a good practice to create a social sharing image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyCat: AI-Powered Learning Paths',
    description: 'Instantly generate courses on any topic and learn at your own pace.',
    images: ['https://studycat.tech/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="44c3a21a-d2ed-40c1-9f3b-15ba275cb562"
        ></script>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HP0G6MC9Q9"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HP0G6MC9Q9');
          `}
        </script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
