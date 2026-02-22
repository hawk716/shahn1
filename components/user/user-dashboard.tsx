"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Wallet, CheckCircle2, XCircle, Banknote, LayoutDashboard } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface UserDashboardProps {
  user: { id: number; username: string; balance: number; api_key: string }
}

interface UserStats {
  balance: number
  successfulRequests: number
  failedRequests: number
  totalAmountProcessed: number
  api_key: string
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/stats")
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading || !stats) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
      </div>
    )
  }

  const totalRequests = stats.successfulRequests + stats.failedRequests

  const cards = [
    { label: t("currentBalance"), value: `${stats.balance.toLocaleString()} ${t("credits")}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: t("totalRequests"), value: totalRequests, icon: Banknote, color: "text-foreground", bg: "bg-secondary border-border" },
    { label: t("successfulRequests"), value: stats.successfulRequests, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    { label: t("failedRequests"), value: stats.failedRequests, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    { label: t("totalProcessed"), value: `${stats.totalAmountProcessed.toLocaleString()} ${t("yer")}`, icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("myBalance")}</h1>
            <p className="text-muted-foreground text-sm">مرحباً {user.username} - إدارة حسابك والإحصائيات الخاصة بك</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border 
            text-muted-foreground text-xs hover:text-foreground transition-colors disabled:opacity-50 ml-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`p-3 sm:p-4 rounded-xl border ${card.bg}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background/50 shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[10px] sm:text-xs truncate">{card.label}</p>
                  <p className={`text-sm sm:text-lg font-bold ${card.color} truncate`}>{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
