import { NextRequest, NextResponse } from "next/server"
import { createPaymentPage } from "@/lib/db-json"
import { validateApiKey } from "@/lib/api-auth"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth.valid) return auth.response

  try {
    const body = await request.json()
    const { name, amount, app, payment_ref } = body

    if (!name || !amount || !app || !payment_ref) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, amount, app, payment_ref" },
        { status: 400 }
      )
    }

    const pageId = randomUUID()
    const userId = auth.user.id as number

    await createPaymentPage({
      id: pageId,
      sender_name: name,
      amount: parseFloat(amount),
      app_name: app,
      payment_ref,
      user_id: userId,
    })

    const baseUrl = request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`
        : "http://localhost:3000"

    const paymentUrl = `${baseUrl}/pay/${pageId}`

    return NextResponse.json({
      success: true,
      data: {
        page_id: pageId,
        payment_url: paymentUrl,
        name,
        amount: parseFloat(amount),
        app,
        payment_ref,
      },
    })
  } catch (error) {
    console.error("create-payment-page error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
