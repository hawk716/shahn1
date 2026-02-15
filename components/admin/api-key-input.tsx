"use client"

import { useState } from "react"
import { Shield, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

interface ApiKeyInputProps {
  onSubmit: (key: string) => void
}

export function ApiKeyInput({ onSubmit }: ApiKeyInputProps) {
  const [key, setKey] = useState("")
  const { t, locale } = useLocale()
  const Arrow = locale === "ع" ? ArrowLeft : ArrowRight

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-4">
        <Toolbar />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-border via-foreground/20 to-border" />
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary border border-border mx-auto mb-4">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-foreground text-lg font-semibold text-center mb-1">
            {t("adminAccess")}
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            {t("enterApiKey")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (key.trim()) onSubmit(key.trim())
            }}
          >
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t("apiKeyPlaceholder")}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-mono 
                placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                bg-primary text-primary-foreground font-semibold text-sm
                hover:bg-primary/90 transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Arrow className="w-4 h-4" />
              {t("enterDashboard")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
