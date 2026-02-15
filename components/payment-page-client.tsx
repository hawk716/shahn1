"use client"

import { useState } from "react"
import { Shield, CheckCircle2, XCircle, Loader2, CreditCard, User, Banknote, Smartphone } from "lucide-react"
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
  senderName,
  amount,
  appName,
  status: initialStatus,
}: PaymentPageClientProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult>(null)
  const [status, setStatus] = useState(initialStatus)
  const { t } = useLocale()

  async function handleVerify() {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/page-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: pageId }),
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
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-border via-foreground/20 to-border" />

          {/* Header */}
          <div className="p-6 pb-4 flex items-center gap-3 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary border border-border">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-foreground text-lg font-semibold">
                {t("confirmPayment")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("verifyingTransfer")}
              </p>
            </div>
          </div>

          {/* Payment details */}
          <div className="p-6 space-y-4">
            {/* Sender */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs">{t("senderNameLabel")}</p>
                <p className="text-foreground text-sm font-semibold truncate">
                  {senderName}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary">
                <Banknote className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs">{t("amountLabel")}</p>
                <p className="text-foreground text-sm font-semibold">
                  {amount.toLocaleString()} {t("yer")}
                </p>
              </div>
            </div>

            {/* App */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs">{t("paymentApp")}</p>
                <p className="text-foreground text-sm font-semibold">
                  {appName}
                </p>
              </div>
            </div>
          </div>

          {/* Result display */}
          {result && (
            <div className="px-6 pb-4">
              {result.success ? (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-green-500 font-semibold text-sm">
                      {t("verifiedSuccessfully")}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {t("creditedBalance")}:{" "}
                      <span className="text-foreground font-semibold">
                        {result.data?.credited_balance?.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {t("exchangeRateLabel")}:{" "}
                      <span className="text-foreground">
                        {result.data?.exchange_rate}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-500 font-semibold text-sm">
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
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-green-500 font-semibold text-sm">
                  {t("alreadyVerified")}
                </p>
              </div>
            ) : (
              <button
                onClick={handleVerify}
                disabled={loading || (result?.success === true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                  bg-primary text-primary-foreground font-semibold text-sm
                  hover:bg-primary/90 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("verifying")}
                  </>
                ) : result?.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {t("verified")}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {t("confirmPaymentBtn")}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-4 text-center">
            <p className="text-muted-foreground/60 text-xs">
              {t("autoVerificationSystem")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
