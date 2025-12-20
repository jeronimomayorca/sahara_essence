import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import AIChatButton from "@/components/AIChatButton"
import { CartButton } from "@/components/CartButton"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/Footer"
import PageLoader from "@/components/PageLoader"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Sahara Essence | Explora la mayor Selección de Perfumes Online | Descubre +300 Fragancias para hombre y mujer",
  description: "Descubre nuestra colección curada de más de 300 perfumes. Encuentra tu aroma ideal entre fragancias de diseñador y nicho para hombre y mujer. Envíos a todo el país."
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
      <body 
        className={`${cormorant.variable} ${inter.variable} font-inter antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PageLoader />
          <Navigation />
          <main className="pt-16">{children}</main>
          <Footer />
          <AIChatButton />
          <CartButton />
          <Toaster position="bottom-left" />
        </ThemeProvider>
      </body>
    </html>
  )
}
