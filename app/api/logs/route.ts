import { NextRequest, NextResponse } from "next/server"
import { getVerificationLogs } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const logs = await getVerificationLogs(limit, offset)

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { limit, offset },
    })
  } catch (error) {
    console.error("logs GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
