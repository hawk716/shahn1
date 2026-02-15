import { NextResponse } from "next/server"
import { getSetting, setSetting } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const exchangeRate = await getSetting("exchange_rate")

    return NextResponse.json({
      success: true,
      data: {
        exchange_rate: parseFloat(exchangeRate || "10"),
      },
    })
  } catch (error) {
    console.error("settings GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { exchange_rate } = body

    if (exchange_rate !== undefined) {
      await setSetting("exchange_rate", String(exchange_rate))
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated",
    })
  } catch (error) {
    console.error("settings PUT error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
