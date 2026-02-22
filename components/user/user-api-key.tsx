"use client"

import { useState, useEffect, useCallback } from "react"
import { Key, Copy, CheckCircle2, RefreshCw, Loader2, Save, Globe } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface UserApiKeyProps {
  user: { api_key: string }
  onUpdate: () => void
}

export function UserApiKey({ user, onUpdate }: UserApiKeyProps) {
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [currentKey, setCurrentKey] = useState(user.api_key)
  const [callbackUrl, setCallbackUrl] = useState("")
  const [savingCallback, setSavingCallback] = useState(false)
  const [callbackMessage, setCallbackMessage] = useState("")
  const { t } = useLocale()

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/user/settings")
      const data = await res.json()
      if (data.success) {
        setCallbackUrl(data.data.callback_url || "")
      }
    } catch (err) {
      console.error("Failed to fetch user settings:", err)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  async function handleCopy() {
    await navigator.clipboard.writeText(currentKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    if (!confirm(t("regenerateConfirm"))) return
    setRegenerating(true)
    try {
      const res = await fetch("/api/user/regenerate-key", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setCurrentKey(data.data.api_key)
        onUpdate()
      }
    } catch (err) {
      console.error("Failed to regenerate:", err)
    } finally {
      setRegenerating(false)
    }
  }

  async function handleSaveCallback() {
    setSavingCallback(true)
    setCallbackMessage("")
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_url: callbackUrl }),
      })
      const data = await res.json()
      if (data.success) {
        setCallbackMessage(t("settingsSaved"))
      } else {
        setCallbackMessage(`${t("error")}: ${data.error}`)
      }
    } catch (err) {
      setCallbackMessage(`${t("error")}: ${err}`)
    } finally {
      setSavingCallback(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("myApiKey")}</h1>
            <p className="text-muted-foreground text-sm">{t("apiKeyManageHint")}</p>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Key className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("yourApiKey")}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-border font-mono text-xs sm:text-sm text-foreground break-all" dir="ltr">
              {currentKey || "-"}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-xl bg-secondary border border-border
                text-muted-foreground text-sm hover:text-foreground transition-colors shrink-0"
              title={t("copyKey")}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span className="text-xs">{copied ? t("copied") : t("copyKey")}</span>
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
              bg-secondary border border-border text-muted-foreground font-medium text-sm
              hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {t("regenerateKey")}
          </button>
        </div>
      </div>

      {/* Callback URL Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("callbackUrl")}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <input
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-mono text-sm text-foreground
                placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
              dir="ltr"
              placeholder="https://your-server.com/webhook"
            />
            <p className="text-muted-foreground/60 text-xs mt-1.5">{t("callbackUrlHint")}</p>
          </div>

          {callbackMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                callbackMessage.startsWith(t("error"))
                  ? "bg-red-500/10 border border-red-500/20 text-red-500"
                  : "bg-green-500/10 border border-green-500/20 text-green-500"
              }`}
            >
              {callbackMessage}
            </div>
          )}

          <button
            onClick={handleSaveCallback}
            disabled={savingCallback}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
              bg-primary text-primary-foreground font-semibold text-sm
              hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingCallback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("saveSettings")}
          </button>
        </div>
      </div>
    </div>
  )
}
