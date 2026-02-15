import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/db-json"
import { verifyPassword } from "@/lib/password"
import { createSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const { username, password, portal } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 400 })
    }

    console.log("[v0] Login attempt for user:", username)
    const user = await getUserByUsername(username)
    console.log("[v0] User found:", user ? "yes" : "no")
    
    if (!user) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // التحقق من أن البريد موثق
    if (!user.email_verified) {
      return NextResponse.json({ 
        success: false, 
        error: "يجب التحقق من بريدك الإلكتروني أولاً" 
      }, { status: 403 })
    }

    // If portal is admin, check role
    if (portal === "admin" && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    await createSession(user.id, user.role)

    return NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        balance: Number(user.balance),
        api_key: user.api_key || ""
      },
    })
  } catch (err) {
    console.error("[v0] Login error:", err)
    return NextResponse.json({ success: false, error: `Server error: ${err instanceof Error ? err.message : 'Unknown'}` }, { status: 500 })
  }
}
