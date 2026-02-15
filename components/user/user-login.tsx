"use client"

import React from "react"

import { useState } from "react"
import { User, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

// Google Icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

interface UserLoginProps {
  onLogin: (user: { id: number; username: string; role: string; balance: number; api_key: string }) => void
}

export function UserLogin({ onLogin }: UserLoginProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { t, locale } = useLocale()
  const Arrow = locale === "ع" ? ArrowLeft : ArrowRight

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    // Validate password confirmation in register mode
    if (isRegister && password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    // Validate email in register mode
    if (isRegister && !email.trim()) {
      setError("البريد الإلكتروني مطلوب")
      setLoading(false)
      return
    }

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          email: email || undefined,
          language: locale === "ع" ? "ar" : "en"
        }),
      })
      const data = await res.json()

      if (data.success) {
        if (isRegister) {
          setSuccessMessage("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني للتحقق من الحساب.")
          setTimeout(() => {
            setUsername("")
            setPassword("")
            setConfirmPassword("")
            setEmail("")
            setIsRegister(false)
          }, 3000)
        } else {
          onLogin(data.user)
        }
      } else {
        // Custom error messages
        if (data.error === "Invalid credentials") {
          setError("❌ ليس لديك حساب بعد\nقم بإنشاء حسابك الآن")
        } else if (data.error.includes("التحقق من بريدك")) {
          setError("يجب التحقق من بريدك الإلكتروني أولاً قبل الدخول. تحقق من صندوق الوارد وانقر على رابط التحقق.")
        } else {
          setError(data.error || t("loginError"))
        }
      }
    } catch {
      setError(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError("")
    try {
      // Redirect to Google OAuth endpoint
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"
      const redirectUri = `${window.location.origin}/api/auth/google/callback`
      const scope = "openid profile email"
      const responseType = "code"
      const state = Math.random().toString(36).substring(7)
      
      // Store state in sessionStorage for verification
      sessionStorage.setItem("oauth_state", state)
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`
      window.location.href = googleAuthUrl
    } catch (err) {
      setError("فشل تسجيل الدخول عبر جوجل")
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
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-lg font-semibold text-center mb-1">
              {isRegister ? t("registerTitle") : t("userLogin")}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              {t("userPortal")}
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

              {isRegister && (
                <div>
                  <label className="block text-muted-foreground text-xs mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm 
                      placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                    placeholder="example@email.com"
                    required
                  />
                  <p className="text-muted-foreground text-xs mt-1">سيتم إرسال رابط التحقق إلى بريدك</p>
                </div>
              )}

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

              {isRegister && (
                <div>
                  <label className="block text-muted-foreground text-xs mb-1.5">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm 
                      placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                    placeholder="تأكيد كلمة المرور"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
                  ✓ {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim() || !password.trim() || (isRegister && !confirmPassword.trim())}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-primary text-primary-foreground font-semibold text-sm
                  hover:bg-primary/90 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Arrow className="w-4 h-4" />}
                {isRegister ? t("register") : t("login")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { 
                  setIsRegister(!isRegister)
                  setError("")
                  setPassword("")
                  setConfirmPassword("")
                  setEmail("")
                }}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {isRegister ? t("hasAccount") : t("noAccount")}{" "}
                <span className="text-foreground font-medium">
                  {isRegister ? t("login") : t("register")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
