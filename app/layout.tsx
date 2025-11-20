import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'shootingwala',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

