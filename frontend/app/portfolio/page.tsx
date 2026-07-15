import type { Metadata } from "next"
import Home from "../page"

const siteTitle = "Valentin LOTH | Software Engineer | Full Stack | Portfolio de mes Skills"
const siteDescription = "Portfolio de Valentin Loth : projets, skills, stack technique et assistant IA."
const siteImage = "/og-portfolio-20260715.png"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "https://vloth.tech/portfolio",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://vloth.tech/portfolio",
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

export default Home
