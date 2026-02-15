import { NextResponse } from "next/server"
import { getAdminStats } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const stats = await getAdminStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("admin stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
