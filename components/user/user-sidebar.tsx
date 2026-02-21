"use client"

import { useState } from "react"
import { LayoutDashboard, Key, ScrollText, BookOpen, LogOut, User, Menu, X, Send } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"
import type { TranslationKey } from "@/lib/i18n"

interface UserSidebarProps {
  username: string
  activePage: string
  onPageChange: (page: string) => void
  onLogout: () => void
}

const pages: { id: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { id: "withdrawal", labelKey: "withdrawal", icon: Send },
  { id: "transfer", labelKey: "transfer" as any, icon: Send },
  { id: "api-key", labelKey: "myApiKey", icon: Key },
  { id: "requests", labelKey: "myRequests", icon: ScrollText },
  { id: "docs", labelKey: "apiDocs", icon: BookOpen },
]

export function UserSidebar({ username, activePage, onPageChange, onLogout }: UserSidebarProps) {
  const { t } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handlePageChange(page: string) {
    onPageChange(page)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary border border-border shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold truncate">{username}</p>
              <p className="text-muted-foreground text-xs">{t("userPortal")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Toolbar />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary border border-border
                text-muted-foreground hover:text-foreground transition-all"
              aria-label={t("menu")}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card px-2 py-2">
            <nav className="flex flex-col gap-1" role="navigation" aria-label={t("navigation")}>
              {pages.map((page) => {
                const Icon = page.icon
                const isActive = activePage === page.id
                return (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-secondary text-foreground border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(page.labelKey)}
                  </button>
                )
              })}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                  text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
        <nav className="flex items-center justify-around px-1 py-1.5" role="navigation" aria-label={t("navigation")}>
          {pages.map((page) => {
            const Icon = page.icon
            const isActive = activePage === page.id
            return (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-w-0
                  ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-foreground" : ""}`} />
                <span className="truncate text-[10px]">{t(page.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-e border-border flex-col min-h-screen shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary border border-border">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold truncate">{username}</p>
              <p className="text-muted-foreground text-xs">{t("userPortal")}</p>
            </div>
          </div>
          <Toolbar />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="flex flex-col gap-1">
            {pages.map((page) => {
              const Icon = page.icon
              const isActive = activePage === page.id
              return (
                <button
                  key={page.id}
                  onClick={() => onPageChange(page.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-secondary text-foreground border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(page.labelKey)}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-border">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
              text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>
      </aside>
    </>
  )
}
