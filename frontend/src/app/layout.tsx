import type { Metadata } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import 'swiper/css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// ブランド名「MISEKORE」専用フォント
// 丸みのある字形がアイコンの雰囲気と合うため Poppins を採用
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  // metadataBase を固定URLにすることで、環境変数未設定時でも正しく解決される
  metadataBase: new URL('https://www.misekore.com'),
  title: 'MISEKORE',
  description: '行く店、即答できる。',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
