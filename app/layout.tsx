import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Koleyka - Next.js + Prisma + NeonDB',
  description: 'Минимальный проект на Next.js с Prisma и NeonDB',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
