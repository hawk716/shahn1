import { NextRequest, NextResponse } from "next/server"
import { getAllUsers, createUser, deleteUser } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"
import { hashPassword } from "@/lib/password"

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const users = await getAllUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error("admin users GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const { username, password, role } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Missing username or password" }, { status: 400 })
    }

    const hash = await hashPassword(password)
    const user = await createUser(username, hash, role || "user")
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("admin users POST error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get("id") || "0")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user id" }, { status: 400 })
    }

    await deleteUser(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("admin users DELETE error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
