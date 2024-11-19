import BubbleBackground from '@/components/BubbleBackground'
import './globals.css'
import { Quicksand } from 'next/font/google'
import { Metadata } from 'next'

const quicksand = Quicksand({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Self Reflection',
  description: 'A calming space for daily reflection and mindfulness',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪞</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <BubbleBackground />
        {children}
      </body>
    </html>
  )
}