import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getUserStats } from "@/lib/db-json"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const stats = await getUserStats(session.id)
    return NextResponse.json({ success: true, data: { ...stats, balance: session.balance, api_key: session.api_key } })
  } catch (error) {
    console.error("user stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
