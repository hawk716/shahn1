"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"

type SetupStep = "init" | "loading" | "success" | "error"

export default function AdminSetupPage() {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<SetupStep>("init")

  async function handleSetup() {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      setStep("loading")
      setMessage("جاري إنشاء جداول قاعدة البيانات ومستخدم المدير...")

      // Setup API creates both tables and admin user
      const setupResponse = await fetch("/api/admin/setup", {
        method: "POST",
      })

      const data = await setupResponse.json()

      if (!setupResponse.ok) {
        throw new Error(data.error || "فشل في الإعداد")
      }

      setMessage("تم إنشاء مستخدم المدير بنجاح! يمكنك الآن تسجيل الدخول.")
      setStep("success")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير معروف"
      setError(errorMsg)
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold">إعداد لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-2">
            إنشاء مستخدم المدير والجداول الأساسية
          </p>
        </div>

        <div className="space-y-4">
          {step === "init" && (
            <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                بيانات المدير:
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">اسم المستخدم:</span> moatsem
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">كلمة المرور:</span> 716moatsem
              </p>
              <p className="text-xs text-amber-500 mt-3 bg-amber-500/10 p-2 rounded">
                احفظ بيانات المدير في مكان آمن
              </p>
            </div>
          )}

          {step === "loading" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-500 text-sm">{message}</p>
            </div>
          )}

          {step === "success" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-500 text-sm font-medium">نجح!</p>
              <p className="text-green-500/70 text-xs mt-2">{message}</p>
            </div>
          )}

          {step === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-500 text-sm font-medium">خطأ</p>
              <p className="text-red-500/70 text-xs mt-2 break-words">{error}</p>
            </div>
          )}
        </div>

        {(step === "init" || step === "error") && (
          <Button
            onClick={handleSetup}
            disabled={loading}
            className="w-full"
          >
            {loading ? "جاري الإعداد..." : "بدء الإعداد"}
          </Button>
        )}

        {step === "success" && (
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            الذهاب إلى صفحة الدخول
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          سيتم إنشاء جميع جداول قاعدة البيانات تلقائياً
        </p>
      </div>
    </div>
  )
}
