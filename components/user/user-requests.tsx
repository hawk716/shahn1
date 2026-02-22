"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface LogEntry {
  id: number
  requested_name: string
  requested_amount: string
  requested_app: string
  matched_payment_id: number | null
  success: boolean
  failure_reason: string | null
  credited_balance: string | null
  payment_ref: string | null
  created_at: string
}

export function UserRequests() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/logs")
      const data = await res.json()
      if (data.success) setLogs(data.data)
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("myRequests")}</h1>
              <p className="text-muted-foreground text-sm">{t("recentRequests")}</p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background border border-border 
              text-muted-foreground text-sm hover:text-foreground transition-all hover:border-primary/50 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">{t("noLogs")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-3 sm:p-4 hover:bg-background transition-colors">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    {log.success ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      {/* Mobile: stacked */}
                      <div className="sm:hidden">
                        <p className="text-foreground text-sm">{log.requested_name}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {parseFloat(log.requested_amount).toLocaleString()} - {log.requested_app}
                        </p>
                      </div>
                      {/* Desktop: inline */}
                      <p className="text-foreground text-sm hidden sm:block">
                        <span className="text-muted-foreground">{t("name")}:</span> {log.requested_name}
                        <span className="mx-2 text-border">|</span>
                        <span className="text-muted-foreground">{t("amount")}:</span>{" "}
                        {parseFloat(log.requested_amount).toLocaleString()}
                        <span className="mx-2 text-border">|</span>
                        <span className="text-muted-foreground">{t("app")}:</span> {log.requested_app}
                      </p>
                      {log.payment_ref && (
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {t("paymentRef")}: <span className="font-mono">{log.payment_ref}</span>
                        </p>
                      )}
                      {log.success ? (
                        <p className="text-green-500 text-xs mt-1">
                          {t("balance")}: {parseFloat(log.credited_balance || "0").toLocaleString()} | {t("paymentId")} #{log.matched_payment_id}
                        </p>
                      ) : (
                        <p className="text-red-500 text-xs mt-1 break-words">
                          {log.failure_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground/60 text-xs font-mono whitespace-nowrap hidden sm:block">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
