import BubbleBackground from '@/components/BubbleBackground'
import './globals.css'
import { Metadata } from 'next'
import ThemeSwitcher from '@/components/ThemeSwitcher'

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
    <html lang="en">
      <body className="font-sans">
        <ThemeSwitcher />
        <BubbleBackground />
        {children}
      </body>
    </html>
  )
}