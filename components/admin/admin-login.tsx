"use client"

import React from "react"
import { useState } from "react"
import { Shield, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

interface AdminLoginProps {
  onLogin: (admin: { id: number; username: string; role: string }) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t, locale } = useLocale()
  const Arrow = locale === "ع" ? ArrowLeft : ArrowRight

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, portal: "admin" }),
      })
      const data = await res.json()

      if (data.success) {
        onLogin(data.user)
      } else {
        setError(data.error || t("loginError"))
      }
    } catch {
      setError(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Toolbar />
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-border via-foreground/20 to-border" />
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary border border-border mx-auto mb-4">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-lg font-semibold text-center mb-1">
              {t("adminLogin")}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              {t("enterApiKey")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-muted-foreground text-xs mb-1.5">{t("username")}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm 
                    placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                  placeholder={t("username")}
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-xs mb-1.5">{t("password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm 
                    placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                  placeholder={t("password")}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim() || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-primary text-primary-foreground font-semibold text-sm
                  hover:bg-primary/90 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Arrow className="w-4 h-4" />}
                {t("login")}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-border">
              <a
                href="/portal"
                className="block text-center text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {t("goToUserPortal")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
