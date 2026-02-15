"use client"

import { useTheme } from "next-themes"
import { useLocale } from "@/lib/locale-context"
import { Sun, Moon, Monitor, Languages } from "lucide-react"
import { useEffect, useState } from "react"

export function Toolbar() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  const themes = [
    { id: "light", icon: Sun, label: t("light") },
    { id: "dark", icon: Moon, label: t("dark") },
    { id: "system", icon: Monitor, label: t("system") },
  ] as const

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Theme Toggle */}
      <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg bg-secondary border border-border">
        {themes.map((item) => {
          const Icon = item.icon
          const isActive = theme === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md transition-all
                ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )
        })}
      </div>

      {/* Language Toggle */}
      <button
        onClick={() => setLocale(locale === "ع" ? "en" : "ع")}
        className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-9 px-2 sm:px-3 rounded-lg bg-secondary border border-border
          text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
        title={t("language")}
        aria-label={t("language")}
      >
        <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>{locale === "ع" ? "EN" : "ع"}</span>
      </button>
    </div>
  )
}
