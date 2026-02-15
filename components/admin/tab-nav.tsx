"use client"

import { BarChart3, CreditCard, ScrollText, Users, Radio, FlaskConical, Settings } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import type { TranslationKey } from "@/lib/i18n"

interface TabNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs: { id: string; labelKey: TranslationKey; icon: typeof CreditCard }[] = [
  { id: "stats", labelKey: "statistics", icon: BarChart3 },
  { id: "payments", labelKey: "payments", icon: CreditCard },
  { id: "logs", labelKey: "verificationLogs", icon: ScrollText },
  { id: "users", labelKey: "users", icon: Users },
  { id: "telegram", labelKey: "telegramSettings", icon: Radio },
  { id: "test", labelKey: "testAndIngest", icon: FlaskConical },
  { id: "settings", labelKey: "settings", icon: Settings },
]

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const { t } = useLocale()

  return (
    <nav className="flex gap-1 p-1 bg-card border border-border rounded-xl overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${
                isActive
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            title={t(tab.labelKey)}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
