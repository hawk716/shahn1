"use client"

import React from "react"
import { useState } from "react"
import { User, Loader2, ArrowLeft, ArrowRight, Shield, Zap, BookOpen, Lock, FileText, AlertCircle } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-foreground">الشامل</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                الرئيسية
              </Link>
              <Link href="/public/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                الوثائق
              </Link>
            </nav>
          </div>
          <Toolbar />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-border" />
            <div className="p-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mx-auto mb-6">
                <User className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-foreground text-2xl font-bold text-center mb-2">
                {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                {isRegister ? "انضم إلى منصتنا الآمنة والموثوقة" : "مرحباً بك في منصة الشامل"}
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
                    <label className="block text-muted-foreground text-xs mb-2 font-semibold">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                        placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      placeholder="example@email.com"
                      required
                    />
                    <p className="text-muted-foreground text-xs mt-1.5">سيتم إرسال رابط التحقق إلى بريدك</p>
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
                    <label className="block text-muted-foreground text-xs mb-2 font-semibold">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm 
                        placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                      placeholder="تأكيد كلمة المرور"
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
                  {isRegister ? "إنشاء الحساب" : "تسجيل الدخول"}
                </button>
              </form>

              {/* Google Auth Button */}
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">أو</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-lg mt-6
                  bg-white text-gray-900 font-semibold text-sm border border-gray-200
                  hover:bg-gray-50 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <GoogleIcon />
                متابعة باستخدام Google
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
                  {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
                  <span className="text-foreground font-bold hover:text-primary">
                    {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Landing Section - Features */}
      <section className="bg-card/30 border-t border-border py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-3">لماذا تختار الشامل؟</h3>
            <p className="text-muted-foreground text-lg">منصة آمنة وموثوقة لإدارة معاملاتك المالية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Security Card */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold text-lg mb-3">أمان البيانات</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                نظام مشفر بمعايير SSL العالمية مع حماية متقدمة لضمان سلامة بيانات المستخدمين والمعاملات المالية.
              </p>
            </div>

            {/* Services Card */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold text-lg mb-3">خدماتنا الرقمية</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                مجموعة متكاملة من الأدوات والخدمات المالية الحديثة لتسهيل إدارة أموالك بكفاءة واحترافية.
              </p>
            </div>

            {/* Support Card */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold text-lg mb-3">الدعم والوثائق</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                وثائق شاملة وفريق دعم متخصص جاهز لمساعدتك.{" "}
                <Link href="/public/docs" className="text-primary font-semibold hover:underline">
                  اطلع على الوثائق الكاملة
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">الشامل</h4>
              <p className="text-muted-foreground text-sm">منصة آمنة وموثوقة لإدارة معاملاتك المالية بكل سهولة.</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">الروابط</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">الرئيسية</Link></li>
                <li><Link href="/public/docs" className="text-muted-foreground hover:text-foreground transition-colors">الوثائق</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">القانونية</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">شروط الاستخدام</Link></li>
                <li><Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">مركز الأمان</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">الأمان</h5>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Lock className="w-4 h-4 text-primary" />
                <span>مشفر بـ SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>معايير دولية معتمدة</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8">
            <p className="text-muted-foreground text-xs text-center">
              © 2024 منصة الشامل. جميع الحقوق محفوظة. نظام مشفر بمعايير SSL العالمية لضمان أمان معاملاتك.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
