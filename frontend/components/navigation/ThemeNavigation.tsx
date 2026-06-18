"use client"

import { Moon, Sun } from "lucide-react"
import type { ThemeMode } from "@/components/sections/types"

type ThemeNavigationProps = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  getThemeButtonClass: (isActive: boolean) => string
}

export function ThemeNavigation({ theme, setTheme, getThemeButtonClass }: ThemeNavigationProps) {
  return (
    <nav aria-label="Theme mode" className="theme-navigation fixed left-5 top-5 z-30 flex items-center gap-2 md:left-8 md:top-8">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Mode dark"
        className={getThemeButtonClass(theme === "dark")}
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Mode light"
        className={getThemeButtonClass(theme === "light")}
      >
        <Sun className="h-5 w-5" />
      </button>
    </nav>
  )
}
