"use client"

import { useState } from "react"
import { Shield, CheckCircle2, XCircle, Loader2, CreditCard, User, Banknote, Smartphone, Info } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

interface PaymentPageClientProps {
  pageId: string
  senderName: string
  amount: number
  appName: string
  status: string
}

type VerifyResult = {
  success: boolean
  data?: {
    credited_balance: number
    exchange_rate: number
    payment_id: number
  }
  error?: string
} | null

export function PaymentPageClient({
  pageId,
  senderName: initialSenderName,
  amount: initialAmount,
  appName: initialAppName,
  status: initialStatus,
}: PaymentPageClientProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult>(null)
  const [status, setStatus] = useState(initialStatus)
  const { t } = useLocale()

  // Form states
  const [senderName, setSenderName] = useState(initialSenderName || "")
  const [amount, setAmount] = useState(initialAmount > 0 ? initialAmount.toString() : "")
  const [appName, setAppName] = useState(initialAppName || "")

  async function handleVerify() {
    if (!senderName || !amount || !appName) {
      setResult({ success: false, error: t("fillAllFields") || "يرجى ملء جميع الحقول" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/page-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          page_id: pageId,
          name: senderName,
          amount: parseFloat(amount),
          app: appName
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setStatus("completed")
      }
    } catch {
      setResult({ success: false, error: t("connectionError") })
    } finally {
      setLoading(false)
    }
  }

  const isCompleted = status === "completed"
  const isFormDisabled = loading || isCompleted || (result?.success === true)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--foreground)/0.03)_0%,_transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Toolbar */}
        <div className="flex justify-center mb-4">
          <Toolbar />
        </div>

        {/* Card */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Top accent line */}
          <div className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

          {/* Header */}
          <div className="p-6 pb-4 flex items-center gap-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold">
                {t("confirmPayment")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("verifyingTransfer")}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {!isCompleted && (
            <div className="px-6 pt-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>يرجى إدخال بيانات التحويل التي قمت بها بدقة ليتمكن النظام من التحقق منها آلياً.</p>
              </div>
            </div>
          )}

          {/* Payment details form */}
          <div className="p-6 space-y-5">
            {/* Sender Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
                <User className="w-3.5 h-3.5" />
                {t("senderNameLabel")}
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                disabled={isFormDisabled}
                placeholder="أدخل اسم المحول كما يظهر في الإشعار"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
                <Banknote className="w-3.5 h-3.5" />
                {t("amountLabel")} ({t("yer")})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isFormDisabled}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60"
              />
            </div>

            {/* App Name Select/Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
                <Smartphone className="w-3.5 h-3.5" />
                {t("paymentApp")}
              </label>
              <select
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={isFormDisabled}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60 appearance-none"
              >
                <option value="">اختر التطبيق</option>
                <option value="Jaib">جيب (Jaib)</option>
                <option value="Kuraimi">الكريمي (Kuraimi)</option>
                <option value="OneCash">ون كاش (OneCash)</option>
                <option value="M-Mocha">إم موكا (M-Mocha)</option>
                <option value="Other">آخر</option>
              </select>
            </div>
          </div>

          {/* Result display */}
          {result && (
            <div className="px-6 pb-4">
              {result.success ? (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-green-500 font-bold text-sm">
                      {t("verifiedSuccessfully")}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {t("creditedBalance")}:{" "}
                      <span className="text-foreground font-bold text-lg">
                        {result.data?.credited_balance?.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("exchangeRateLabel")}:{" "}
                      <span className="text-foreground">
                        {result.data?.exchange_rate}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-500 font-bold text-sm">
                      {t("verificationFailed")}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="p-6 pt-2">
            {isCompleted && !result ? (
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <p className="text-green-500 font-bold">
                  {t("alreadyVerified")}
                </p>
              </div>
            ) : (
              <button
                onClick={handleVerify}
                disabled={isFormDisabled}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl 
                  bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20
                  hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("verifying")}
                  </>
                ) : result?.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t("verified")}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t("confirmPaymentBtn")}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-muted-foreground/60 text-[10px] uppercase tracking-wider font-medium">
              {t("autoVerificationSystem")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
