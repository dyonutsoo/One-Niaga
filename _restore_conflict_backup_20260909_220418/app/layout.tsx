import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OneNiaga — Seller Workspace & Inventory Sync Engine',
  description:
    'OneNiaga unifies Shopee, TikTok Shop, Lazada and your webstore into one seller workspace — AI listing generation, business analysis, and prioritised recommendations, plus a real-time multi-channel inventory sync and reservation engine for Southeast Asian sellers.',
};

export const viewport: Viewport = {
  themeColor: '#1B2A4A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
