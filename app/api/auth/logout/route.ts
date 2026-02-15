import { NextResponse } from "next/server"
import { destroySession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const { portal } = await request.json().catch(() => ({ portal: "user" }))
    await destroySession(portal === "admin" ? "admin" : "user")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
