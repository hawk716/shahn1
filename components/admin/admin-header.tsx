"use client"

import { Shield, LogOut } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

interface AdminHeaderProps {
  username: string
  onLogout: () => void
}

export function AdminHeader({ username, onLogout }: AdminHeaderProps) {
  const { t } = useLocale()

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary border border-border shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-foreground text-sm sm:text-lg font-semibold truncate">
              {t("appName")}
            </h1>
            <p className="text-muted-foreground text-xs truncate">
              {t("adminDashboard")} - {username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Toolbar />
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-secondary border border-border
              text-red-500 hover:bg-red-500/10 transition-all text-xs font-medium"
            title={t("logout")}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
