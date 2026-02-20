"use client"

import { BookOpen, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"

interface ApiDocsPageProps {
  apiKey: string
}

export function ApiDocsPage({ apiKey }: ApiDocsPageProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)
  const { t } = useLocale()

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
  "app": "Jaib",
  "payment_ref": "order_12345"
}`

  const curlExample = `curl -X POST ${baseUrl}/api/verify-payment \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "name": "محمد احمد",
    "amount": 500,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <h1 className="text-foreground text-lg sm:text-xl font-bold">{t("apiDocumentation")}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{t("apiDocsIntro")}</p>
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
                    <td className="px-3 py-2 font-mono text-foreground">app</td>
                    <td className="px-3 py-2 text-muted-foreground">string</td>
                    <td className="px-3 py-2"><span className="text-red-500 text-xs font-medium">required</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{t("paramApp")}</td>
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

      {/* Callback Info */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-sm">Callback (Webhook)</h2>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-muted-foreground text-sm">
            عند استخدام رابط الدفع، سيقوم نظامنا بإرسال طلب POST تلقائياً إلى رابط الـ Callback الخاص بك لإبلاغ سيرفرك بنتيجة العملية.
          </p>
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
    </div>
  )
}
