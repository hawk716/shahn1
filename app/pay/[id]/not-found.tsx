"use client"

import Link from "next/link"
import { XCircle } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Toolbar } from "@/components/toolbar"

export default function PaymentNotFound() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <Toolbar />
        </div>
        <div className="bg-card border border-border rounded-2xl p-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-foreground text-lg font-semibold mb-2">
            {t("pageNotFound")}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t("pageExpired")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl 
              bg-primary text-primary-foreground font-semibold text-sm
              hover:bg-primary/90 transition-all"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
