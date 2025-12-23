import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FloatingChatWrapper } from '@/components/chat/FloatingChatWrapper'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Spawnify - Track Mushroom Grows, Advance Science',
  description: 'Join thousands of growers documenting their cultivation journey. Your data helps power AI research and optimize growing conditions worldwide.',
  keywords: 'mushroom cultivation, grow tracking, mycology, mushroom growing, scientific research',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <FloatingChatWrapper />
      </body>
    </html>
  )
}

