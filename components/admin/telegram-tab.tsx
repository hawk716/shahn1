"use client"

import { useEffect, useState, useCallback } from "react"
import { Save, Loader2, RefreshCw, Radio, Hash, KeyRound, MessageSquare } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function TelegramTab() {
  const [apiId, setApiId] = useState("")
  const [apiHash, setApiHash] = useState("")
  const [chatId, setChatId] = useState("")
  const [sessionString, setSessionString] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const { t } = useLocale()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/telegram")
      const data = await res.json()
      if (data.success) {
        setApiId(data.data.apiId || "")
        setApiHash(data.data.apiHash || "")
        setChatId(data.data.chatId || "")
        setSessionString(data.data.sessionString || "")
      }
    } catch (err) {
      console.error("Failed to fetch telegram settings:", err)
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
      const res = await fetch("/api/admin/telegram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiId, apiHash, chatId, sessionString }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(t("telegramSettingsSaved"))
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
        <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Telegram Connection Settings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Radio className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("telegramConnection")}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {t("telegramApiId")}
                </span>
              </label>
              <input
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                className={`${inputClass} font-mono`}
                dir="ltr"
                placeholder="12345678"
              />
              <p className="text-muted-foreground/60 text-xs mt-1">{t("telegramApiIdHint")}</p>
            </div>
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  {t("telegramApiHash")}
                </span>
              </label>
              <input
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                className={`${inputClass} font-mono`}
                dir="ltr"
                type="password"
                placeholder="abc123def456..."
              />
              <p className="text-muted-foreground/60 text-xs mt-1">{t("telegramApiHashHint")}</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {t("telegramChatId")}
              </span>
            </label>
            <input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className={`${inputClass} font-mono`}
              dir="ltr"
              placeholder="-1001234567890"
            />
            <p className="text-muted-foreground/60 text-xs mt-1">{t("telegramChatIdHint")}</p>
          </div>

          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                {t("telegramSessionString")}
              </span>
            </label>
            <textarea
              value={sessionString}
              onChange={(e) => setSessionString(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none font-mono text-xs`}
              dir="ltr"
              placeholder="1BQANOTEuMT..."
            />
            <p className="text-muted-foreground/60 text-xs mt-1">{t("telegramSessionStringHint")}</p>
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
            {t("saveTelegramSettings")}
          </button>
        </div>
      </div>
    </div>
  )
}
