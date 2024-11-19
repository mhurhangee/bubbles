import BubbleBackground from '@/components/BubbleBackground'
import './globals.css'
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({ subsets: ['latin'] })

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