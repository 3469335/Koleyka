import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Koleyka - Next.js + Prisma + NeonDB',
  description: 'Минимальный проект на Next.js с Prisma и NeonDB',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#667eea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#667eea" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body suppressHydrationWarning style={{ 
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        WebkitTapHighlightColor: 'transparent',
      }}>
        {children}
      </body>
    </html>
  )
}
