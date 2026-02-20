import { NextRequest, NextResponse } from "next/server"
import {
  getPaymentPage,
  updatePaymentPageStatus,
  findUnusedPayment,
  markPaymentUsed,
  getSetting,
  logVerification,
  updatePaymentPageData,
  getUserById,
} from "@/lib/db-json"

/**
 * POST /api/page-verify
 * Internal verification endpoint used by payment pages.
 * Validates against the payment page ID instead of an API key.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_id, name, amount, app } = body

    if (!page_id) {
      return NextResponse.json(
        { success: false, error: "Missing page_id" },
        { status: 400 }
      )
    }

    // Get the payment page details
    const page = await getPaymentPage(page_id)

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Payment page not found" },
        { status: 404 }
      )
    }

    if (page.status === "completed") {
      return NextResponse.json(
        { success: false, error: "This payment has already been verified" },
        { status: 409 }
      )
    }

    // Get user to get callback_url
    const user = await getUserById(page.user_id)
    const callbackUrl = user?.callback_url || ""

    // If name, amount, or app are provided, update the page data first
    let finalName = page.sender_name || name
    let finalAmount = page.amount || amount
    let finalApp = page.app_name || app

    if (name || amount || app) {
      await updatePaymentPageData(page_id, {
        sender_name: finalName,
        amount: finalAmount,
        app_name: finalApp,
      })
    }

    if (!finalName || !finalAmount || !finalApp) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, amount, app" },
        { status: 400 }
      )
    }

    // Search for unused matching payment
    const payment = await findUnusedPayment(finalName, parseFloat(finalAmount), finalApp)

    if (!payment) {
      const failureReason = "No matching unused payment found (via payment page)"
      await logVerification({
        requested_name: finalName,
        requested_amount: parseFloat(finalAmount),
        requested_app: finalApp,
        matched_payment_id: null,
        success: false,
        failure_reason: failureReason,
        credited_balance: null,
        api_key_used: `page:${page_id}`,
        user_id: page.user_id,
        payment_ref: page.payment_ref,
      })

      // Send failure callback if configured
      if (callbackUrl) {
        try {
          await fetch(callbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "payment_failed",
              payment_ref: page.payment_ref,
              page_id: page_id,
              error: failureReason,
              sender_name: finalName,
              amount: parseFloat(finalAmount),
              app_name: finalApp,
              timestamp: new Date().toISOString(),
            }),
          })
        } catch (e) {
          console.error("Failure callback failed:", e)
        }
      }

      return NextResponse.json({
        success: false,
        error: "Payment not found yet. Please make the transfer first, then try again.",
      })
    }

    // Mark payment as used
    await markPaymentUsed(payment.id, page.user_id, page.payment_ref)

    // Update page status
    await updatePaymentPageStatus(page_id, "completed")

    // Calculate balance
    const exchangeRateStr = await getSetting("exchange_rate")
    const exchangeRate = parseFloat(exchangeRateStr || "10")
    const creditedBalance = parseFloat(finalAmount) * exchangeRate

    // Log success
    await logVerification({
      requested_name: finalName,
      requested_amount: parseFloat(finalAmount),
      requested_app: finalApp,
      matched_payment_id: payment.id,
      success: true,
      failure_reason: null,
      credited_balance: creditedBalance,
      api_key_used: `page:${page_id}`,
      user_id: page.user_id,
      payment_ref: page.payment_ref,
    })

    // Send success callback if configured
    if (callbackUrl) {
      try {
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "payment_verified",
            payment_ref: page.payment_ref,
            payment_id: payment.id,
            page_id: page_id,
            amount: parseFloat(finalAmount),
            credited_balance: creditedBalance,
            sender_name: finalName,
            app_name: finalApp,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (e) {
        console.error("Success callback failed:", e)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment_id: payment.id,
        sender_name: payment.sender_name,
        amount: payment.amount,
        app_name: payment.app_name,
        credited_balance: creditedBalance,
        exchange_rate: exchangeRate,
      },
    })
  } catch (error) {
    console.error("page-verify error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
