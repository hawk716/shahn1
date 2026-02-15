import { NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/db-json"
import { createSession } from "@/lib/session"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // الحصول على الرابط الأساسي الديناميكي
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    console.log('[v0] VERIFY EMAIL - BASE URL:', baseUrl)

    if (!token) {
      return NextResponse.redirect(new URL("/verify-email?error=no-token", baseUrl))
    }

    // التحقق من الرمز وتحديث المستخدم
    const user = await verifyEmailToken(token)

    if (!user) {
      return NextResponse.redirect(new URL("/verify-email?error=invalid-token", baseUrl))
    }

    // إنشاء جلسة للمستخدم
    await createSession(user.id, "user")

    console.log('[v0] Email verified successfully for user:', user.id)

    // إعادة التوجيه إلى الصفحة الرئيسية
    return NextResponse.redirect(new URL("/", baseUrl))
  } catch (err) {
    console.error("Email verification error:", err)
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    return NextResponse.redirect(new URL("/verify-email?error=server-error", baseUrl))
  }
}

