"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface Payment {
  id: number
  sender_name: string
  amount: string
  app_name: string
  date: string
  time: string
  used: boolean
  created_at: string
}

export function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/payments")
      const data = await res.json()
      if (data.success) setPayments(data.data)
    } catch (err) {
      console.error("Failed to fetch payments:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold text-sm">
          {t("allPayments")} ({payments.length})
        </h2>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border 
            text-muted-foreground text-xs hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {loading ? t("loadingPayments") : t("noPayments")}
          </p>
        </div>
      ) : (
        <>
          <div className="sm:hidden divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="p-3 hover:bg-background transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground text-sm font-medium">{p.sender_name}</span>
                  {p.used ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("used")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {t("available")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{parseFloat(p.amount).toLocaleString()}</span>
                  <span className="text-border">|</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{p.app_name}</span>
                  <span className="text-border">|</span>
                  <span className="font-mono">{p.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("id")}</th>
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("sender")}</th>
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("amount")}</th>
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("app")}</th>
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("date")}</th>
                  <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-background transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono">{p.id}</td>
                    <td className="px-4 py-3 text-foreground">{p.sender_name}</td>
                    <td className="px-4 py-3 text-foreground font-mono">
                      {parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs">
                        {p.app_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                      {p.date} {p.time}
                    </td>
                    <td className="px-4 py-3">
                      {p.used ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("used")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                          <Clock className="w-3 h-3" />
                          {t("available")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
