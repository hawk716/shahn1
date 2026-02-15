import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/lib/locale-context"

import "./globals.css"

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const _notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic" })

export const metadata: Metadata = {
  title: "Payment Verification System",
  description: "Automated payment verification system with Telegram integration",
}

export const viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${_geist.variable} ${_geistMono.variable} ${_notoArabic.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
