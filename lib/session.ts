import { cookies } from "next/headers"
import { getUserById, createSessionRecord, getSessionByToken } from "./db-json"

const SESSION_COOKIE = "session_token"
const ADMIN_COOKIE = "admin_session"

// Simple hash-based session (no external deps needed)
function encodeSession(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, ts: Date.now() })
  return Buffer.from(payload).toString("base64url")
}

function decodeSession(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString())
    if (!payload.userId) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export async function createSession(userId: number, role: string) {
  const token = encodeSession(userId, role)
  const jar = await cookies()
  
  // احفظ الجلسة في JSON قاعدة البيانات أيضاً
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days
  
  try {
    await createSessionRecord(userId, token, expiresAt)
  } catch (err) {
    console.error("[v0] Failed to save session to database:", err)
  }
  
  // دائماً احفظ الـ user session في cookies
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  // إذا كان admin، احفظ أيضاً admin cookie
  if (role === "admin") {
    jar.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
  }
  
  return token
}

export async function getSession() {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value
    if (!token) return null
    const session = decodeSession(token)
    if (!session) return null
    const user = await getUserById(session.userId)
    if (!user) return null
    return { id: user.id, username: user.username, role: user.role, balance: Number(user.balance), api_key: user.api_key }
  } catch (error) {
    console.error("[v0] Session error:", error)
    return null
  }
}

export async function getAdminSession() {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = decodeSession(token)
    if (!session || session.role !== "admin") return null
    const user = await getUserById(session.userId)
    if (!user || user.role !== "admin") return null
    return { id: user.id, username: user.username, role: user.role }
  } catch (error) {
    console.error("[v0] Admin session error:", error)
    return null
  }
}

export async function destroySession(role: string = "user") {
  const jar = await cookies()
  const cookieName = role === "admin" ? ADMIN_COOKIE : SESSION_COOKIE
  jar.delete(cookieName)
}
