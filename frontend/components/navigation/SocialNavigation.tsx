"use client"

import type { SocialLink } from "@/components/sections/types"

type SocialNavigationProps = {
  socialLinks: SocialLink[]
  socialButtonClass: string
}

export function SocialNavigation({ socialLinks, socialButtonClass }: SocialNavigationProps) {
  return (
    <nav aria-label="Social links" className="social-navigation fixed right-5 top-5 z-30 flex items-center gap-3 md:right-8 md:top-8">
      {socialLinks.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
          aria-label={label}
          className={socialButtonClass}
        >
          <Icon className="h-5 w-5 transition duration-300 group-hover:scale-110" />
        </a>
      ))}
    </nav>
  )
}
