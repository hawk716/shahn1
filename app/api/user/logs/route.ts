import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getLogsByUserId } from "@/lib/db-json"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const logs = await getLogsByUserId(session.id)
    return NextResponse.json({ success: true, data: logs })
  } catch (error) {
    console.error("user logs error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
