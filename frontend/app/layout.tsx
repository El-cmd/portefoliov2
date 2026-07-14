import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import "./responsive.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Valentin Loth",
  description: "Portfolio principal de Valentin Loth.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body className={`font-sans`}>{children}</body>
    </html>
  )
}
