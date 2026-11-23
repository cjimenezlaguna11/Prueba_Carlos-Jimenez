import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { appearanceBootstrap } from '@/lib/appearance'
import './globals.css'

const inter = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--inter',
  weight: '100 900',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Catalogo dimostrativo | Giunti Psychometrics Italia',
  description: 'Esplora il catalogo dimostrativo di strumenti di assessment e corsi per professionisti della psicologia.',
  icons: { icon: '/giunti-psychometrics.png' },
  robots: { index: false, follow: false }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: appearanceBootstrap }} /></head>
      <body>
        <a className="skip-link" href="#contenuto">Vai al contenuto</a>
        {children}
      </body>
    </html>
  )
}
