import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "SAHARA ESSENCE - Perfumes de Lujo",
  description: "Descubre la elegancia en cada gota. Perfumes de lujo que definen tu esencia única.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_sahara.png" type="image/png" />
      </head>
      <body className={`${playfair.variable} ${inter.variable} font-inter antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navigation />
          <main className="pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
