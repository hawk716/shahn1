import { NextRequest, NextResponse } from "next/server"
import { createPaymentPage } from "@/lib/db-json"
import { validateApiKey } from "@/lib/api-auth"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth.valid) return auth.response

  try {
    const body = await request.json()
    const { payment_ref } = body

    if (!payment_ref) {
      return NextResponse.json(
        { success: false, error: "Missing required field: payment_ref" },
        { status: 400 }
      )
    }

    const pageId = randomUUID()
    const userId = auth.user.id as number

    // Create a "blank" payment page that only has the payment_ref and user_id
    // The user will fill in name, amount, and app later on the page itself
    await createPaymentPage({
      id: pageId,
      sender_name: "", // Will be filled by user
      amount: 0,       // Will be filled by user
      app_name: "",    // Will be filled by user
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
