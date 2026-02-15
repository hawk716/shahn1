import { NextRequest, NextResponse } from "next/server"
import {
  findUnusedPayment,
  markPaymentUsed,
  logVerification,
  getSetting,
  updateUserBalance,
  getUserByApiKey,
} from "@/lib/db-json"
import { validateApiKey } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth.valid) return auth.response

  try {
    const body = await request.json()
    const { name, amount, app, payment_ref } = body

    const userId = auth.user.id as number
    const callbackUrl = (auth.user.callback_url as string) || ""

    // Validate input
    if (!name || !amount || !app || !payment_ref) {
      await logVerification({
        requested_name: name || "",
        requested_amount: amount || 0,
        requested_app: app || "",
        matched_payment_id: null,
        success: false,
        failure_reason: "Missing required fields: name, amount, app, payment_ref",
        credited_balance: null,
        api_key_used: auth.apiKey,
        user_id: userId,
        payment_ref: payment_ref || null,
      })
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, amount, app, payment_ref" },
        { status: 400 }
      )
    }

    if (typeof amount !== "number" || amount <= 0) {
      await logVerification({
        requested_name: name,
        requested_amount: amount,
        requested_app: app,
        matched_payment_id: null,
        success: false,
        failure_reason: "Invalid amount: must be a positive number",
        credited_balance: null,
        api_key_used: auth.apiKey,
        user_id: userId,
        payment_ref,
      })
      return NextResponse.json(
        { success: false, error: "Invalid amount: must be a positive number" },
        { status: 400 }
      )
    }

    // Search for unused matching payment
    const payment = await findUnusedPayment(name, amount, app)

    if (!payment) {
      await logVerification({
        requested_name: name,
        requested_amount: amount,
        requested_app: app,
        matched_payment_id: null,
        success: false,
        failure_reason: "No matching unused payment found",
        credited_balance: null,
        api_key_used: auth.apiKey,
        user_id: userId,
        payment_ref,
      })
      return NextResponse.json(
        {
          success: false,
          error: "No matching unused payment found",
          details: {
            searched_name: name,
            searched_amount: amount,
            searched_app: app,
          },
        },
        { status: 404 }
      )
    }

    // Mark as used with user_id and payment_ref
    await markPaymentUsed(payment.id, userId, payment_ref)

    // Calculate balance
    const exchangeRateStr = await getSetting("exchange_rate")
    const exchangeRate = parseFloat(exchangeRateStr || "10")
    const creditedBalance = amount * exchangeRate

    // Credit balance to user
    await updateUserBalance(userId, creditedBalance)

    // Log success
    await logVerification({
      requested_name: name,
      requested_amount: amount,
      requested_app: app,
      matched_payment_id: payment.id,
      success: true,
      failure_reason: null,
      credited_balance: creditedBalance,
      api_key_used: auth.apiKey,
      user_id: userId,
      payment_ref,
    })

    const responseData = {
      success: true,
      data: {
        payment_id: payment.id,
        payment_ref,
        sender_name: payment.sender_name,
        amount: payment.amount,
        app_name: payment.app_name,
        date: payment.date,
        time: payment.time,
        credited_balance: creditedBalance,
        exchange_rate: exchangeRate,
      },
    }

    // Send callback to the user's callback_url if configured
    if (callbackUrl) {
      try {
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "payment_verified",
            payment_ref,
            payment_id: payment.id,
            amount: parseFloat(payment.amount),
            credited_balance: creditedBalance,
            sender_name: payment.sender_name,
            app_name: payment.app_name,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (callbackError) {
        console.error("Callback failed:", callbackError)
        // Don't fail the main response if callback fails
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("verify-payment error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
