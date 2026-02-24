"use client"

import { BookOpen, Copy, CheckCircle2, Info, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocale } from "@/lib/locale-context"

interface ApiDocsPageProps {
  apiKey: string
}

interface AppData {
  app_name: string
  display_name: string
  limits: {
    min: number
    max: number
  }
  accounts: Array<{
    currency: string
    account_number: string
    account_holder: string
  }>
}

export function ApiDocsPage({ apiKey }: ApiDocsPageProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null)
  const [appsData, setAppsData] = useState<AppData[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch("/apps.json")
        const data = await response.json()
        setAppsData(data)
      } catch (error) {
        console.error("Failed to load apps.json:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedBlock(id)
    setTimeout(() => setCopiedBlock(null), 2000)
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  const createPageExample = `POST ${baseUrl}/api/create-payment-page
Headers:
  Content-Type: application/json
  x-api-key: ${apiKey || "YOUR_API_KEY"}

Body:
{
  "payment_ref": "order_12345"
}`

  const createPageResponse = `{
  "success": true,
  "data": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_url": "${baseUrl}/pay/550e8400-e29b-41d4-a716-446655440000",
    "payment_ref": "order_12345"
  }
}`

  const verifyExample = `POST ${baseUrl}/api/verify-payment
Headers:
  Content-Type: application/json
  x-api-key: ${apiKey || "YOUR_API_KEY"}

Body:
{
  "name": "محمد احمد",
  "amount": 500,
  "currency": "YER-OLD",
  "app": "Jaib",
  "payment_ref": "order_12345"
}`

  const curlExample = `curl -X POST ${baseUrl}/api/verify-payment \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "name": "محمد احمد",
    "amount": 500,
    "currency": "YER-OLD",
    "app": "Jaib",
    "payment_ref": "order_12345"
  }'`

  const jsExample = `const response = await fetch("${baseUrl}/api/verify-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey || "YOUR_API_KEY"}"
  },
  body: JSON.stringify({
    name: "محمد احمد",
    amount: 500,
    currency: "YER-OLD",
    app: "Jaib",
    payment_ref: "order_12345"
  })
});

const data = await response.json();
console.log(data);`

  const pythonExample = `import requests

response = requests.post(
    "${baseUrl}/api/verify-payment",
    json={
        "name": "محمد احمد",
        "amount": 500,
        "currency": "YER-OLD",
        "app": "Jaib",
        "payment_ref": "order_12345"
    },
    headers={
        "Content-Type": "application/json",
        "x-api-key": "${apiKey || "YOUR_API_KEY"}"
    }
)

data = response.json()
print(data)`

  const phpExample = `<?php
$ch = curl_init("${baseUrl}/api/verify-payment");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: ${apiKey || "YOUR_API_KEY"}"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "محمد احمد",
    "amount" => 500,
    "currency" => "YER-OLD",
    "app" => "Jaib",
    "payment_ref" => "order_12345"
]));

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`

  const successResponse = `{
  "success": true,
  "data": {
    "payment_id": 42,
    "payment_ref": "order_12345",
    "sender_name": "محمد احمد",
    "amount": "500.00",
    "currency": "YER-OLD",
    "app_name": "Jaib",
    "date": "2026-02-06",
    "time": "14:30:00",
    "credited_balance": 5000,
    "exchange_rate": 10
  }
}`

  const failResponse = `{
  "success": false,
  "error": "No matching unused payment found",
  "details": {
    "searched_name": "محمد احمد",
    "searched_amount": 500,
    "searched_currency": "YER-OLD",
    "searched_app": "Jaib"
  }
}`

  const callbackExample = `// سيتم إرسال هذا الطلب إلى رابط الـ Callback الخاص بك تلقائياً:
POST your-server.com/webhook

Body (نجاح):
{
  "event": "payment_verified",
  "payment_ref": "order_12345",
  "payment_id": 42,
  "page_id": "550e8400...",
  "amount": 500,
  "currency": "YER-OLD",
  "credited_balance": 5000,
  "sender_name": "محمد احمد",
  "app_name": "Jaib",
  "timestamp": "2026-02-06T14:30:00.000Z"
}

Body (فشل):
{
  "event": "payment_failed",
  "payment_ref": "order_12345",
  "page_id": "550e8400...",
  "error": "No matching unused payment found",
  "sender_name": "محمد احمد",
  "amount": 500,
  "currency": "YER-OLD",
  "app_name": "Jaib",
  "timestamp": "2026-02-06T14:30:00.000Z"
}`

  function CodeBlock({ code, id, label }: { code: string; id: string; label: string }) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 rounded-t-lg border border-border border-b-0">
          <span className="text-muted-foreground text-xs font-medium">{label}</span>
          <button
            onClick={() => copyCode(code, id)}
            className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground transition-colors"
          >
            {copiedBlock === id ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copiedBlock === id ? t("copied") : t("copyKey")}
          </button>
        </div>
        <pre className="p-4 rounded-b-lg bg-background border border-border text-xs font-mono text-muted-foreground overflow-x-auto" dir="ltr">
          {code}
        </pre>
      </div>
    )
  }

  function AppModal({ app, onClose }: { app: AppData; onClose: () => void }) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
            <h2 className="text-xl font-bold text-foreground">{app.display_name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Limits */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">حدود التحويل</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-muted-foreground text-xs mb-1">الحد الأدنى</p>
                  <p className="text-foreground font-bold">{app.limits.min.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-muted-foreground text-xs mb-1">الحد الأقصى</p>
                  <p className="text-foreground font-bold">{app.limits.max.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">الحسابات المتاحة</h3>
              <div className="space-y-3">
                {app.accounts.map((account, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">العملة</p>
                        <p className="text-foreground font-mono font-bold text-sm">{account.currency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs mb-1">رقم الحساب</p>
                        <p className="text-foreground font-mono font-bold text-sm">{account.account_number}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground text-xs mb-1">صاحب الحساب</p>
                      <p className="text-foreground text-sm">{account.account_holder}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("apiDocumentation")}</h1>
            <p className="text-muted-foreground text-sm">{t("apiDocsIntro")}</p>
          </div>
        </div>
      </div>

      {/* Endpoint 1: Create Payment Page */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">1. إنشاء رابط دفع (جديد)</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-mono font-bold">
              POST
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono" dir="ltr">
              /api/create-payment-page
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-medium text-sm mb-2">{t("parameters")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">{t("name")}</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Type</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Required</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">payment_ref</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{t("paramPaymentRef")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <CodeBlock code={createPageExample} id="create-req" label="Request Body" />
            <CodeBlock code={createPageResponse} id="create-res" label="Response (Success)" />
          </div>
        </div>
      </div>

      {/* Endpoint 2: Direct Verification */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">2. {t("verifyPayment")} (Direct API)</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-mono font-bold">
              POST
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono" dir="ltr">
              /api/verify-payment
            </div>
          </div>

          {/* Parameters */}
          <div>
            <h3 className="text-foreground font-medium text-sm mb-2">{t("parameters")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">{t("name")}</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Type</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Required</th>
                    <th className="text-start px-3 py-2 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">name</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{t("paramName")}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">amount</td>
                    <td className="px-3 py-2 text-muted-foreground">number</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{t("paramAmount")}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">currency</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">
                      العملة: <span className="font-mono text-foreground">YER-OLD</span>, <span className="font-mono text-foreground">YER-NEW</span>, <span className="font-mono text-foreground">SAR</span>, <span className="font-mono text-foreground">USD</span>
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">app</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">
                      اسم التطبيق{" "}
                      {!loading && appsData.length > 0 && (
                        <button
                          onClick={() => setSelectedApp(appsData[0])}
                          className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs hover:bg-primary/30 transition-colors"
                        >
                          اعرض التطبيقات
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-foreground">payment_ref</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{t("paramPaymentRef")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-foreground font-medium text-sm mb-2">{t("headers")}</h3>
            <div className="px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm" dir="ltr">
              <span className="text-muted-foreground">x-api-key:</span> <span className="text-foreground">{apiKey || "YOUR_API_KEY"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Reference */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <h2 className="text-foreground font-semibold text-sm">معرفات العملات (Currency Identifiers)</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground text-xs mb-1">الريال اليمني القديم</p>
              <p className="text-foreground font-mono font-bold">YER-OLD</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground text-xs mb-1">الريال اليمني الجديد</p>
              <p className="text-foreground font-mono font-bold">YER-NEW</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground text-xs mb-1">الريال السعودي</p>
              <p className="text-foreground font-mono font-bold">SAR</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground text-xs mb-1">الدولار الأمريكي</p>
              <p className="text-foreground font-mono font-bold">USD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Example */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("requestBody")}</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={verifyExample} id="request" label={t("example")} />
        </div>
      </div>

      {/* Response Examples */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("responseSuccess")}</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={successResponse} id="success" label="200 OK" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("responseFail")}</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={failResponse} id="fail" label="404 Not Found" />
        </div>
      </div>

      {/* Webhook Section - Point 3 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">3. Webhook (Callback)</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-muted-foreground text-sm leading-relaxed">
              يتم إعداد رابط الـ Callback الخاص بك من خلال{" "}
              <a href="/portal?page=settings" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                إعدادات الحساب
              </a>
              ، وسيقوم النظام بالإرسال إليه تلقائياً عند تغيير حالة العملية.
            </p>
          </div>
          <CodeBlock code={callbackExample} id="callback" label="Callback POST" />
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("example")} - cURL</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={curlExample} id="curl" label="cURL" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("example")} - JavaScript</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={jsExample} id="javascript" label="JavaScript / Node.js" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("example")} - Python</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={pythonExample} id="python" label="Python" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">{t("example")} - PHP</h2>
        </div>
        <div className="p-4">
          <CodeBlock code={phpExample} id="php" label="PHP" />
        </div>
      </div>

      {/* App Modal */}
      {selectedApp && <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />}

      {/* Apps List for Quick Reference */}
      {!loading && appsData.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-foreground font-semibold text-sm">التطبيقات المتاحة</h2>
          </div>
          <div className="p-4 space-y-3">
            {appsData.map((app) => (
              <button
                key={app.app_name}
                onClick={() => setSelectedApp(app)}
                className="w-full text-left p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-secondary transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-semibold">{app.display_name}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {app.accounts.length} حساب متاح • الحد الأدنى: {app.limits.min.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-medium">
                    اعرض التفاصيل
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
