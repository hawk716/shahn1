import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { regenerateApiKey } from "@/lib/db-json"

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const newKey = await regenerateApiKey(session.id)
    return NextResponse.json({ success: true, data: { api_key: newKey } })
  } catch (error) {
    console.error("regenerate key error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
