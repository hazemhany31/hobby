import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'HobbyGo — Rent Hobby Kits, Explore New Passions',
  description:
    'HobbyGo lets you rent professional hobby kits — photography, music, art, and more — delivered to your door. Try before you commit.',
  keywords: 'hobby kits, rent photography gear, music instruments rental, art supplies',
  openGraph: {
    title: 'HobbyGo — Rent Hobby Kits',
    description: 'Explore hobbies without the commitment. Rent premium kits today.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white text-textBase antialiased`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}

