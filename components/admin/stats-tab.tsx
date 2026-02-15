"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Users, CreditCard, CheckCircle2, XCircle, Banknote, TrendingUp } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface AdminStats {
  userCount: number
  paymentCount: number
  totalAmount: number
  usedPaymentCount: number
  usedAmount: number
  successfulVerifications: number
  failedVerifications: number
}

export function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
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

  const totalVerifications = stats.successfulVerifications + stats.failedVerifications
  const successRate = totalVerifications > 0 ? ((stats.successfulVerifications / totalVerifications) * 100).toFixed(1) : "0"

  const cards = [
    { label: t("totalUsers"), value: stats.userCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: t("totalPayments"), value: stats.paymentCount, icon: CreditCard, color: "text-foreground", bg: "bg-secondary border-border" },
    { label: t("totalAmount"), value: `${stats.totalAmount.toLocaleString()} ${t("yer")}`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: t("usedAmount"), value: `${stats.usedAmount.toLocaleString()} ${t("yer")}`, icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: t("successfulVerifications"), value: stats.successfulVerifications, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    { label: t("failedVerifications"), value: stats.failedVerifications, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    { label: t("successRate"), value: `${successRate}%`, icon: TrendingUp, color: "text-foreground", bg: "bg-secondary border-border" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-foreground font-semibold text-sm">{t("statistics")}</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border 
            text-muted-foreground text-xs hover:text-foreground transition-colors disabled:opacity-50"
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
