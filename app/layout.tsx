import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스케줄링 · 스트리머 캘린더',
  description: '치지직 스트리머의 방송 일정을 구독하고 내 캘린더에서 확인하세요',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '스케줄링',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: '스케줄링 · 스트리머 캘린더',
    description: '치지직 스트리머의 방송 일정을 구독하고 내 캘린더에서 확인하세요',
  },
}

export const viewport: Viewport = {
  themeColor: '#2a3556',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'Cafe24Surround', sans-serif" }}
      >
        {children}
      </body>
    </html>
  )
}
