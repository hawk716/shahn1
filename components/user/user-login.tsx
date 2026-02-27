"use client"

import React from "react"
import { useState } from "react"
import { User, Loader2, ArrowLeft, ArrowRight, Shield, Zap, BookOpen, Lock, FileText, AlertCircle } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"
import { ApiDocsPage } from "./api-docs-page"
import Link from "next/link"

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
      setError(locale === "ع" ? "كلمات المرور غير متطابقة" : "Passwords do not match")
      setLoading(false)
      return
    }

    // Validate email in register mode
    if (isRegister && !email.trim()) {
      setError(locale === "ع" ? "البريد الإلكتروني مطلوب" : "Email is required")
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
          setSuccessMessage(locale === "ع" ? "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني للتحقق من الحساب." : "Account created successfully! Please check your email for verification.")
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
          setError(locale === "ع" ? "❌ ليس لديك حساب بعد\nقم بإنشاء حسابك الآن" : "❌ Account not found\nCreate your account now")
        } else if (data.error.includes("التحقق من بريدك")) {
          setError(locale === "ع" ? "يجب التحقق من بريدك الإلكتروني أولاً قبل الدخول. تحقق من صندوق الوارد وانقر على رابط التحقق." : "Please verify your email before logging in. Check your inbox for the verification link.")
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
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"
      const redirectUri = `${window.location.origin}/api/auth/google/callback`
      const scope = "openid profile email"
      const responseType = "code"
      const state = Math.random().toString(36).substring(7)
      
      sessionStorage.setItem("oauth_state", state)
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`
      window.location.href = googleAuthUrl
    } catch (err) {
      setError(locale === "ع" ? "فشل تسجيل الدخول عبر جوجل" : "Google login failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-foreground">{locale === "ع" ? "الشامل" : "Al-Shamel"}</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {locale === "ع" ? "الرئيسية" : "Home"}
              </Link>
            </nav>
          </div>
          <Toolbar />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-sm mb-12">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-border" />
            <div className="p-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mx-auto mb-6">
                <User className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-foreground text-2xl font-bold text-center mb-2">
                {isRegister ? (locale === "ع" ? "إنشاء حساب جديد" : "Create Account") : (locale === "ع" ? "تسجيل الدخول" : "Login")}
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                {isRegister ? (locale === "ع" ? "انضم إلى منصتنا الآمنة والموثوقة" : "Join our secure and trusted platform") : (locale === "ع" ? "مرحباً بك في منصة الشامل" : "Welcome to Al-Shamel Platform")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-muted-foreground text-xs mb-2 font-semibold">{t("username")}</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                      placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder={t("username")}
                    required
                    minLength={3}
                  />
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-muted-foreground text-xs mb-2 font-semibold">{locale === "ع" ? "البريد الإلكتروني" : "Email"}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                        placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      placeholder="example@email.com"
                      required
                    />
                    <p className="text-muted-foreground text-xs mt-1.5">{locale === "ع" ? "سيتم إرسال رابط التحقق إلى بريدك" : "Verification link will be sent to your email"}</p>
                  </div>
                )}

                <div>
                  <label className="block text-muted-foreground text-xs mb-2 font-semibold">{t("password")}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                      placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder={t("password")}
                    required
                    minLength={6}
                  />
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-muted-foreground text-xs mb-2 font-semibold">{locale === "ع" ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                        placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      placeholder={locale === "ع" ? "تأكيد كلمة المرور" : "Confirm Password"}
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
                    ✓ {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password.trim() || (isRegister && !confirmPassword.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg
                    bg-primary text-primary-foreground font-bold text-sm
                    hover:bg-primary/90 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Arrow className="w-4 h-4" />}
                  {isRegister ? (locale === "ع" ? "إنشاء الحساب" : "Sign Up") : (locale === "ع" ? "تسجيل الدخول" : "Login")}
                </button>
              </form>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">{locale === "ع" ? "أو" : "OR"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                  bg-white text-gray-900 font-semibold text-sm border border-gray-200
                  hover:bg-gray-50 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <GoogleIcon />
                {locale === "ع" ? "متابعة باستخدام Google" : "Continue with Google"}
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { 
                    setIsRegister(!isRegister)
                    setError("")
                    setPassword("")
                    setConfirmPassword("")
                    setEmail("")
                  }}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {isRegister ? (locale === "ع" ? "لديك حساب بالفعل؟" : "Already have an account?") : (locale === "ع" ? "ليس لديك حساب؟" : "Don't have an account?")}{" "}
                  <span className="text-foreground font-bold hover:text-primary">
                    {isRegister ? (locale === "ع" ? "تسجيل الدخول" : "Login") : (locale === "ع" ? "إنشاء حساب" : "Sign Up")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated API Documentation Section */}
        <div className="w-full max-w-5xl px-4">
          <div className="text-center mb-10">
             <h3 className="text-3xl font-bold text-foreground mb-3">{locale === "ع" ? "توثيق المطورين" : "Developer Documentation"}</h3>
             <p className="text-muted-foreground">{locale === "ع" ? "كل ما تحتاجه لربط خدماتنا برمجياً" : "Everything you need to integrate our services"}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl">
             <ApiDocsPage apiKey="" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">{locale === "ع" ? "الشامل" : "Al-Shamel"}</h4>
              <p className="text-muted-foreground text-sm">{locale === "ع" ? "منصة آمنة وموثوقة لإدارة معاملاتك المالية بكل سهولة." : "A secure and reliable platform for managing your financial transactions with ease."}</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">{locale === "ع" ? "الروابط" : "Links"}</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">{locale === "ع" ? "الرئيسية" : "Home"}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">{locale === "ع" ? "القانونية" : "Legal"}</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{locale === "ع" ? "سياسة الخصوصية" : "Privacy Policy"}</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{locale === "ع" ? "شروط الاستخدام" : "Terms of Use"}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">{locale === "ع" ? "الأمان" : "Security"}</h5>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Lock className="w-4 h-4 text-primary" />
                <span>SSL 256-bit Encrypted</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8">
            <p className="text-muted-foreground text-xs text-center">
              © 2024 {locale === "ع" ? "منصة الشامل. جميع الحقوق محفوظة." : "Al-Shamel Platform. All rights reserved."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
