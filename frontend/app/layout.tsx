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
const siteImage = "/og-portfolio-20260715.png"

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
    images: [
      {
        url: siteImage,
        width: 1919,
        height: 933,
        alt: "Accueil du portfolio de Valentin Loth",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [siteImage],
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
