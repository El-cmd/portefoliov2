import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import "./responsive.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const siteTitle = "Valentin LOTH | Software Engineer | Full Stack | Portfolio de mes Skills"
const siteDescription = "Portfolio de Valentin Loth : projets, skills, stack technique et assistant IA."

export const metadata: Metadata = {
  metadataBase: new URL("https://vloth.tech"),
  title: siteTitle,
  description: siteDescription,
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://vloth.tech",
    siteName: "Valentin Loth",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
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
