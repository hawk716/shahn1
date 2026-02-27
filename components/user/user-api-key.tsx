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
      <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Key className="w-32 h-32 rotate-12" />
        </div>
        <div className="flex items-center gap-5 mb-2 relative z-10">
          <div className="p-4 bg-primary/15 rounded-2xl border border-primary/20 shadow-inner">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("myApiKey")}</h1>
            <p className="text-muted-foreground text-sm font-medium">{t("apiKeyManageHint")}</p>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h2 className="text-foreground font-bold text-sm uppercase tracking-wider">{t("yourApiKey")}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 px-4 py-3.5 rounded-xl bg-background border border-border font-mono text-xs sm:text-sm text-foreground break-all shadow-inner" dir="ltr">
              {currentKey || "••••••••••••••••••••••••••••••••"}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
              title={t("copyKey")}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t("copied") : t("copyKey")}</span>
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl 
              bg-secondary border border-border text-muted-foreground font-bold text-sm
              hover:text-foreground hover:bg-secondary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {t("regenerateKey")}
          </button>
        </div>
      </div>

      {/* Callback URL Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-foreground font-bold text-sm uppercase tracking-wider">{t("callbackUrl")}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <input
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-background border border-border font-mono text-sm text-foreground
                placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
              dir="ltr"
              placeholder="https://your-server.com/webhook"
            />
            <p className="text-muted-foreground/60 text-xs mt-2 font-medium">{t("callbackUrlHint")}</p>
          </div>

          {callbackMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
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
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
              bg-primary text-primary-foreground font-bold text-sm
              hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {savingCallback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("saveSettings")}
          </button>
        </div>
      </div>
    </div>
  )
}
