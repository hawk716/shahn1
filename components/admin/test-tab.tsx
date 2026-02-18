"use client"

import { useState } from "react"
import { Send, Loader2, Plus, Link2, KeyRound, Hash } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function TestTab() {
  const { t } = useLocale()

  const [apiKey, setApiKey] = useState("")
  
  const [rawMessage, setRawMessage] = useState(
    "-> com.motorola.messaging:04-02-2026 12:36:48 - Jaib - اضيف 100ر.ي ... من مهند الرزامي-711973018"
  )
  const [ingestResult, setIngestResult] = useState<string>("")
  const [ingestLoading, setIngestLoading] = useState(false)

  const [verifyName, setVerifyName] = useState("مهند الرزامي")
  const [verifyAmount, setVerifyAmount] = useState("100")
  const [verifyApp, setVerifyApp] = useState("Jaib")
  const [verifyRef, setVerifyRef] = useState("test-ref-123")
  const [verifyResult, setVerifyResult] = useState<string>("")
  const [verifyLoading, setVerifyLoading] = useState(false)

  const [pageName, setPageName] = useState("مهند الرزامي-711973018")
  const [pageAmount, setPageAmount] = useState("100")
  const [pageApp, setPageApp] = useState("Jaib")
  const [pageRef, setPageRef] = useState("page-ref-456")
  const [pageResult, setPageResult] = useState<string>("")
  const [pageLoading, setPageLoading] = useState(false)

  async function handleIngest() {
    setIngestLoading(true)
    try {
      const res = await fetch("/api/ingest-messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: rawMessage }),
      })
      const data = await res.json()
      setIngestResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setIngestResult(`Error: ${err}`)
    } finally {
      setIngestLoading(false)
    }
  }

  async function handleVerify() {
    setVerifyLoading(true)
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey 
        },
        body: JSON.stringify({ 
          name: verifyName, 
          amount: parseFloat(verifyAmount), 
          app: verifyApp,
          payment_ref: verifyRef
        }),
      })
      const data = await res.json()
      setVerifyResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setVerifyResult(`Error: ${err}`)
    } finally {
      setVerifyLoading(false)
    }
  }

  async function handleCreatePage() {
    setPageLoading(true)
    try {
      const res = await fetch("/api/create-payment-page", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey 
        },
        body: JSON.stringify({ 
          name: pageName, 
          amount: pageAmount, 
          app: pageApp,
          payment_ref: pageRef
        }),
      })
      const data = await res.json()
      setPageResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setPageResult(`Error: ${err}`)
    } finally {
      setPageLoading(false)
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
  const labelClass = "block text-muted-foreground text-xs mb-1.5"
  const btnClass =
    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* API Key Configuration */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("apiKey")}</h2>
        </div>
        <div className="p-4">
          <label className={labelClass}>{t("apiKey")}</label>
          <input 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            className={`${inputClass} font-mono`} 
            placeholder="أدخل مفتاح API للاختبار..."
            dir="ltr"
          />
          <p className="text-muted-foreground/60 text-xs mt-1">{t("apiKeyHint")}</p>
        </div>
      </div>

      {/* Ingest Messages */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Plus className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("ingestMessage")}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className={labelClass}>{t("rawTelegramMessage")}</label>
            <textarea
              value={rawMessage}
              onChange={(e) => setRawMessage(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none font-mono text-xs`}
              dir="auto"
            />
          </div>
          <button onClick={handleIngest} disabled={ingestLoading} className={btnClass}>
            {ingestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t("ingest")}
          </button>
          {ingestResult && (
            <pre className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground overflow-x-auto" dir="ltr">
              {ingestResult}
            </pre>
          )}
        </div>
      </div>

      {/* Verify Payment */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Send className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("verifyPayment")}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>{t("name")}</label>
              <input value={verifyName} onChange={(e) => setVerifyName(e.target.value)} className={inputClass} dir="auto" />
            </div>
            <div>
              <label className={labelClass}>{t("amount")}</label>
              <input value={verifyAmount} onChange={(e) => setVerifyAmount(e.target.value)} className={inputClass} type="number" />
            </div>
            <div>
              <label className={labelClass}>{t("app")}</label>
              <input value={verifyApp} onChange={(e) => setVerifyApp(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("paymentRef")}</label>
              <input value={verifyRef} onChange={(e) => setVerifyRef(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button onClick={handleVerify} disabled={verifyLoading} className={btnClass}>
            {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t("verify")}
          </button>
          {verifyResult && (
            <pre className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground overflow-x-auto" dir="ltr">
              {verifyResult}
            </pre>
          )}
        </div>
      </div>

      {/* Create Payment Page */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-sm">{t("createPaymentPage")}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>{t("senderName")}</label>
              <input value={pageName} onChange={(e) => setPageName(e.target.value)} className={inputClass} dir="auto" />
            </div>
            <div>
              <label className={labelClass}>{t("amount")}</label>
              <input value={pageAmount} onChange={(e) => setPageAmount(e.target.value)} className={inputClass} type="number" />
            </div>
            <div>
              <label className={labelClass}>{t("app")}</label>
              <input value={pageApp} onChange={(e) => setPageApp(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("paymentRef")}</label>
              <input value={pageRef} onChange={(e) => setPageRef(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button onClick={handleCreatePage} disabled={pageLoading} className={btnClass}>
            {pageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {t("create")}
          </button>
          {pageResult && (
            <pre className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground overflow-x-auto" dir="ltr">
              {pageResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
