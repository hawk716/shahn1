"use client"

import { useEffect, useState, useCallback } from "react"
import { Save, Loader2, RefreshCw } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function SettingsTab() {
  const [exchangeRate, setExchangeRate] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const { t } = useLocale()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (data.success) {
        setExchangeRate(String(data.data.exchange_rate))
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  async function handleSave() {
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange_rate: parseFloat(exchangeRate) }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(t("settingsSaved"))
      } else {
        setMessage(`${t("error")}: ${data.error}`)
      }
    } catch (err) {
      setMessage(`${t("error")}: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
  const labelClass = "block text-muted-foreground text-xs mb-1.5"

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm mt-2">{t("loadingSettings")}</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-foreground font-semibold text-sm">{t("systemSettings")}</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className={labelClass}>{t("exchangeRate")}</label>
          <input
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            type="number"
            step="0.01"
            className={inputClass}
          />
          <p className="text-muted-foreground/60 text-xs mt-1">{t("exchangeRateHint")}</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.startsWith(t("error"))
                ? "bg-red-500/10 border border-red-500/20 text-red-500"
                : "bg-green-500/10 border border-green-500/20 text-green-500"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
            bg-primary text-primary-foreground font-semibold text-sm
            hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("saveSettings")}
        </button>
      </div>
    </div>
  )
}
