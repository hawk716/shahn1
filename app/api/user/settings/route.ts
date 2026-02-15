import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getSetting, setSetting, getUserById, updateUserCallbackUrl, runQuerySingle, runUpdate } from "@/lib/db-json"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserById(session.id)

    return NextResponse.json({
      success: true,
      data: {
        callback_url: user?.callback_url || "",
      },
    })
  } catch (error) {
    console.error("user settings GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { callback_url } = await request.json()
    await updateUserCallbackUrl(session.id, callback_url || "")

    return NextResponse.json({ success: true, message: "Settings updated" })
  } catch (error) {
    console.error("user settings PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
