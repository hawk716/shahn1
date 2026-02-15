import { NextResponse } from "next/server"
import { createUser, getUserByUsername, getUserByEmail, createEmailVerification } from "@/lib/db-json"
import { hashPassword } from "@/lib/password"
import { sendVerificationEmail } from "@/lib/email-service-gmail"

export async function POST(request: Request) {
  try {
    const { username, email, password, language } = await request.json()

    // الحصول على الرابط الأساسي الديناميكي من headers الطلب
    const protocol = request.headers.get('x-forwarded-proto') || request.headers.get('x-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    console.log('[v0] BASE URL DETECTION:', { protocol, host, baseUrl });

    // التحقق من المدخلات
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "البريد والمستخدم وكلمة المرور مطلوبة" },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      )
    }

    // التحقق من صيغة البريد
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "صيغة البريد غير صحيحة" },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود المستخدم سابقاً
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم مستخدم بالفعل" },
        { status: 409 }
      )
    }

    // التحقق من عدم وجود البريد سابقاً
    const existingEmail = await getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "هذا البريد مستخدم بالفعل" },
        { status: 409 }
      )
    }

    // إنشاء المستخدم
    const hash = await hashPassword(password)
    const user = await createUser(username, hash, email, "user")

    // إنشاء رمز التحقق
    const verification = await createEmailVerification(user.id, email)

    // بناء رابط التحقق باستخدام الدومين الديناميكي
    const verificationUrl = `${baseUrl}/verify-email?token=${verification.token}`

    console.log('[v0] USER CREATED:', { id: user.id, username, email });
    console.log('[v0] VERIFICATION TOKEN:', verification.token);
    console.log('[v0] VERIFICATION URL:', verificationUrl);

    // إرسال البريد مع اكتشاف اللغة تلقائياً
    const detectedLanguage = language === 'ar' ? 'ar' : 'en'
    console.log('[v0] DETECTED LANGUAGE:', detectedLanguage);
    
    const emailResult = await sendVerificationEmail({
      to: email,
      username,
      verificationLink: verificationUrl,
      language: detectedLanguage,
    })

    console.log('[v0] EMAIL RESULT:', emailResult);

    if (!emailResult.success) {
      console.error("[v0] Email sending failed:", emailResult.error)
      // نرسل نجاح رغم فشل البريد (للاختبار المحلي)
      // في الإنتاج، قد تريد رفع خطأ
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني",
      userId: user.id,
    })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    )
  }
}
