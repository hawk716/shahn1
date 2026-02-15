import { NextRequest, NextResponse } from "next/server"
import { getPayments } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const payments = await getPayments()

    return NextResponse.json({
      success: true,
      data: payments,
    })
  } catch (error) {
    console.error("payments GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
