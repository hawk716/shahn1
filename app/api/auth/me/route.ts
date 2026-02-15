import { NextResponse } from "next/server"
import { getSession, getAdminSession } from "@/lib/session"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const portal = url.searchParams.get("portal")

  try {
    if (portal === "admin") {
      const admin = await getAdminSession()
      if (!admin) return NextResponse.json({ authenticated: false }, { status: 401 })
      return NextResponse.json({ authenticated: true, user: admin })
    }

    const user = await getSession()
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 })
    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
