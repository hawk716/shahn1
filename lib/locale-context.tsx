"use client"

import React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Locale, TranslationKey } from "./i18n"
import { translations } from "./i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  dir: "rtl" | "ltr"
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ع")

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && (saved === "ع" || saved === "en")) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
    document.documentElement.lang = newLocale === "ع" ? "ar" : newLocale
    document.documentElement.dir = newLocale === "ع" ? "rtl" : "ltr"
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === "ع" ? "ar" : locale
    document.documentElement.dir = locale === "ع" ? "rtl" : "ltr"
  }, [locale])

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[locale][key] || key
    },
    [locale]
  )

  const dir = locale === "ع" ? "rtl" : "ltr"

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
