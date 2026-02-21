"use client"

import { useState } from "react"
import { Send, User, Banknote, Lock, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function TransferForm() {
  const { t } = useLocale()
  const [amount, setAmount] = useState("")
  const [toUsername, setToUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInitialCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      setError("يرجى إدخال مبلغ صحيح")
      return
    }
    if (!toUsername) {
      setError("يرجى إدخال اسم مستخدم المستلم")
      return
    }

    setChecking(true)
    setError("")

    try {
      // التحقق الأولي من المستلم والرصيد
      const res = await fetch("/api/user/transfer/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUsername, amount: parseFloat(amount) }),
      })

      const data = await res.json()
      if (data.success) {
        setShowConfirmModal(true)
      } else {
        setError(data.error || "فشل التحقق من البيانات")
      }
    } catch (err) {
      setError("خطأ في الاتصال بالخادم")
    } finally {
      setChecking(false)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError("يرجى إدخال كلمة المرور للتأكيد")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/user/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUsername, amount: parseFloat(amount), password }),
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setShowConfirmModal(false)
      } else {
        setError(data.error || "فشل التحويل")
      }
    } catch (err) {
      setError("خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center animate-in fade-in zoom-in duration-500 shadow-xl">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">تمت العملية بنجاح</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          تم تحويل <span className="text-primary font-bold">{parseFloat(amount).toLocaleString()}</span> ريال إلى <span className="text-foreground font-semibold">{toUsername}</span>.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setAmount("")
            setToUsername("")
            setPassword("")
          }}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          إجراء تحويل آخر
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">تحويل سريع</h1>
            <p className="text-muted-foreground text-sm">أرسل الرصيد لأي مستخدم في ثوانٍ</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm animate-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleInitialCheck} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-primary" />
                اسم المستلم
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={toUsername}
                  onChange={(e) => setToUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-1">
                <Banknote className="w-4 h-4 text-primary" />
                المبلغ
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:border-primary/50 font-mono"
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold bg-secondary/50 px-2 py-1 rounded-md">ريال</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={checking}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.99]"
          >
            {checking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                متابعة التحويل
              </>
            )}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">تأكيد العملية</h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">المستلم</span>
                  <span className="font-bold text-foreground">{toUsername}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">المبلغ الإجمالي</span>
                  <span className="font-bold text-primary text-lg">{parseFloat(amount).toLocaleString()} ريال</span>
                </div>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    كلمة المرور للتأكيد
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة مرورك"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-border text-foreground font-bold hover:bg-secondary transition-all active:scale-[0.98]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        تأكيد وإرسال
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
