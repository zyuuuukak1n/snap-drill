import type { Metadata, Viewport } from 'next';
import './globals.css';

const APP_NAME = 'スナップドリル (SnapDrill)';
const APP_DESCRIPTION = '小学生向けテスト復習・手書き学習Webアプリ。採点済みプリントの写真を撮るだけでGeminiが自動問題化！Chromebook上で手書き反復練習ができます。';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://snap-drill.zyuuuukak1n.dev';

export const metadata: Metadata = {
  title: {
    default: 'スナップドリル - 小学生向けテスト復習・手書き学習アプリ',
    template: '%s | スナップドリル',
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: 'じゅーかきん', url: 'https://zyuuuukak1n.dev' }],
  keywords: [
    '小学生',
    'テスト復習',
    '手書き学習',
    'Chromebook',
    'PWA',
    'プリント採点',
    'Gemini Vision',
    '漢字練習',
    '算数ドリル',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: APP_URL,
    title: 'スナップドリル - 小学生向けテスト復習・手書き学習アプリ',
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: `${APP_URL}/ogp.png`,
        width: 1200,
        height: 630,
        alt: 'スナップドリル (SnapDrill)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スナップドリル - 小学生向けテスト復習・手書き学習アプリ',
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/ogp.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: '#FF9800',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FFFDF7] antialiased">
        {children}
        {/* Register Service Worker for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.debug('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

