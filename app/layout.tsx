import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '智能物流费用计算工具 - 多物流公司价格对比',
  description: '专业的物流费用计算工具，支持顺丰、申通、新亮物流价格对比，智能地址解析，移动端优化，帮助您快速找到最优惠的物流方案。',
  keywords: ['物流计算', '快递费用', '价格对比', '顺丰', '申通', '新亮物流', '地址解析', '移动端'],
  authors: [{ name: 'Logistics Calculator Team' }],
  creator: 'Logistics Calculator Team',
  publisher: 'Logistics Calculator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourusername.github.io/logistics-calculator'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '智能物流费用计算工具',
    description: '专业的物流费用计算工具，支持多物流公司价格对比，智能地址解析，移动端优化。',
    url: 'https://yourusername.github.io/logistics-calculator',
    siteName: '物流费用计算工具',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '智能物流费用计算工具',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '智能物流费用计算工具',
    description: '专业的物流费用计算工具，支持多物流公司价格对比。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="物流计算器" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}
