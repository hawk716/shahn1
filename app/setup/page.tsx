"use client"

import { useState } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSetup() {
    setLoading(true)
    setMessage("")
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setError(data.error || "فشل الإعداد")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4 text-center">إعداد قاعدة البيانات</h1>
          <p className="text-muted-foreground text-center mb-6">
            اضغط الزر أدناه لإنشاء قاعدة البيانات والمستخدم المدير
          </p>

          {message && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm mb-4 flex gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{message}</div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-4 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
              bg-primary text-primary-foreground font-semibold text-sm
              hover:bg-primary/90 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "جاري الإعداد..." : success ? "تم بنجاح!" : "إنشاء قاعدة البيانات"}
          </button>

          {success && (
            <div className="mt-6 pt-6 border-t border-border">
              <a
                href="/admin"
                className="block text-center py-3 px-4 rounded-xl bg-secondary text-foreground font-semibold text-sm
                  hover:bg-secondary/80 transition-colors"
              >
                الذهاب إلى لوحة المدير
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
