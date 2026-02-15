import { getPaymentPage } from "@/lib/db-json"
import { notFound } from "next/navigation"
import { PaymentPageClient } from "@/components/payment-page-client"

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params

  const page = await getPaymentPage(id)

  if (!page) {
    notFound()
  }

  return (
    <PaymentPageClient
      pageId={page.id}
      senderName={page.sender_name}
      amount={parseFloat(page.amount)}
      appName={page.app_name}
      status={page.status}
    />
  )
}
